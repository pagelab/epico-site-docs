// Identidade do build publicado em `/build-info.json`.
//
// Para que serve: a sonda de produção (`scripts/probe-production.mjs`) precisa
// saber QUAL commit a produção serve antes de comparar bytes com um `dist/`
// local. Sem isso, a comparação de 2026-11-22 (trilha D do Brain #44) usou o
// `dist` do worktree, que pode ser de outro commit, e não provava nada sobre a
// versão servida.
//
// Fonte do commit, nesta ordem:
// 1. `WORKERS_CI_COMMIT_SHA`, variável padrão do Workers Builds. Dentro do CI
//    (`WORKERS_CI=1`) ela é obrigatória: sem SHA válido o build falha, para
//    que a produção nunca publique uma identidade vazia.
// 2. `git rev-parse HEAD` no build local, com `dirty: true` quando a árvore
//    tem mudança não commitada (o dist não corresponde a nenhum commit).
// 3. Sem git: `commit: null`, `source: "unknown"`.
//
// O payload é determinístico (sem data do build) e público por desenho: o
// repositório é público (ADR 0005), o SHA não é segredo.

export const BUILD_INFO_VERSION = 1;

const shaPattern = /^[0-9a-f]{40}$/u;

/**
 * @typedef {{ version: 1, commit: string | null, source: 'workers-ci' | 'git' | 'unknown', dirty: boolean }} BuildInfo
 */

/**
 * @param {{ env: Record<string, string | undefined>, git: () => { commit: string, dirty: boolean } | null }} input
 * @returns {BuildInfo}
 */
export function resolveBuildInfo({ env, git }) {
	const ciSha = (env.WORKERS_CI_COMMIT_SHA ?? '').trim().toLowerCase();

	if (env.WORKERS_CI === '1' || ciSha !== '') {
		if (!shaPattern.test(ciSha)) {
			throw new Error(
				`build-info: WORKERS_CI_COMMIT_SHA inválido no Workers Builds ("${ciSha}"), esperado SHA de 40 hex`,
			);
		}

		return { version: BUILD_INFO_VERSION, commit: ciSha, source: 'workers-ci', dirty: false };
	}

	const local = git();

	if (local !== null && shaPattern.test(local.commit)) {
		return { version: BUILD_INFO_VERSION, commit: local.commit, source: 'git', dirty: local.dirty };
	}

	return { version: BUILD_INFO_VERSION, commit: null, source: 'unknown', dirty: false };
}

/**
 * Validação do payload servido, usada pela sonda. Recusa qualquer formato
 * inesperado em vez de tentar interpretar.
 *
 * @param {unknown} value
 * @returns {{ ok: true, info: BuildInfo } | { ok: false, reason: string }}
 */
export function validateBuildInfo(value) {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return { ok: false, reason: 'payload não é objeto' };
	}

	const keys = Object.keys(value).sort().join(',');

	if (keys !== 'commit,dirty,source,version') {
		return { ok: false, reason: `chaves inesperadas: ${keys}` };
	}

	const { version, commit, source, dirty } = /** @type {Record<string, unknown>} */ (value);

	if (version !== BUILD_INFO_VERSION) {
		return { ok: false, reason: `version ${String(version)}` };
	}

	if (!['workers-ci', 'git', 'unknown'].includes(/** @type {string} */ (source))) {
		return { ok: false, reason: `source ${String(source)}` };
	}

	if (typeof dirty !== 'boolean') {
		return { ok: false, reason: 'dirty não é booleano' };
	}

	if (commit !== null && (typeof commit !== 'string' || !shaPattern.test(commit))) {
		return { ok: false, reason: `commit ${String(commit)}` };
	}

	if ((commit === null) !== (source === 'unknown')) {
		return { ok: false, reason: 'commit e source incoerentes' };
	}

	return {
		ok: true,
		info: /** @type {BuildInfo} */ ({ version, commit, source, dirty }),
	};
}

/** @param {BuildInfo} info */
export function serializeBuildInfo(info) {
	return `${JSON.stringify(info)}\n`;
}
