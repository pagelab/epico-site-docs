/**
 * Cliente de busca da página `/busca/` (DOCS-04B).
 * Puro: nada de DOM e nada de Astro. O fetch é injetável (`fetchImpl`) e o
 * módulo é testável sem browser por `tests/search-client.test.ts`.
 *
 * Defesa em três camadas, na ordem em que o dado chega:
 * 1. transporte: fetch same-origin com timeout por AbortController e teto de
 *    bytes no texto recebido (caracteres são limite conservador de bytes UTF-8);
 * 2. payload: `validateSearchIndexPayload` (do gerador do índice) rejeita
 *    estrutura inválida e descarta entradas individualmente inválidas;
 * 3. render: quem monta o DOM recebe só entradas válidas e usa APIs de texto,
 *    nunca `innerHTML`.
 */
import {
	SEARCH_INDEX_MAX_BYTES,
	validateSearchIndexPayload,
} from './search-index.mjs';
import { topicGroups } from './topics.mjs';

export const SEARCH_FETCH_TIMEOUT_MS = 5_000;
export const SEARCH_RESULTS_LIMIT = 30;
export const SEARCH_QUERY_MAX_TOKENS = 12;

/** Label público da área, com fallback para o próprio slug do topic. */
const topicLabel = new Map(Object.entries(topicGroups));

/**
 * Normaliza texto para busca: separa acentos (NFD), remove diacríticos,
 * minúscula e colapsa espaços. Buscar "publicacao" acha "publicação".
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeForSearch(text) {
	if (typeof text !== 'string') {
		return '';
	}

	return text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase().replace(/\s+/gu, ' ').trim();
}

/**
 * Quebra a consulta em tokens literais, já normalizados. Tokens são tratados
 * como texto puro (busca por substring, sem regex), então metacaracteres como
 * `(`, `*` ou `\` não quebram nem ampliam a busca.
 *
 * @param {string} query
 * @returns {string[]}
 */
export function tokenizeQuery(query) {
	const tokens = normalizeForSearch(query).split(' ').filter((token) => token.length > 0);

	return tokens.slice(0, SEARCH_QUERY_MAX_TOKENS);
}

/**
 * Filtra e ordena as entradas do índice para uma consulta.
 * Todos os tokens precisam aparecer (AND) em título, descrição ou área.
 * Pontuação por ocorrência (título 4, descrição 2, área 1) com bônus quando o
 * título cobre a consulta inteira; empate decide pela URL, em ordem alfabética,
 * para o resultado ser determinístico.
 *
 * @typedef {Object} SearchResult
 * @property {string} url
 * @property {string} title
 * @property {string} description
 * @property {string} topicLabel
 * @property {string} lastReviewed
 *
 * @param {import('./search-index.mjs').SearchIndexEntry[]} entries Entradas já validadas.
 * @param {string} query Consulta crua do usuário.
 * @param {{ limit?: number }} [options]
 * @returns {SearchResult[]}
 */
export function filterSearchEntries(entries, query, options = {}) {
	const tokens = tokenizeQuery(query);

	if (tokens.length === 0 || !Array.isArray(entries)) {
		return [];
	}

	const limit = options.limit ?? SEARCH_RESULTS_LIMIT;
	const scored = [];

	for (const entry of entries) {
		const title = normalizeForSearch(entry.title);
		const description = normalizeForSearch(entry.description);
		const label = normalizeForSearch(topicLabel.get(entry.topic) ?? entry.topic);
		let score = 0;
		let matches = true;

		for (const token of tokens) {
			const inTitle = title.includes(token);
			const inDescription = description.includes(token);
			const inLabel = label.includes(token);

			if (!inTitle && !inDescription && !inLabel) {
				matches = false;
				break;
			}

			score += (inTitle ? 4 : 0) + (inDescription ? 2 : 0) + (inLabel ? 1 : 0);
		}

		if (!matches) {
			continue;
		}

		if (tokens.every((token) => title.includes(token))) {
			score += 3;
		}

		scored.push({
			url: entry.url,
			title: entry.title,
			description: entry.description,
			topicLabel: topicLabel.get(entry.topic) ?? entry.topic,
			lastReviewed: entry.lastReviewed,
			score,
		});
	}

	scored.sort((a, b) => (b.score - a.score) || (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));

	return scored.slice(0, limit);
}

/**
 * Busca, baixa e valida o índice público de busca.
 * A URL precisa ser um caminho do próprio site (nunca absoluto de outro host).
 * Qualquer falha (timeout, resposta ruim, teto de bytes, JSON malformado,
 * payload fora do contrato) rejeita a promise: a página degrada para navegação
 * manual em vez de renderizar dado não confiável.
 *
 * @param {{ url?: string, fetchImpl?: typeof fetch, timeoutMs?: number }} [options]
 * @returns {Promise<import('./search-index.mjs').SearchIndexEntry[]>}
 */
export async function fetchSearchIndex(options = {}) {
	// Caminho interno do índice na raiz do site. Páginas servidas fora da raiz
	// precisam passar a URL construída sobre `import.meta.env.BASE_URL`.
	const url = options.url ?? '/search-index.json';
	const fetchImpl = options.fetchImpl ?? globalThis.fetch?.bind(globalThis);
	const timeoutMs = options.timeoutMs ?? SEARCH_FETCH_TIMEOUT_MS;

	if (typeof url !== 'string' || !url.startsWith('/') || /[:\\]/u.test(url) || url.includes('//')) {
		throw new Error(`search-client: URL do índice precisa ser um caminho interno: ${String(url)}`);
	}

	if (typeof fetchImpl !== 'function') {
		throw new Error('search-client: fetch indisponível neste ambiente');
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	/** @type {Response} */
	let response;

	try {
		response = await fetchImpl(url, { signal: controller.signal });
	} catch (error) {
		if (controller.signal.aborted) {
			throw new Error(`search-client: índice não respondeu em ${timeoutMs} ms`);
		}

		throw new Error(`search-client: falha ao buscar o índice: ${error instanceof Error ? error.message : String(error)}`);
	} finally {
		clearTimeout(timer);
	}

	if (!response.ok) {
		throw new Error(`search-client: resposta não ok para o índice: ${String(response.status)}`);
	}

	const text = await response.text();

	if (text.length > SEARCH_INDEX_MAX_BYTES) {
		throw new Error(`search-client: índice recebido acima do teto de ${SEARCH_INDEX_MAX_BYTES} caracteres`);
	}

	/** @type {unknown} */
	let payload;

	try {
		payload = JSON.parse(text);
	} catch {
		throw new Error('search-client: índice recebido não é JSON válido');
	}

	const validated = validateSearchIndexPayload(payload);

	if (!validated.ok) {
		throw new Error(`search-client: índice fora do contrato: ${validated.reason}`);
	}

	return validated.entries;
}
