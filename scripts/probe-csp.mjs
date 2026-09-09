// Sonda de CSP (DOCS-06): carrega as páginas no Chrome headless contra um
// servidor que sirva o `dist/` COM os headers reais (por exemplo
// `npx wrangler dev --port 8788`, que processa o `_headers`) e prova que:
// - nenhum script inline é bloqueado pela CSP (os hashes estão certos para
//   o browser, não só para o gate estrutural);
// - a página funciona de fato: tema aplicado, bloco de busca revelado pelo
//   script inline e índice buscado com o input habilitado.
//
// Ferramenta de sessão, não etapa do `verify`: depende de um Chrome local
// headless e de um servidor de plantão. Uso:
//   node scripts/probe-csp.mjs [baseURL]
// Exit 0 somente sem violação de CSP e com os comportamentos esperados.
import { spawn } from 'node:child_process';

const BASE = process.argv[2] ?? 'http://127.0.0.1:8788';
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

	waitEvent(method, timeoutMs = 30000) {
		return new Promise((resolve) => {
			const waiter = (params) => {
				const waiters = this.eventWaiters.get(method) ?? [];
				this.eventWaiters.set(method, waiters.filter((w) => w !== waiter));
				clearTimeout(timer);
				resolve(params);
			};
			const timer = setTimeout(() => {
				const waiters = this.eventWaiters.get(method) ?? [];
				this.eventWaiters.set(method, waiters.filter((w) => w !== waiter));
				resolve(null);
			}, timeoutMs);
			if (!this.eventWaiters) this.eventWaiters = new Map();
			const current = this.eventWaiters.get(method) ?? [];
			current.push(waiter);
			this.eventWaiters.set(method, current);
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
			`--user-data-dir=/tmp/epico-docs-csp-${process.pid}`,
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
	await cdp.send('Network.enable', {}, sessionId);

	// Home: o provider de tema (script inline) precisa ter executado.
	await navigate(cdp, sessionId, `${BASE}/`, 2500);
	const themeProvider = await evaluate(
		cdp,
		sessionId,
		'typeof window.StarlightThemeProvider',
	);

	if (themeProvider !== 'object') {
		failures.push(`home: StarlightThemeProvider não executou (typeof ${themeProvider})`);
	}

	// Artigo com ToC: os scripts aria-hidden do vendor precisam rodar sem erro.
	await navigate(cdp, sessionId, `${BASE}/primeiros-passos/`, 2500);
	const tocPresent = await evaluate(
		cdp,
		sessionId,
		"Boolean(document.querySelector('starlight-toc, mobile-starlight-toc'))",
	);

	if (!tocPresent) {
		failures.push('artigo: componente de ToC ausente');
	}

	// /busca/: script inline revela o bloco, cliente busca o índice e habilita o input.
	await navigate(cdp, sessionId, `${BASE}/busca/`, 3500);
	const buscaState = await evaluate(
		cdp,
		sessionId,
		`JSON.stringify({
			revelado: !document.querySelector('[data-busca]')?.hasAttribute('hidden'),
			inputHabilitado: document.getElementById('busca-consulta')?.disabled === false,
			status: document.querySelector('[data-busca-status]')?.textContent ?? '',
		})`,
	).then(JSON.parse);

	if (!buscaState.revelado) {
		failures.push('/busca/: bloco de busca não foi revelado (script inline bloqueado)');
	}

	if (!buscaState.inputHabilitado) {
		failures.push(`/busca/: input não habilitou (índice não chegou): ${buscaState.status}`);
	}

	// Violations reportadas pelo browser em qualquer página navegada: coletadas
	// ANTES da sonda negativa, cuja violação é o resultado esperado.
	const cspViolations = [
		...cdp.securityEntries,
		...cdp.consoleErrors.filter((text) => /refused|Content Security Policy|CSP/iu.test(text)),
	];

	for (const violation of cspViolations) {
		failures.push(`violação de CSP: ${violation}`);
	}

	// Sonda negativa: um script inline sem hash na CSP precisa ser BLOQUEADO.
	// Prova que a política está ativa de verdade, e não sendo ignorada.
	await navigate(cdp, sessionId, `${BASE}/`, 1500);
	const hostile = await cdp.send(
		'Runtime.evaluate',
		{
			expression: `new Promise((resolve) => {
				const script = document.createElement('script');
				script.textContent = 'window.__cspProbeHostil = true';
				script.addEventListener('error', () => resolve('bloqueado'));
				document.body.append(script);
				setTimeout(() => resolve(window.__cspProbeHostil ? 'executou' : 'bloqueado'), 2000);
			})`,
			awaitPromise: true,
			returnByValue: true,
		},
		sessionId,
	).then((result) => result.result.value);

	if (hostile !== 'bloqueado') {
		failures.push(`script inline hostil ${hostile} pela CSP (a política não está efetiva)`);
	}

	console.log(`CSP probe contra ${BASE}`);
	console.log(`  StarlightThemeProvider: ${themeProvider}`);
	console.log(`  ToC presente: ${tocPresent}`);
	console.log(`  /busca/ revelado: ${buscaState.revelado}, input habilitado: ${buscaState.inputHabilitado}`);
	console.log(`  status da busca: ${buscaState.status}`);
	console.log(`  script inline hostil: ${hostile}`);
	console.log(`  violações de CSP: ${cspViolations.length}`);

	if (failures.length > 0) {
		console.error('\n' + failures.join('\n'));
		process.exitCode = 1;
	} else {
		console.log('CSP probe: PASS');
	}
} finally {
	cdp.close();
	chrome.kill('SIGKILL');
}
