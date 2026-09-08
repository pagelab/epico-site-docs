/**
 * Gerador puro do índice público de busca (`search-index.json`).
 * O mesmo payload alimenta o endpoint estático (`src/pages/search-index.json.ts`)
 * e a página `/busca/` (DOCS-04B). Não importa nada de Astro: toda validação é
 * função pura, testável por `tests/search-index.test.ts` sem contexto de build.
 *
 * Barreiras (falham o build, nunca degradam em silêncio):
 * - rascunho (`draft: true`) não entra no índice público;
 * - slug precisa resolver para URL interna canônica (nada de URL externa,
 *   protocolo-relativa, travessia de caminho ou segmento não canônico);
 * - slugs distintos que resolvem para a MESMA URL são duplicados;
 * - campos obrigatórios vazios, topic fora da allowlist e data inválida;
 * - quantidade e bytes do payload serializado têm teto;
 * - nenhum campo carrega corpo de artigo e texto livre é varrido por PII.
 */
import { topics } from './topics.mjs';

export const SEARCH_INDEX_VERSION = 1;
export const SEARCH_INDEX_MAX_ENTRIES = 200;
export const SEARCH_INDEX_MAX_BYTES = 256 * 1024;

/**
 * @typedef {Object} SearchIndexEntryInput
 * @property {string} slug Slug do Starlight (ex.: `area/artigo`, `area/index`, `index`).
 * @property {string} title
 * @property {string} description
 * @property {string} topic
 * @property {boolean} draft Precisa ser exatamente `false`.
 * @property {string} lastReviewed Data YYYY-MM-DD.
 */

/**
 * @typedef {Object} SearchIndexEntry
 * @property {string} url
 * @property {string} title
 * @property {string} description
 * @property {string} topic
 * @property {string} lastReviewed
 */

/**
 * @typedef {Object} SearchIndexPayload
 * @property {typeof SEARCH_INDEX_VERSION} version
 * @property {SearchIndexEntry[]} entries
 */

const canonicalSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const isoDate = /^\d{4}-\d{2}-\d{2}$/u;
const allowedTopics = new Set(topics);
const piiPatterns = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu, 'e-mail'],
  [/\/Users\/[A-Za-z0-9._-]+\//u, 'caminho local'],
  [/\b(?:localhost|127\.0\.0\.1)(?::\d+)?\b/iu, 'endereço local'],
];

/**
 * Converte o slug do Starlight na URL canônica servida pelo site.
 * Segue o mesmo acordo de `slugToParam` do Starlight: `index` e vazio são a
 * raiz e o sufixo `/index` desaparece.
 *
 * @param {string} slug
 * @returns {string}
 */
export function slugToUrl(slug) {
  const trimmed = slug.replace(/^\/+|\/+$/gu, '');
  const withoutIndexSuffix = trimmed === 'index' || trimmed.endsWith('/index')
    ? trimmed.slice(0, Math.max(0, trimmed.length - 'index'.length)).replace(/\/+$/u, '')
    : trimmed;

  return withoutIndexSuffix === '' ? '/' : `/${withoutIndexSuffix}/`;
}

/**
 * @param {string} slug
 * @param {string} url
 * @returns {string[]} Violações do slug, cada uma explicando a causa.
 */
function slugViolations(slug, url) {
  if (typeof slug !== 'string' || slug.trim() === '') {
    return [`slug ausente (url resolvida: ${url})`];
  }

  if (/[:\\]/u.test(slug) || slug.startsWith('//')) {
    return [`URL externa não é permitida no índice: ${slug}`];
  }

  const segments = slug.replace(/^\/+|\/+$/gu, '').split('/');

  if (segments.some((segment) => !canonicalSegment.test(segment))) {
    return [`slug não canônico (segmentos minúsculos a-z, 0-9 e hífen): ${slug}`];
  }

  return [];
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isRealDate(value) {
  if (!isoDate.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

/**
 * @param {unknown} input
 * @param {string} field
 * @returns {string[]} Violações de tipo, vazio ou PII do campo.
 */
function textViolations(input, field) {
  if (typeof input !== 'string' || input.trim() === '') {
    return [`${field} obrigatório ausente ou vazio`];
  }

  for (const [pattern, label] of piiPatterns) {
    if (pattern.test(input)) {
      return [`${field} contém possível PII (${label})`];
    }
  }

  return [];
}

/**
 * Gera o payload do índice a partir das entradas do acervo.
 * Determinístico: a mesma entrada produz exatamente os mesmos bytes.
 *
 * @param {SearchIndexEntryInput[]} inputs
 * @returns {SearchIndexPayload}
 */
export function generateSearchIndex(inputs) {
  if (!Array.isArray(inputs)) {
    throw new TypeError('search-index: entradas devem ser uma lista');
  }

  const violations = [];

  if (inputs.length > SEARCH_INDEX_MAX_ENTRIES) {
    violations.push(`índice excede o teto de ${SEARCH_INDEX_MAX_ENTRIES} entradas: ${inputs.length}`);
  }

  const byUrl = new Map();

  for (const input of inputs) {
    const slug = input?.slug;
    const url = typeof slug === 'string' ? slugToUrl(slug) : '(slug inválido)';
    const entryViolations = [
      ...slugViolations(slug, url),
      ...textViolations(input?.title, 'title'),
      ...textViolations(input?.description, 'description'),
    ];

    if (input?.draft !== false) {
      entryViolations.push('draft precisa ser exatamente false no acervo público');
    }

    if (typeof input?.topic !== 'string' || !allowedTopics.has(input.topic)) {
      entryViolations.push(`topic fora da allowlist: ${String(input?.topic ?? '(vazio)')}`);
    }

    if (typeof input?.lastReviewed !== 'string' || !isRealDate(input.lastReviewed)) {
      entryViolations.push('lastReviewed deve ser uma data YYYY-MM-DD válida');
    }

    for (const violation of entryViolations) {
      violations.push(`${url}: ${violation}`);
    }

    if (entryViolations.length === 0 && byUrl.has(url)) {
      violations.push(`${url}: slug duplicado no índice (${String(slug)} e ${String(byUrl.get(url))})`);
    } else if (entryViolations.length === 0) {
      byUrl.set(url, slug);
    }
  }

  if (violations.length > 0) {
    throw new Error(`search-index: índice inválido:\n${violations.join('\n')}`);
  }

  const entries = [...byUrl.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).map((url) => {
    const input = /** @type {SearchIndexEntryInput} */ (inputs.find((candidate) => slugToUrl(candidate.slug) === url));

    return {
      url,
      title: /** @type {string} */ (input.title).trim(),
      description: /** @type {string} */ (input.description).trim(),
      topic: /** @type {string} */ (input.topic),
      lastReviewed: /** @type {string} */ (input.lastReviewed),
    };
  });

  return { version: SEARCH_INDEX_VERSION, entries };
}

/**
 * Serializa o payload em JSON público, aplicando o teto de bytes.
 * É o único ponto que produz os bytes servidos pelo endpoint e embutidos
 * na página de busca, então é aqui que o teto é cobrado.
 *
 * @param {SearchIndexPayload} payload
 * @returns {string}
 */
export function serializeSearchIndex(payload) {
  const json = JSON.stringify(payload);

  if (typeof json !== 'string') {
    throw new TypeError('search-index: payload não serializável');
  }

  const bytes = new TextEncoder().encode(json).length;

  if (bytes > SEARCH_INDEX_MAX_BYTES) {
    throw new Error(
      `search-index: índice excede o teto de ${SEARCH_INDEX_MAX_BYTES} bytes: ${bytes}`,
    );
  }

  return json;
}
