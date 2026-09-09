// QA interativo do DOCS-07: exercita o site servido (recomendado `wrangler dev`,
// que aplica os `_headers` reais) num Chrome controlado por CDP com eventos de
// teclado e mouse de verdade, e tira screenshots para inspeção humana.
//
// Cenários: home dark, sidebar das seis áreas + Busca, ToC desktop e mobile,
// deep-link `?q=` na `/busca/`, debounce de 150 ms com digitação real,
// render imediato no submit, tema percebido com persistência, Pagefind no
// modal do Starlight, 404 custom e mobile sem overflow.
//
// Ferramenta de sessão, não etapa do `verify`: depende de um Chrome local e de
// um servidor servindo o `dist/`. Uso:
//   node scripts/qa-interactive.mjs [baseURL] [dirScreenshots]
// Saída: relatório legível + JSON final + PNGs. Exit 0 se todas as sondas
// rodaram (falhas individuais aparecem no campo `ok` de cada cenário).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:8787';
const OUT = process.argv[3] ?? '/tmp/docs07-qa';
const CHROME =
	process.env.CHROME_PATH ??
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(OUT, { recursive: true });

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class Cdp {
	constructor(wsUrl) {
		this.wsUrl = wsUrl;
		this.nextId = 1;
		this.pending = new Map();
		this.eventWaiters = new Map();
	}

	async connect() {
		this.ws = new WebSocket(this.wsUrl);
		await new Promise((resolve, reject) => {
			this.ws.onopen = resolve;
			this.ws.onerror = () => reject(new Error('falha ao conectar no DevTools'));
		});
		this.ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.id && this.pending.has(message.id)) {
				const { resolve, reject } = this.pending.get(message.id);
				this.pending.delete(message.id);
				if (message.error) reject(new Error(message.error.message));
				else resolve(message.result);
				return;
			}
			const waiters = this.eventWaiters.get(message.method) ?? [];
			for (const waiter of waiters) waiter(message.params);
		};
	}

	send(method, params = {}, sessionId) {
		const id = this.nextId++;
		const payload = { id, method, params };
		if (sessionId) payload.sessionId = sessionId;
		this.ws.send(JSON.stringify(payload));
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			setTimeout(() => {
				if (this.pending.has(id)) {
					this.pending.delete(id);
					reject(new Error(`timeout CDP: ${method}`));
				}
			}, 30000);
		});
	}

	waitEvent(method, timeoutMs = 30000) {
		return new Promise((resolve) => {
			const waiter = (params) => {
				const waiters = this.eventWaiters.get(method) ?? [];
				this.eventWaiters.set(
					method,
					waiters.filter((w) => w !== waiter),
				);
				clearTimeout(timer);
				resolve(params);
			};
			const timer = setTimeout(() => {
				const waiters = this.eventWaiters.get(method) ?? [];
				this.eventWaiters.set(
					method,
					waiters.filter((w) => w !== waiter),
				);
				resolve(null);
			}, timeoutMs);
			const waiters = this.eventWaiters.get(method) ?? [];
			waiters.push(waiter);
			this.eventWaiters.set(method, waiters);
		});
	}

	close() {
		this.ws.close();
	}
}

async function launchChrome() {
	const child = spawn(
		CHROME,
		[
			'--headless=new',
			'--remote-debugging-port=0',
			'--no-first-run',
			'--no-default-browser-check',
			'--window-size=1280,800',
			`--user-data-dir=/tmp/epico-docs-qa-${process.pid}`,
			'about:blank',
		],
		{ stdio: ['ignore', 'pipe', 'pipe'] },
	);

	const wsUrl = await new Promise((resolve, reject) => {
		let buffer = '';
		const timer = setTimeout(
			() => reject(new Error('Chrome não abriu o DevTools em 15 s')),
			15000,
		);
		const onData = (chunk) => {
			buffer += chunk;
			const match = /DevTools listening on (ws:\/\/\S+)/.exec(buffer);
			if (match) {
				clearTimeout(timer);
				resolve(match[1]);
			}
		};
		child.stderr.on('data', onData);
		child.stdout.on('data', onData);
	});

	return { child, wsUrl };
}

async function evaluate(cdp, sessionId, expression) {
	const result = await cdp.send(
		'Runtime.evaluate',
		{ expression, returnByValue: true },
		sessionId,
	);
	if (result.exceptionDetails) {
		throw new Error(`avaliação falhou: ${result.exceptionDetails.text}`);
	}
	return result.result.value;
}

async function navigate(cdp, sessionId, url, settleMs) {
	const loaded = cdp.waitEvent('Page.loadEventFired');
	await cdp.send('Page.navigate', { url }, sessionId);
	await loaded;
	await sleep(settleMs);
	await evaluate(cdp, sessionId, 'document.fonts.ready.then(() => true)');
}

async function screenshot(cdp, sessionId, name) {
	const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
	const file = join(OUT, name);
	writeFileSync(file, Buffer.from(data, 'base64'));
	return file;
}

// Tecla de texto: keyDown carregando `text` gera o caractere no elemento focado.
async function pressChar(cdp, sessionId, char) {
	const upper = char.toUpperCase();
	await cdp.send(
		'Input.dispatchKeyEvent',
		{
			type: 'keyDown',
			key: char,
			code: `Key${upper}`,
			text: char,
			windowsVirtualKeyCode: upper.charCodeAt(0),
		},
		sessionId,
	);
	await cdp.send(
		'Input.dispatchKeyEvent',
		{
			type: 'keyUp',
			key: char,
			code: `Key${upper}`,
			windowsVirtualKeyCode: upper.charCodeAt(0),
		},
		sessionId,
	);
}

async function pressKey(cdp, sessionId, key, code, virtualKeyCode, text) {
	await cdp.send(
		'Input.dispatchKeyEvent',
		{ type: 'keyDown', key, code, windowsVirtualKeyCode: virtualKeyCode, ...(text ? { text } : {}) },
		sessionId,
	);
	await cdp.send(
		'Input.dispatchKeyEvent',
		{ type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKeyCode },
		sessionId,
	);
}

// Enter de verdade: sem `text: '\r'` o Chrome não roda o comportamento default
// (submit implícito do form) com eventos sintéticos do CDP.
async function pressEnter(cdp, sessionId) {
	await pressKey(cdp, sessionId, 'Enter', 'Enter', 13, '\r');
}

async function typeText(cdp, sessionId, text, perKeyMs) {
	for (const char of text) {
		await pressChar(cdp, sessionId, char);
		await sleep(perKeyMs);
	}
}

// Clique real por coordenada do centro do elemento (getBoundingClientRect).
async function clickSelector(cdp, sessionId, selector) {
	const rect = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const el = document.querySelector(${JSON.stringify(selector)});
			if (!el) return null;
			const r = el.getBoundingClientRect();
			return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
		})()`,
	);
	if (rect === null) throw new Error(`elemento não encontrado: ${selector}`);
	const { x, y } = JSON.parse(rect);
	await cdp.send(
		'Input.dispatchMouseEvent',
		{ type: 'mousePressed', x, y, button: 'left', clickCount: 1 },
		sessionId,
	);
	await cdp.send(
		'Input.dispatchMouseEvent',
		{ type: 'mouseReleased', x, y, button: 'left', clickCount: 1 },
		sessionId,
	);
}

const report = { base: BASE, out: OUT, cenarios: {} };

const { child: chrome, wsUrl } = await launchChrome();
const cdp = new Cdp(wsUrl);
await cdp.connect();

try {
	const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
	const { sessionId } = await cdp.send('Target.attachToTarget', {
		targetId,
		flatten: true,
	});
	await cdp.send('Page.enable', {}, sessionId);
	await cdp.send('Runtime.enable', {}, sessionId);

	// ── 1. Home em dark (padrão) ────────────────────────────────────────────
	await navigate(cdp, sessionId, `${BASE}/`, 2500);
	report.cenarios.home = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const h1 = document.querySelector('h1');
			return JSON.stringify({
				tema: document.documentElement.dataset.theme ?? '(padrão dark)',
				fundo: getComputedStyle(document.body).backgroundColor,
				titulo: h1 ? h1.textContent.trim() : null,
				fonteH1: h1 ? getComputedStyle(h1).fontFamily : null,
				skipLink: document.querySelector('a.sl-skip-link')?.textContent.trim() ?? null,
			});
		})()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '01-home-dark.png');
	console.log(`home: tema=${report.cenarios.home.tema} fundo=${report.cenarios.home.fundo} h1="${report.cenarios.home.titulo}" skipLink="${report.cenarios.home.skipLink}"`);

	// ── 2. Sidebar: seis áreas + link Busca ────────────────────────────────
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2000);
	report.cenarios.sidebar = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const sidebar = document.querySelector('#starlight__sidebar');
			if (!sidebar) return JSON.stringify({ ok: false, motivo: 'sidebar ausente' });
			// Grupos no Starlight 0.42: summary > .group-label > .large.
			const grupos = [...sidebar.querySelectorAll('summary .group-label .large')].map((s) => s.textContent.trim());
			const links = [...sidebar.querySelectorAll('a')].map((a) => a.textContent.trim());
			return JSON.stringify({
				ok: true,
				grupos,
				linkBusca: links.includes('Busca'),
				totalLinks: links.length,
			});
		})()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '02-pagina-sidebar.png');
	console.log(`sidebar: grupos=[${report.cenarios.sidebar.grupos?.join(', ')}] linkBusca=${report.cenarios.sidebar.linkBusca}`);

	// ── 3. ToC desktop e mobile num artigo com seções ───────────────────────
	await navigate(cdp, sessionId, `${BASE}/dominio-e-publicacao/conecte-seu-dominio/`, 2000);
	report.cenarios.toc = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const toc = document.querySelector('starlight-toc');
			const mobile = document.querySelector('#starlight__mobile-toc');
			// O ToC inclui a âncora #_top ("Visão geral") além das seções.
			const ancoras = toc ? [...toc.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [];
			const esperadas = ['#_top', ...[...document.querySelectorAll('main h2[id]')].map((h) => '#' + h.id)];
			return JSON.stringify({
				tocDesktop: !!toc,
				ancorasToc: ancoras.length,
				ancorasEsperadas: esperadas.length,
				ancorasBatem: JSON.stringify(ancoras) === JSON.stringify(esperadas),
				tocMobile: !!mobile,
				mobileEhDetails: mobile ? mobile.tagName === 'DETAILS' : false,
			});
		})()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '03-artigo-toc.png');
	console.log(`toc: desktop=${report.cenarios.toc.tocDesktop} âncoras=${report.cenarios.toc.ancorasToc}/${report.cenarios.toc.ancorasEsperadas} batem=${report.cenarios.toc.ancorasBatem} mobile=${report.cenarios.toc.tocMobile} (details=${report.cenarios.toc.mobileEhDetails})`);

	// ── 4. Deep-link ?q= na /busca/ ─────────────────────────────────────────
	await navigate(cdp, sessionId, `${BASE}/busca/?q=dominio`, 2500);
	await evaluate(
		cdp,
		sessionId,
		`(() => {
			const input = document.getElementById('busca-consulta');
			const wait = new Promise((resolve) => {
				if (input && !input.disabled) return resolve(true);
				const obs = new MutationObserver(() => {
					if (input && !input.disabled) { obs.disconnect(); resolve(true); }
				});
				obs.observe(document.body, { attributes: true, subtree: true });
				setTimeout(() => { obs.disconnect(); resolve(false); }, 8000);
			});
			return wait.then(() => new Promise((r) => setTimeout(() => r(true), 400)));
		})()`,
		undefined,
	).catch(() => {});
	report.cenarios.deepLink = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const input = document.getElementById('busca-consulta');
			const resultados = [...document.querySelectorAll('#busca-resultados li a')].map((a) => ({
				texto: a.textContent.trim(),
				url: a.getAttribute('href'),
			}));
			return JSON.stringify({
				inputHabilitado: !!input && !input.disabled,
				consulta: input ? input.value : null,
				urlMantida: location.search,
				resultados: resultados.length,
				primeiro: resultados[0] ?? null,
				status: document.querySelector('[data-busca-status]')?.textContent.trim() ?? null,
				areasNoHtml: [...document.querySelectorAll('section[aria-labelledby="busca-areas"] a')].length,
			});
		})()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '04-busca-deeplink.png');
	console.log(`deep-link: consulta="${report.cenarios.deepLink.consulta}" resultados=${report.cenarios.deepLink.resultados} url=${report.cenarios.deepLink.urlMantida} status="${report.cenarios.deepLink.status}"`);

	// ── 5. Debounce: digitação real, renders contados por MutationObserver ──
	await navigate(cdp, sessionId, `${BASE}/busca/`, 2500);
	await evaluate(
		cdp,
		sessionId,
		`(() => {
			const input = document.getElementById('busca-consulta');
			const wait = new Promise((resolve) => {
				if (input && !input.disabled) return resolve(true);
				const obs = new MutationObserver(() => {
					if (input && !input.disabled) { obs.disconnect(); resolve(true); }
				});
				obs.observe(document.body, { attributes: true, subtree: true });
				setTimeout(() => { obs.disconnect(); resolve(false); }, 8000);
			});
			return wait.then(() => new Promise((r) => setTimeout(() => r(true), 500)));
		})()`,
		undefined,
	).catch(() => {});
	await evaluate(
		cdp,
		sessionId,
		`(() => {
			window.__keyTimes = [];
			window.__submits = [];
			window.__renderLevas = [];
			const alvo = document.getElementById('busca-resultados');
			const mo = new MutationObserver(() => {
				const t = performance.now();
				const ultima = window.__renderLevas[window.__renderLevas.length - 1];
				if (ultima === undefined || t - ultima.t > 50) window.__renderLevas.push({ t });
				else ultima.t = t;
			});
			mo.observe(alvo, { childList: true });
			document.getElementById('busca-consulta')
				.addEventListener('input', () => window.__keyTimes.push(performance.now()));
			document.querySelector('[data-busca-form]')
				.addEventListener('submit', () => window.__submits.push(performance.now()));
			document.getElementById('busca-consulta').focus();
			return true;
		})()`,
	);
	// Digitação mais rápida que o debounce de 150 ms: nenhuma tecla sozinha
	// pode produzir render antes da pausa.
	await typeText(cdp, sessionId, 'licenca', 80);
	await sleep(700);
	const debounceDados = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const ult = window.__keyTimes[window.__keyTimes.length - 1];
			const levas = window.__renderLevas.map((l) => Math.round(l.t));
			return JSON.stringify({
				teclas: window.__keyTimes.length,
				levas: levas.length,
				tempos: levas,
				deltaUltimaTeclaPrimeiraLeva: levas.length ? Math.round(levas[0] - ult) : null,
				resultados: document.querySelectorAll('#busca-resultados li').length,
				status: document.querySelector('[data-busca-status]')?.textContent.trim() ?? null,
				url: location.search,
			});
		})()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '05-busca-debounce.png');
	console.log(`debounce: teclas=${debounceDados.teclas} levassDeRender=${debounceDados.levas} deltaApósÚltimaTecla=${debounceDados.deltaUltimaTeclaPrimeiraLeva}ms resultados=${debounceDados.resultados} url=${debounceDados.url}`);
	report.cenarios.debounce = {
		...debounceDados,
		ok: debounceDados.teclas === 7 && debounceDados.levas === 1 && (debounceDados.deltaUltimaTeclaPrimeiraLeva ?? 0) >= 140,
	};

	// Submit imediato: Enter renderiza na hora, sem esperar o debounce.
	const antes = await evaluate(cdp, sessionId, 'window.__renderLevas.length');
	for (let i = 0; i < 7; i += 1) await pressKey(cdp, sessionId, 'Backspace', 'Backspace', 8);
	await typeText(cdp, sessionId, 'preco', 30);
	await pressEnter(cdp, sessionId);
	await sleep(400);
	const submitDados = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const levas = window.__renderLevas.map((l) => Math.round(l.t));
			const submit = window.__submits[window.__submits.length - 1];
			return JSON.stringify({
				levasApos: levas.slice(${antes}),
				deltaSubmitUltimaLeva: submit !== undefined && levas.length ? Math.round(levas[levas.length - 1] - submit) : null,
				consulta: document.getElementById('busca-consulta').value,
				status: document.querySelector('[data-busca-status]')?.textContent.trim() ?? null,
				url: location.search,
			});
		})()`,
	).then(JSON.parse);
	console.log(`submit: levasNovas=${submitDados.levasApos.length} deltaSubmitRender=${submitDados.deltaSubmitUltimaLeva}ms consulta="${submitDados.consulta}" status="${submitDados.status}" url=${submitDados.url}`);
	report.cenarios.submitImediato = {
		...submitDados,
		ok: submitDados.levasApos.length >= 1 && (submitDados.deltaSubmitUltimaLeva ?? 1e9) < 140,
	};

	// ── 6. Tema percebido: troca real com persistência ─────────────────────
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2000);
	const temaAntes = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const select = document.querySelector('select[autocomplete="off"]');
			return JSON.stringify({
				valor: select ? select.value : null,
				opcoes: select ? [...select.options].map((o) => o.value) : [],
				tema: document.documentElement.dataset.theme ?? '(padrão)',
				fundo: getComputedStyle(document.body).backgroundColor,
				local: localStorage.getItem('starlight-theme'),
			});
		})()`,
	).then(JSON.parse);
	// Interação real primeiro: clique no select e setas do teclado. O Chrome
	// headless não processa popup de select nativo com eventos CDP sintéticos
	// (provado em sonda: nem o foco permanece no select), então o fallback
	// dispara o MESMO evento `change` que o teclado dispararia, e o meio usado
	// fica registrado no relatório.
	await clickSelector(cdp, sessionId, 'select[autocomplete="off"]');
	let viaTeclado = false;
	for (let i = 0; i < 3 && !viaTeclado; i += 1) {
		await pressKey(cdp, sessionId, 'ArrowDown', 'ArrowDown', 40);
		await sleep(120);
		viaTeclado = await evaluate(
			cdp,
			sessionId,
			'document.documentElement.dataset.theme === \'light\'',
		);
	}
	if (!viaTeclado) {
		await evaluate(
			cdp,
			sessionId,
			`(() => {
				const select = document.querySelector('select[autocomplete="off"]');
				select.value = 'light';
				select.dispatchEvent(new Event('change', { bubbles: true }));
			})()`,
		);
	}
	await sleep(400);
	const temaDepois = await evaluate(
		cdp,
		sessionId,
		`(() => JSON.stringify({
			select: document.querySelector('select[autocomplete="off"]')?.value ?? null,
			tema: document.documentElement.dataset.theme ?? '(padrão)',
			fundo: getComputedStyle(document.body).backgroundColor,
			texto: getComputedStyle(document.body).color,
			local: localStorage.getItem('starlight-theme'),
		}))()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '06-pagina-light.png');
	// Persistência: recarregar mantém Light.
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2000);
	const temaPosReload = await evaluate(
		cdp,
		sessionId,
		`(() => JSON.stringify({
			tema: document.documentElement.dataset.theme ?? '(padrão)',
			fundo: getComputedStyle(document.body).backgroundColor,
			local: localStorage.getItem('starlight-theme'),
		}))()`,
	).then(JSON.parse);
	console.log(`tema: antes=${temaAntes.valor}/${temaAntes.fundo} viaTeclado=${viaTeclado} → light fundo=${temaDepois.fundo} local="${temaDepois.local}" → pós-reload tema=${temaPosReload.tema} fundo=${temaPosReload.fundo}`);
	report.cenarios.tema = {
		antes: temaAntes,
		viaTeclado,
		depois: temaDepois,
		posReload: temaPosReload,
		ok: temaDepois.tema === 'light' && temaPosReload.tema === 'light',
	};

	// ── 7. Acessibilidade estrutural (base do leitor de tela) ──────────────
	report.cenarios.a11y = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const r = {};
			r.landmarks = [...document.querySelectorAll('header, nav, main, aside, footer')].map((el) => el.tagName.toLowerCase());
			const h1s = document.querySelectorAll('main h1');
			r.h1Unico = h1s.length === 1;
			r.tituloH1 = h1s[0] ? h1s[0].textContent.trim().slice(0, 50) : null;
			const headings = [...document.querySelectorAll('main :is(h1, h2, h3)')].map((h) => Number(h.tagName[1]));
			r.hierarquia = headings.join('');
			r.botaoSemNome = [...document.querySelectorAll('button')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label')).length;
			r.imagensSemAlt = [...document.querySelectorAll('img:not([aria-hidden])')].filter((i) => !i.hasAttribute('alt')).length;
			r.linksSemTexto = [...document.querySelectorAll('a')].filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label')).length;
			return JSON.stringify(r);
		})()`,
	).then(JSON.parse);
	// Leitor de tela na /busca/: label ligado, aria-live anunciando contagem.
	await navigate(cdp, sessionId, `${BASE}/busca/`, 2500);
	await evaluate(
		cdp,
		sessionId,
		`(() => {
			const input = document.getElementById('busca-consulta');
			const wait = new Promise((resolve) => {
				if (input && !input.disabled) return resolve(true);
				const obs = new MutationObserver(() => {
					if (input && !input.disabled) { obs.disconnect(); resolve(true); }
				});
				obs.observe(document.body, { attributes: true, subtree: true });
				setTimeout(() => { obs.disconnect(); resolve(false); }, 8000);
			});
			return wait.then(() => new Promise((r) => setTimeout(() => r(true), 300)));
		})()`,
		undefined,
	).catch(() => {});
	await clickSelector(cdp, sessionId, '#busca-consulta');
	await typeText(cdp, sessionId, 'suporte', 60);
	await sleep(600);
	report.cenarios.a11yBusca = await evaluate(
		cdp,
		sessionId,
		`(() => JSON.stringify({
			labelLigado: !!document.querySelector('label[for="busca-consulta"]'),
			ariaControls: document.getElementById('busca-consulta')?.getAttribute('aria-controls') ?? null,
			statusRole: document.querySelector('[data-busca-status]')?.getAttribute('role') ?? null,
			ariaLive: document.querySelector('[data-busca-status]')?.getAttribute('aria-live') ?? null,
			anuncio: document.querySelector('[data-busca-status]')?.textContent.trim() ?? null,
			focoNoInput: document.activeElement === document.getElementById('busca-consulta'),
		}))()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '07-busca-suporte.png');
	console.log(`a11y: landmarks=[${report.cenarios.a11y.landmarks.join(',')}] h1único=${report.cenarios.a11y.h1Unico} botõesSemNome=${report.cenarios.a11y.botaoSemNome} imgsSemAlt=${report.cenarios.a11y.imagensSemAlt} linksSemTexto=${report.cenarios.a11y.linksSemTexto}`);
	console.log(`a11y busca: label=${report.cenarios.a11yBusca.labelLigado} role=${report.cenarios.a11yBusca.statusRole} live=${report.cenarios.a11yBusca.ariaLive} anuncio="${report.cenarios.a11yBusca.anuncio}"`);

	// ── 8. Pagefind: modal do Starlight com clique e digitação reais ────────
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2500);
	await clickSelector(cdp, sessionId, 'button[aria-label="Pesquisar"]');
	await sleep(800);
	// O input do Pagefind recebe foco automático ao abrir o modal; o índice
	// carrega lazy na primeira abertura, então a espera é mais longa.
	await typeText(cdp, sessionId, 'dominio', 60);
	await sleep(4000);
	report.cenarios.pagefind = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const modal = document.querySelector('dialog[open]');
			const input = document.querySelector('.pagefind-ui__search-input');
			const mensagem = document.querySelector('.pagefind-ui__message')?.textContent.trim() ?? null;
			const resultados = [...document.querySelectorAll('.pagefind-ui__result')].map((r) => r.textContent.trim().slice(0, 80));
			return JSON.stringify({
				modalAberto: !!modal,
				consulta: input ? input.value : null,
				mensagem,
				resultados,
			});
		})()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '08-pagefind-modal.png');
	console.log(`pagefind: modal=${report.cenarios.pagefind.modalAberto} consulta="${report.cenarios.pagefind.consulta}" mensagem="${report.cenarios.pagefind.mensagem}" resultados=${report.cenarios.pagefind.resultados.length}`);

	// ── 9. 404 custom ───────────────────────────────────────────────────────
	await navigate(cdp, sessionId, `${BASE}/rota-que-nao-existe/`, 1500);
	report.cenarios.naoEncontrado = await evaluate(
		cdp,
		sessionId,
		`(() => JSON.stringify({
			titulo: document.title,
			h1: document.querySelector('h1')?.textContent.trim() ?? null,
			links: [...document.querySelectorAll('main a')].map((a) => ({ texto: a.textContent.trim(), href: a.getAttribute('href') })),
		}))()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '09-404.png');
	console.log(`404: título="${report.cenarios.naoEncontrado.titulo}" h1="${report.cenarios.naoEncontrado.h1}" links=${report.cenarios.naoEncontrado.links.map((l) => l.texto).join(', ')}`);

	// ── 10. Mobile: artigo e /busca/ sem overflow ───────────────────────────
	await cdp.send(
		'Emulation.setDeviceMetricsOverride',
		{ width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
		sessionId,
	);
	await navigate(cdp, sessionId, `${BASE}/dominio-e-publicacao/conecte-seu-dominio/`, 2000);
	report.cenarios.mobileArtigo = await evaluate(
		cdp,
		sessionId,
		`(() => JSON.stringify({
			overflow: document.scrollingElement.scrollWidth > document.documentElement.clientWidth,
			tocMobileVisivel: !!document.querySelector('#starlight__mobile-toc'),
		}))()`,
	).then(JSON.parse);
	await screenshot(cdp, sessionId, '10-mobile-artigo.png');
	await navigate(cdp, sessionId, `${BASE}/busca/`, 2000);
	report.cenarios.mobileBusca = await evaluate(
		cdp,
		sessionId,
		'document.scrollingElement.scrollWidth > document.documentElement.clientWidth',
	);
	await screenshot(cdp, sessionId, '11-mobile-busca.png');
	console.log(`mobile: overflowArtigo=${report.cenarios.mobileArtigo.overflow} tocMobile=${report.cenarios.mobileArtigo.tocMobileVisivel} overflowBusca=${report.cenarios.mobileBusca}`);

	console.log('\nJSON ' + JSON.stringify(report));
	process.exitCode = 0;
} finally {
	cdp.close();
	chrome.kill('SIGTERM');
}
