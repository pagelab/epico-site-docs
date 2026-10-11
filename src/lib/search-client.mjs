/**
 * Cliente de busca da página `/busca/` (DOCS-04B).
 * Puro: nada de DOM e nada de Astro. O fetch é injetável (`fetchImpl`) e o
 * módulo é testável sem browser por `tests/search-client.test.ts`.
 *
 * Defesa em três camadas, na ordem em que o dado chega:
 * 1. transporte: fetch same-origin com timeout por AbortController (cobrindo o
 *    handshake E a leitura do corpo), rejeição antecipada por Content-Length
 *    declarado acima do teto e teto de caracteres no texto recebido (caracteres
 *    são limite conservador de bytes UTF-8);
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
export const SEARCH_QUERY_MAX_CHARS = 100;

/** Label público da área, com fallback para o próprio slug do topic. */
const topicLabel = new Map(Object.entries(topicGroups));

/*
 * Ranking tolerante (DOCS-17). Espelha regra por regra a busca do painel em
 * `app.epico.site` (`assets/js/shell.js` do plugin `epico-client-area`, versão
 * 0.137.0), para que as duas buscas sobre o mesmo índice concordem: palavras
 * inteiras dobradas sem acento, palavras de ligação descartadas, plural e
 * terminação reduzidos, palavra digitada pela metade, raiz comum, erro de
 * digitação e raridade da palavra no acervo. Nada de regex construída a partir
 * da consulta: tudo é comparação de strings já normalizadas.
 */

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
 * Palavras inteiras de um texto, já normalizadas: "Configurações",
 * "configuracoes" e "CONFIGURACOES" são a mesma palavra.
 *
 * @param {string} text
 * @returns {string[]}
 */
function searchWords(text) {
	return normalizeForSearch(text).split(/[^a-z0-9]+/u).filter((word) => word !== '');
}

/**
 * Palavras que dizem como alguém pergunta, não o que pergunta (português,
 * inglês e espanhol, já sem acento). Mesmo conjunto do painel.
 */
const SEARCH_STOPWORDS = new Set([
	'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
	'em', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'por', 'pelo', 'pela', 'para', 'pra',
	'com', 'sem', 'e', 'ou', 'que', 'como', 'se', 'eu', 'me', 'meu', 'minha', 'meus',
	'minhas', 'seu', 'sua', 'seus', 'suas', 'voce', 'isso', 'isto', 'esse', 'essa',
	'este', 'esta', 'estou', 'mais', 'muito', 'nao', 'ja', 'so', 'qual', 'quais', 'onde',
	'quando', 'porque', 'sobre', 'ate', 'ha', 'ter', 'tem', 'tenho', 'fazer', 'faco',
	'posso', 'pode', 'preciso', 'quero', 'ser', 'sou', 'consigo', 'dar', 'tipo',
	'the', 'an', 'of', 'to', 'in', 'on', 'for', 'with', 'my', 'your', 'how', 'does',
	'is', 'are', 'can', 'what', 'where', 'why', 'it', 'and', 'or', 'i', 'want', 'need',
	'el', 'la', 'los', 'las', 'mi', 'mis', 'en', 'un', 'una', 'y', 'es', 'con', 'puedo',
	'quiero', 'necesito', 'cual', 'donde',
]);

/**
 * Quebra a consulta em palavras de busca: no máximo 100 caracteres lidos,
 * palavras inteiras normalizadas com mais de uma letra, sem repetição e sem
 * palavras de ligação. "como eu conecto meu dominio" busca "conecto dominio".
 * Consulta feita só de palavras de ligação volta a usar todas elas. Tokens são
 * texto puro, então metacaracteres como `(`, `*` ou `\` não quebram nem
 * ampliam a busca.
 *
 * @param {string} query
 * @returns {string[]}
 */
export function tokenizeQuery(query) {
	const words = searchWords(typeof query === 'string' ? query.slice(0, SEARCH_QUERY_MAX_CHARS) : '')
		.filter((word) => word.length > 1);
	const meaningful = words.filter((word) => !SEARCH_STOPWORDS.has(word));

	return [...new Set(meaningful.length > 0 ? meaningful : words)].slice(0, SEARCH_QUERY_MAX_TOKENS);
}

/**
 * Reduções leves de plural e terminação em português e inglês: o bastante para
 * "dominios" encontrar "dominio" e "configuracoes" encontrar "configuracao".
 */
const STEM_RULES = [
	['coes', 'cao'], ['oes', 'ao'], ['aes', 'ao'], ['ais', 'al'], ['eis', 'el'], ['ois', 'ol'],
	['ns', 'm'], ['ies', 'y'], ['res', 'r'], ['zes', 'z'], ['ses', 's'], ['s', ''],
];

/**
 * @param {string} word
 * @returns {string}
 */
function stemSearch(word) {
	if (word.length <= 3) {
		return word;
	}

	const rule = STEM_RULES.find(([suffix]) => word.length - suffix.length >= 3 && word.endsWith(suffix));

	return rule ? word.slice(0, word.length - rule[0].length) + rule[1] : word;
}

/**
 * Distância de edição com saída antecipada: só pergunta "está dentro do
 * limite?". Duas letras vizinhas trocadas ("dominoi") contam como UMA edição.
 *
 * @param {string} left
 * @param {string} right
 * @param {number} limit
 * @returns {boolean}
 */
function withinEdits(left, right, limit) {
	if (Math.abs(left.length - right.length) > limit) {
		return false;
	}

	/** @type {number[]} */
	let before = [];
	let previous = Array.from({ length: right.length + 1 }, (_unused, index) => index);

	for (let row = 1; row <= left.length; row += 1) {
		const current = [row];
		let best = row;

		for (let column = 1; column <= right.length; column += 1) {
			const cost = left.charAt(row - 1) === right.charAt(column - 1) ? 0 : 1;

			current[column] = Math.min(previous[column] + 1, current[column - 1] + 1, previous[column - 1] + cost);

			if (row > 1 && column > 1 && left.charAt(row - 1) === right.charAt(column - 2)
				&& left.charAt(row - 2) === right.charAt(column - 1)) {
				current[column] = Math.min(current[column], before[column - 2] + 1);
			}

			best = Math.min(best, current[column]);
		}

		if (best > limit) {
			return false;
		}

		before = previous;
		previous = current;
	}

	return previous[right.length] <= limit;
}

/**
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
function sharedPrefix(left, right) {
	let length = 0;

	while (length < left.length && length < right.length && left.charAt(length) === right.charAt(length)) {
		length += 1;
	}

	return length;
}

/**
 * Força do encontro entre uma palavra digitada e uma palavra do guia, de 1 (a
 * mesma palavra) a 0 (sem relação). Cada degrau existe para um jeito real de
 * digitar: plural, palavra pela metade, verbo contra substantivo ("renovar" e
 * "renovacao" compartilham "renova"), erro de digitação e palavra dentro de
 * palavra composta. A raiz comum exige seis letras: com cinco, "contato" já
 * encontraria "contas", que é resposta errada.
 *
 * @param {string} token
 * @param {string} word
 * @returns {number}
 */
export function wordMatch(token, word) {
	if (token === word) return 1;
	if (stemSearch(token) === stemSearch(word)) return 0.95;
	if (token.length >= 3 && word.startsWith(token)) return 0.8;

	const shared = sharedPrefix(token, word);

	if (shared >= 6 && shared >= 0.75 * Math.min(token.length, word.length)) return 0.7;
	if (token.length >= 4 && withinEdits(token, word, token.length >= 8 ? 2 : 1)) return 0.6;
	if (token.length >= 4 && word.includes(token)) return 0.5;

	return 0;
}

/**
 * Campos pontuáveis de cada entrada, preparados uma vez por objeto validado:
 * a página chama o filtro a cada tecla sobre o mesmo índice.
 *
 * @type {WeakMap<object, Array<{ weight: number, words: string[] }>>}
 */
const preparedFields = new WeakMap();

/**
 * @param {import('./search-index.mjs').SearchIndexEntry} entry
 * @returns {Array<{ weight: number, words: string[] }>}
 */
function fieldsOf(entry) {
	const cached = preparedFields.get(entry);

	if (cached !== undefined) {
		return cached;
	}

	const fields = [
		{ weight: 4, words: searchWords(entry.title) },
		{ weight: 3, words: searchWords(Array.isArray(entry.keywords) ? entry.keywords.join(' ') : '') },
		{ weight: 2, words: searchWords(entry.description) },
		{ weight: 1, words: searchWords(topicLabel.get(entry.topic) ?? entry.topic) },
	];

	preparedFields.set(entry, fields);

	return fields;
}

/**
 * Filtra e ordena as entradas do índice para uma consulta, com o mesmo ranking
 * da busca do painel. Cada palavra digitada fica com seu melhor encontro no
 * guia, pesado pelo campo (título 4, keywords 3, descrição 2, área 1) e pela
 * raridade da palavra no acervo: palavra que todo guia tem ("site") vale
 * pouco, palavra que só um guia tem decide. O guia aparece quando as palavras
 * que encontra somam pelo menos metade do peso das palavras CONHECIDAS da
 * consulta (as que algum guia tem). Palavra que nenhum guia tem não esconde
 * uma boa resposta ("transferir dominio" ainda acha o domínio), mas, quando
 * existe, o que encontrou precisa ser informativo sozinho, para "site xyz" não
 * listar o acervo inteiro. Título cobrindo todas as palavras soma 3, empate
 * decide pela URL em ordem alfabética e as keywords nunca vão para o resultado.
 *
 * @typedef {Object} SearchResult
 * @property {string} url
 * @property {string} title
 * @property {string} description
 * @property {string} topicLabel
 * @property {string} lastReviewed
 * @property {number} score
 *
 * @param {import('./search-index.mjs').SearchIndexEntry[]} entries Entradas já validadas.
 * @param {string} query Consulta crua do usuário.
 * @param {{ limit?: number }} [options]
 * @returns {SearchResult[]}
 */
export function filterSearchEntries(entries, query, options = {}) {
	const tokens = tokenizeQuery(query);

	if (tokens.length === 0 || !Array.isArray(entries) || entries.length === 0) {
		return [];
	}

	const limit = options.limit ?? SEARCH_RESULTS_LIMIT;
	const strengths = entries.map((entry) => tokens.map((token) => fieldsOf(entry).reduce((best, field) => {
		let strength = 0;

		for (let index = 0; index < field.words.length && strength < 1; index += 1) {
			strength = Math.max(strength, wordMatch(token, field.words[index]));
		}

		return {
			weighted: Math.max(best.weighted, strength * field.weight),
			inTitle: best.inTitle || (field.weight === 4 && strength > 0),
		};
	}, { weighted: 0, inTitle: false })));
	/** @param {number} reached */
	const rarityOf = (reached) => Math.log(1 + (entries.length + 1) / (reached + 1));
	const reachedBy = tokens.map((_token, index) => strengths.filter((perEntry) => perEntry[index].weighted > 0).length);
	const rarity = reachedBy.map(rarityOf);
	const knownRarity = rarity.reduce((sum, value, index) => sum + (reachedBy[index] > 0 ? value : 0), 0);
	const someUnknown = reachedBy.some((reached) => reached === 0);
	const informative = rarityOf(Math.ceil(entries.length / 2));
	const scored = [];

	entries.forEach((entry, entryIndex) => {
		let covered = 0;
		let score = 0;

		strengths[entryIndex].forEach((meeting, index) => {
			if (meeting.weighted > 0) covered += rarity[index];
			score += meeting.weighted * rarity[index];
		});

		if (score === 0 || covered < knownRarity / 2 || (someUnknown && covered < informative)) {
			return;
		}

		if (strengths[entryIndex].every((meeting) => meeting.inTitle)) {
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
	});

	scored.sort((a, b) => (b.score - a.score) || (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));

	return scored.slice(0, limit);
}

/**
 * Content-Length declarado, quando presente e numérico. Resposta sem header
 * (ou com valor não numérico) retorna null e o teto continua cobrado depois
 * da leitura do corpo.
 *
 * @param {Response} response
 * @returns {number | null}
 */
function declaredContentLength(response) {
	const headers = response?.headers;

	if (typeof headers?.get !== 'function') {
		return null;
	}

	const value = headers.get('Content-Length');

	if (typeof value !== 'string' || !/^\d+$/u.test(value)) {
		return null;
	}

	const parsed = Number(value);

	return Number.isSafeInteger(parsed) ? parsed : null;
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
	// O cronômetro cobre o handshake E a leitura do corpo: um servidor que
	// responde os headers e trava a transferência também cai no timeout, porque
	// abortar o sinal faz a leitura pendente rejeitar no browser.
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetchImpl(url, { signal: controller.signal });

		if (!response.ok) {
			throw new Error(`search-client: resposta não ok para o índice: ${String(response.status)}`);
		}

		const declaredBytes = declaredContentLength(response);

		if (declaredBytes !== null && declaredBytes > SEARCH_INDEX_MAX_BYTES) {
			throw new Error(
				`search-client: índice recebido acima do teto de ${SEARCH_INDEX_MAX_BYTES} caracteres (Content-Length: ${declaredBytes})`,
			);
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
	} catch (error) {
		if (controller.signal.aborted) {
			throw new Error(`search-client: índice não respondeu em ${timeoutMs} ms`);
		}

		if (error instanceof Error && error.message.startsWith('search-client:')) {
			throw error;
		}

		throw new Error(`search-client: falha ao buscar o índice: ${error instanceof Error ? error.message : String(error)}`);
	} finally {
		clearTimeout(timer);
	}
}
