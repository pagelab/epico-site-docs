// Sonda da cópia do deep link de títulos (ordem do owner em 2026-09-15).
// Carrega uma página de artigo no Chrome headless contra um servidor que
// sirva o `dist/` COM os headers reais (por exemplo
// `npx wrangler dev --port 8788`, que processa o `_headers`) e prova o
// ciclo completo do clique no ícone de corrente:
// - o script público carrega (CSP 'self') sem nenhuma violação de console;
// - o clique real do mouse copia a URL absoluta com o fragmento
//   percentual-codado para a área de transferência;
// - a navegação padrão é prevenida (o hash não entra na URL da página);
// - o feedback aparece: data-copied na âncora, rótulo "Link copiado" no
//   ::before estilizado e anúncio na região live;
// - o clique com Ctrl preservado não intercepta (comportamento nativo).
//
// Ferramenta de sessão, não etapa do `verify`: depende de um Chrome local
// headless e de um servidor de plantão. Uso:
//   node scripts/probe-anchor-copy.mjs [baseURL]
// Exit 0 somente com o ciclo completo provado.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:8788';
const PAGE = `${BASE}/painel-epico-site/publicacao-do-site/`;
const CHROME =
	process.env.CHROME_PATH ??
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class Cdp {
	constructor(wsUrl) {
		this.wsUrl = wsUrl;
		this.nextId = 1;
		this.pending = new Map();
		this.consoleErrors = [];
		this.securityEntries = [];
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
			if (message.method === 'Runtime.consoleAPICalled' && message.params.level === 'error') {
				this.consoleErrors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '));
			}
			if (message.method === 'Log.entryAdded') {
				const entry = message.params.entry;
				if (entry.source === 'security' || /refused|Content Security Policy/iu.test(entry.text)) {
					this.securityEntries.push(`${entry.source}: ${entry.text}`);
				}
			}
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
			`--user-data-dir=/tmp/epico-docs-anchor-${process.pid}`,
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

async function evaluate(cdp, sessionId, expression, awaitPromise = false) {
	const result = await cdp.send(
		'Runtime.evaluate',
		{ expression, returnByValue: true, awaitPromise },
		sessionId,
	);
	if (result.exceptionDetails) {
		throw new Error(`avaliação falhou: ${result.exceptionDetails.text}`);
	}
	return result.result.value;
}

async function navigate(cdp, sessionId, url, settleMs) {
	const loaded = new Promise((resolve) => {
		const original = cdp.ws.onmessage;
		cdp.ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.method === 'Page.loadEventFired') resolve();
			original(event);
		};
	});
	await cdp.send('Page.navigate', { url }, sessionId);
	await Promise.race([loaded, sleep(10000)]);
	await sleep(settleMs);
}

// Clique real do mouse no centro do primeiro link de âncora da página.
async function clickFirstAnchor(cdp, sessionId, modifiers = 0) {
	const box = await evaluate(
		cdp,
		sessionId,
		`JSON.stringify((() => {
			const link = document.querySelector('a.sl-anchor-link');
			const rect = link.getBoundingClientRect();
			return { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2) };
		})())`,
	).then(JSON.parse);

	await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...box, button: 'left', clickCount: 1, modifiers }, sessionId);
	await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...box, button: 'left', clickCount: 1, modifiers }, sessionId);
}

const failures = [];
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
	await cdp.send('Log.enable', {}, sessionId);

	// A leitura da área de transferência pela sonda precisa de permissão
	// outorgada ao contexto (o mesmo grant manual do dashboard de um app).
	await cdp.send(
		'Browser.grantPermissions',
		{ permissions: ['clipboardReadWrite'], origin: new URL(BASE).origin },
	);

	await navigate(cdp, sessionId, PAGE, 2500);

	const scriptLoaded = await evaluate(
		cdp,
		sessionId,
		`JSON.stringify({
			tag: Boolean(document.querySelector('script[src="/scripts/anchor-link-copy.js"]')),
			anchors: document.querySelectorAll('a.sl-anchor-link').length,
			urlAntes: location.href,
			hrefPrimeira: document.querySelector('a.sl-anchor-link')?.getAttribute('href') ?? '',
		})`,
	).then(JSON.parse);

	if (!scriptLoaded.tag) failures.push('script público não está no HTML da página');
	if (scriptLoaded.anchors === 0) failures.push('página sem links de âncora para testar');

	// Cláusula de garde: sem hash prévio, a cópia não pode herdá-lo.
	if (scriptLoaded.urlAntes.includes('#')) failures.push('página carregou com hash inesperado');

	await clickFirstAnchor(cdp, sessionId);
	await sleep(600);

	const after = await evaluate(
		cdp,
		sessionId,
		`(async () => ({
			urlDepois: location.href,
			dataCopied: document.querySelector('a.sl-anchor-link')?.hasAttribute('data-copied') ?? false,
			liveRegion: document.querySelector('[data-anchor-copy-status]')?.textContent ?? '',
			tooltip: getComputedStyle(document.querySelector('a.sl-anchor-link'), '::before').content,
			clipboard: await navigator.clipboard.readText(),
		}))()`,
		true,
	);

	const expected = await evaluate(
		cdp,
		sessionId,
		'new URL(document.querySelector("a.sl-anchor-link").getAttribute("href"), document.baseURI).href',
	);

	if (after.urlDepois !== scriptLoaded.urlAntes) {
		failures.push(`clique navegou em vez de só copiar: ${after.urlDepois}`);
	}
	if (!after.dataCopied) failures.push('âncora sem data-copied após o clique');
	if (after.liveRegion !== 'Link copiado.') failures.push(`região live announce "${after.liveRegion}"`);
	if (after.tooltip !== '"Link copiado"') failures.push(`tooltip ::before content ${after.tooltip}`);
	if (after.clipboard !== expected) {
		failures.push(`clipboard "${after.clipboard}" difere da URL esperada "${expected}"`);
	}

	// Screenshot de sessão para inspeção visual do check + tooltip, ainda
	// dentro da janela de confirmação de 2 s.
	await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId).then((result) => {
		writeFileSync('/tmp/epico-docs-anchor-click.png', Buffer.from(result.data, 'base64'));
	});

	// O estado copiado é transitório: confirma que o restaurador volta o ícone.
	await sleep(1800);
	const restored = await evaluate(
		cdp,
		sessionId,
		`JSON.stringify({
			dataCopied: document.querySelector('a.sl-anchor-link')?.hasAttribute('data-copied') ?? false,
			liveRegion: document.querySelector('[data-anchor-copy-status]')?.textContent ?? '',
		})`,
	).then(JSON.parse);

	if (restored.dataCopied) failures.push('data-copied não expirou após 2 s');
	if (restored.liveRegion !== '') failures.push(`região live não esvaziou: "${restored.liveRegion}"`);

	// Clínica negativa: Ctrl+clique precisa seguir nativo, sem interceptação
	// para copiar. Em headless a ação padrão abre aba nova em vez de mudar a
	// URL desta página, então o contrato provado é a AUSÊNCIA de cópia.
	await clickFirstAnchor(cdp, sessionId, 2 /* ctrl */);
	await sleep(600);

	const ctrlClick = await evaluate(
		cdp,
		sessionId,
		`(async () => ({
			dataCopied: document.querySelector('a.sl-anchor-link')?.hasAttribute('data-copied') ?? false,
			liveRegion: document.querySelector('[data-anchor-copy-status]')?.textContent ?? '',
			clipboard: await navigator.clipboard.readText().catch(() => ''),
		}))()`,
		true,
	);

	if (ctrlClick.dataCopied) failures.push('Ctrl+clique foi interceptado para copiar');
	if (ctrlClick.liveRegion === 'Link copiado.') failures.push('Ctrl+clique anunciou cópia');
	if (ctrlClick.clipboard !== expected) {
		failures.push(`Ctrl+clique sobrescreveu o clipboard: "${ctrlClick.clipboard}"`);
	}

	// Nenhuma violação de CSP ou erro de console em todo o ciclo.
	const violations = [
		...cdp.securityEntries,
		...cdp.consoleErrors.filter((text) => /refused|Content Security Policy|CSP/iu.test(text)),
	];

	for (const violation of violations) {
		failures.push(`violação/erro de console: ${violation}`);
	}

	console.log(`Anchor copy probe contra ${PAGE}`);
	console.log(`  script carregado: ${scriptLoaded.tag}, âncoras: ${scriptLoaded.anchors}`);
	console.log(`  clipboard: ${after.clipboard}`);
	console.log(`  data-copied: ${after.dataCopied}, live: "${after.liveRegion}", tooltip: ${after.tooltip}`);
	console.log(`  restaurado após 2 s: ${!restored.dataCopied}`);
	console.log(`  Ctrl+clique nativo (sem cópia): ${!ctrlClick.dataCopied}`);
	console.log(`  violações de CSP/erros: ${violations.length}`);

	if (failures.length > 0) {
		console.error('\n' + failures.join('\n'));
		process.exitCode = 1;
	} else {
		console.log('Anchor copy probe: PASS');
	}
} finally {
	cdp.close();
	chrome.kill('SIGKILL');
}
