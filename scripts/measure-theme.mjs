// Medições de tema exigidas pelo DOCS-05 antes de qualquer gate visual:
// LCP e CLS em desktop e mobile (emulação de CPU 4x + Fast 3G no mobile),
// foco visível e navegação por teclado, reduced motion, ausência de scroll
// horizontal no mobile e aplicação real das duas paletas (dark e light).
//
// Ferramenta de sessão, não etapa do `verify`: depende de um Chrome local
// headless e de um servidor servindo o `dist/` (por exemplo `astro preview`,
// que binda em IPv6 ::1). Uso:
//   node scripts/measure-theme.mjs [baseURL]
// Saída: relatório legível + JSON final. Exit 0 se todas as sondas rodaram.
import { spawn } from 'node:child_process';

const BASE = process.argv[2] ?? 'http://[::1]:4321';
const CHROME =
	process.env.CHROME_PATH ??
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PAGES = ['/', '/primeiros-passos/', '/busca/'];

const COLLECTOR = `
(() => {
  window.__vitals = { lcp: 0, cls: 0, lcpEl: null };
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      window.__vitals.lcp = last.startTime;
      window.__vitals.lcpEl = last.element
        ? last.element.tagName + ' ' + String(last.element.className).slice(0, 60)
        : '(sem elemento)';
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
})();
`;

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
			`--user-data-dir=/tmp/epico-docs-chrome-${process.pid}`,
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

async function measure(cdp, sessionId) {
	return evaluate(
		cdp,
		sessionId,
		`JSON.stringify({
			vitals: window.__vitals,
			cal: document.fonts.check('600 16px Cal Sans'),
			outfit: document.fonts.check('400 16px Outfit'),
			fonteInit: (performance.getEntriesByType('resource')
				.filter((r) => r.name.endsWith('.woff2'))
				.map((r) => r.name.split('/').pop() + ':' + r.initiatorType)).join(','),
		})`,
	).then(JSON.parse);
}

const report = { base: BASE, cenarios: {}, teclado: null, reducedMotion: null, mobileOverflow: null, paletas: null };

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
	await cdp.send('Network.enable', {}, sessionId);
	await cdp.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: COLLECTOR },
		sessionId,
	);

	// Desktop: 1280x800, sem throttling. LCP e CLS por página.
	await cdp.send(
		'Emulation.setDeviceMetricsOverride',
		{ width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
		sessionId,
	);
	report.cenarios.desktop = {};
	for (const page of PAGES) {
		await navigate(cdp, sessionId, `${BASE}${page}`, 3000);
		const data = await measure(cdp, sessionId);
		report.cenarios.desktop[page] = data;
		console.log(
			`desktop ${page.padEnd(22)} LCP ${Math.round(data.vitals.lcp)}ms  CLS ${data.vitals.cls.toFixed(4)}  LCPel ${data.vitals.lcpEl}  fontes ${data.fonteInit}`,
		);
	}

	// Mobile: 390x844 @3x, CPU 4x, Fast 3G (como o Lighthouse).
	await cdp.send(
		'Emulation.setDeviceMetricsOverride',
		{ width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
		sessionId,
	);
	await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }, sessionId);
	await cdp.send(
		'Network.emulateNetworkConditions',
		{
			offline: false,
			latency: 150,
			downloadThroughput: (1.6 * 1024 * 1024) / 8,
			uploadThroughput: (750 * 1024) / 8,
		},
		sessionId,
	);
	report.cenarios.mobile = {};
	for (const page of PAGES) {
		await navigate(cdp, sessionId, `${BASE}${page}`, 5000);
		const data = await measure(cdp, sessionId);
		report.cenarios.mobile[page] = data;
		console.log(
			`mobile  ${page.padEnd(22)} LCP ${Math.round(data.vitals.lcp)}ms  CLS ${data.vitals.cls.toFixed(4)}  LCPel ${data.vitals.lcpEl}`,
		);
	}

	// Sem scroll horizontal no mobile.
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 3000);
	report.mobileOverflow = await evaluate(
		cdp,
		sessionId,
		'document.scrollingElement.scrollWidth <= document.documentElement.clientWidth',
	);
	console.log(`mobile sem overflow horizontal: ${report.mobileOverflow}`);

	// Teclado: Tab real via CDP e contorno de foco visível.
	await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }, sessionId);
	await cdp.send(
		'Network.emulateNetworkConditions',
		{ offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 },
		sessionId,
	);
	await cdp.send(
		'Emulation.setDeviceMetricsOverride',
		{ width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
		sessionId,
	);
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2500);
	const focos = [];
	for (let i = 0; i < 6; i += 1) {
		await cdp.send(
			'Input.dispatchKeyEvent',
			{ type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 },
			sessionId,
		);
		await cdp.send(
			'Input.dispatchKeyEvent',
			{ type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 },
			sessionId,
		);
		await sleep(120);
		const info = await evaluate(
			cdp,
			sessionId,
			`(() => {
				const el = document.activeElement;
				const cs = getComputedStyle(el);
				return JSON.stringify({
					tag: el.tagName,
					texto: (el.textContent || '').trim().slice(0, 40),
					outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
					outlineCor: cs.outlineColor,
				});
			})()`,
		).then(JSON.parse);
		focos.push(info);
	}
	report.teclado = focos;
	console.log('teclado (6 Tabs):', focos.map((f) => `${f.tag}:${f.texto || f.outlineCor}`).join(' | '));
	const semFoco = focos.filter((f) => f.tag !== 'BODY' && !f.outline);
	if (semFoco.length > 0) console.log(`  elementos focados sem contorno: ${semFoco.length}`);

	// Reduced motion: nada anima quando o usuário pede redução.
	await cdp.send(
		'Emulation.setEmulatedMedia',
		{ features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
		sessionId,
	);
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2000);
	report.reducedMotion = await evaluate(
		cdp,
		sessionId,
		`(() => {
			const raiz = getComputedStyle(document.documentElement);
			const animados = [...document.querySelectorAll('a, aside, nav')].filter((el) => {
				const cs = getComputedStyle(el);
				const dur = parseFloat(cs.transitionDuration) || 0;
				return cs.animationName !== 'none' || dur > 0;
			});
			return JSON.stringify({
				scrollBehavior: raiz.scrollBehavior,
				animados: animados.length,
			});
		})()`,
	).then(JSON.parse);
	console.log('reduced motion:', report.reducedMotion);

	// Paletas: dark (padrão) e light via prefers-color-scheme, cor pintada de verdade.
	report.paletas = {};
	for (const scheme of ['dark', 'light']) {
		await cdp.send(
			'Emulation.setEmulatedMedia',
			{
				features: [
					{ name: 'prefers-reduced-motion', value: 'no-preference' },
					{ name: 'prefers-color-scheme', value: scheme },
				],
			},
			sessionId,
		);
		await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2000);
		const data = await evaluate(
			cdp,
			sessionId,
			`(() => {
				const fundo = getComputedStyle(document.body).backgroundColor;
				const cor = getComputedStyle(document.body).color;
				const fonteH1 = getComputedStyle(document.querySelector('h1')).fontFamily;
				return JSON.stringify({
					tema: document.documentElement.dataset.theme ?? '(padrão)',
					fundo, cor, fonteH1,
				});
			})()`,
		).then(JSON.parse);
		report.paletas[scheme] = data;
		console.log(`paleta ${scheme}: data-theme=${data.tema} fundo=${data.fundo} texto=${data.cor} h1=${data.fonteH1.slice(0, 40)}`);
	}

	console.log('\nJSON ' + JSON.stringify(report));
	process.exitCode = 0;
} finally {
	cdp.close();
	chrome.kill('SIGTERM');
}
