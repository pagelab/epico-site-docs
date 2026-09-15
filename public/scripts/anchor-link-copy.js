// Cópia do deep link de títulos (ordem direta do owner em 2026-09-15).
//
// O ícone de corrente que o Starlight mostra no hover dos títulos é um <a>
// comum apontando para o fragmento da seção: o clique apenas navega. Este
// módulo transforma o clique simples no gesto esperado, copiar o endereço
// completo daquela seção: previne a navegação, copia a URL absoluta com o
// fragmento percentual-codado e confirma trocando a corrente por um check
// (CSS em theme.css via [data-copied]) e anunciando "Link copiado." em
// região live. Clique com modificador (cmd/ctrl/shift/alt), botão do meio e
// botão direito seguem nativos, então abrir em nova aba continua possível.
//
// Script público estático, servido de /scripts/ e autorizado pela CSP por
// 'self': nenhum script inline novo, nenhum hash novo no _headers. Sem
// JavaScript o link continua navegando para o fragmento, como hoje.
//
// As funções puras são exportadas para tests/anchor-copy.test.ts testar os
// mesmos bytes servidos em produção; a wiring só roda quando há document.
const COPY_CONFIRMATION_MS = 2000;

/**
 * @typedef {object} CopyActivationEvent
 * @property {number} button
 * @property {boolean} [metaKey]
 * @property {boolean} [ctrlKey]
 * @property {boolean} [shiftKey]
 * @property {boolean} [altKey]
 */

/**
 * Ativação que pode ser interceptada para copiar: clique primário sem
 * modificador (o mesmo vale para Enter/Space no link focado, que o browser
 * despacha como clique com button 0 e sem modificadores).
 *
 * @param {CopyActivationEvent} event
 * @returns {boolean}
 */
export function isCopyActivation(event) {
	return (
		event.button === 0
		&& !event.metaKey
		&& !event.ctrlKey
		&& !event.shiftKey
		&& !event.altKey
	);
}

/**
 * URL absoluta do fragmento de título, ou null quando o href não é um
 * fragmento de página (âncoras do vendor sempre são "#<slug>"; qualquer
 * outra forma segue o comportamento nativo do link).
 *
 * @param {string | null} href
 * @param {string} base
 * @returns {string | null}
 */
export function buildHeadingUrl(href, base) {
	if (typeof href !== 'string' || !href.startsWith('#') || href.length < 2) {
		return null;
	}

	try {
		return new URL(href, base).href;
	} catch {
		return null;
	}
}

/**
 * Copia via Clipboard API com fallback deprecado para contexto sem permissão
 * ou sem navigator.clipboard. Ambos os caminhos usam APIs de texto.
 *
 * @param {Window} win
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function writeToClipboard(win, text) {
	if (win.navigator.clipboard?.writeText) {
		try {
			await win.navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Permissão negada ou documento sem foco: tenta o fallback.
		}
	}

	return copyWithExecCommand(win, text);
}

/**
 * @param {Window} win
 * @param {string} text
 * @returns {boolean}
 */
function copyWithExecCommand(win, text) {
	const area = win.document.createElement('textarea');
	area.value = text;
	area.setAttribute('readonly', '');
	area.setAttribute('aria-hidden', 'true');
	area.style.position = 'fixed';
	area.style.top = '-1000px';
	win.document.body.append(area);
	area.select();

	let copied = false;

	try {
		copied = win.document.execCommand('copy');
	} catch {
		copied = false;
	}

	area.remove();
	return copied;
}

/**
 * @param {Window} win
 * @returns {void}
 */
export function setupAnchorCopy(win = window) {
	const doc = win.document;
	const stateTimers = new WeakMap();
	let messageTimer = 0;
	let messageRegion = null;

	function announce(text) {
		if (messageRegion === null) {
			messageRegion = doc.createElement('p');
			messageRegion.className = 'sr-only';
			messageRegion.setAttribute('role', 'status');
			messageRegion.setAttribute('data-anchor-copy-status', '');
			doc.body.append(messageRegion);
		}

		messageRegion.textContent = text;
		win.clearTimeout(messageTimer);
		messageTimer = win.setTimeout(() => {
			if (messageRegion !== null && messageRegion.textContent === text) {
				messageRegion.textContent = '';
			}
		}, COPY_CONFIRMATION_MS);
	}

	function clearCopied(link) {
		win.clearTimeout(stateTimers.get(link));
		stateTimers.delete(link);
		link.removeAttribute('data-copied');
	}

	function markCopied(link) {
		for (const other of doc.querySelectorAll('a.sl-anchor-link[data-copied]')) {
			clearCopied(other);
		}

		link.setAttribute('data-copied', '');
		win.clearTimeout(stateTimers.get(link));
		stateTimers.set(
			link,
			win.setTimeout(() => {
				link.removeAttribute('data-copied');
				stateTimers.delete(link);
			}, COPY_CONFIRMATION_MS),
		);
		announce('Link copiado.');
	}

	doc.addEventListener('click', (event) => {
		if (!isCopyActivation(event)) return;

		const target = event.target;
		if (!(target instanceof win.Element)) return;

		const link = target.closest('a.sl-anchor-link');
		if (link === null) return;

		const url = buildHeadingUrl(link.getAttribute('href'), doc.baseURI);
		if (url === null) return;

		event.preventDefault();
		writeToClipboard(win, url).then((copied) => {
			if (copied) markCopied(link);
			else announce('Não foi possível copiar o link.');
		});
	});
}

if (typeof document !== 'undefined') {
	setupAnchorCopy(window);
}
