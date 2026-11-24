/**
 * Identidade do build (`/build-info.json`), lida pela sonda de produção para
 * saber qual commit está servido antes de comparar bytes com um dist local.
 */
import { describe, expect, it } from 'vitest';
import {
	resolveBuildInfo,
	serializeBuildInfo,
	validateBuildInfo,
} from '../src/lib/build-info.mjs';

const SHA = '0123456789abcdef0123456789abcdef01234567';
const noGit = () => null;

describe('build-info: resolveBuildInfo', () => {
	it('usa o SHA do Workers Builds e ignora o git local', () => {
		const info = resolveBuildInfo({
			env: { WORKERS_CI: '1', WORKERS_CI_COMMIT_SHA: SHA.toUpperCase() },
			git: () => ({ commit: 'f'.repeat(40), dirty: true }),
		});

		expect(info).toEqual({ version: 1, commit: SHA, source: 'workers-ci', dirty: false });
	});

	it('falha o build no CI sem SHA válido', () => {
		expect(() => resolveBuildInfo({ env: { WORKERS_CI: '1' }, git: noGit })).toThrow(/WORKERS_CI_COMMIT_SHA/);
		expect(() =>
			resolveBuildInfo({ env: { WORKERS_CI_COMMIT_SHA: 'abc' }, git: noGit }),
		).toThrow(/WORKERS_CI_COMMIT_SHA/);
	});

	it('cai para o git local e marca mudança não commitada', () => {
		expect(resolveBuildInfo({ env: {}, git: () => ({ commit: SHA, dirty: true }) })).toEqual({
			version: 1,
			commit: SHA,
			source: 'git',
			dirty: true,
		});
	});

	it('sem git nem CI, commit nulo com source unknown', () => {
		expect(resolveBuildInfo({ env: {}, git: noGit })).toEqual({
			version: 1,
			commit: null,
			source: 'unknown',
			dirty: false,
		});
		expect(resolveBuildInfo({ env: {}, git: () => ({ commit: 'lixo', dirty: false }) }).source).toBe('unknown');
	});
});

describe('build-info: validateBuildInfo', () => {
	it('aceita o que o gerador produz (round-trip)', () => {
		const info = resolveBuildInfo({ env: { WORKERS_CI: '1', WORKERS_CI_COMMIT_SHA: SHA }, git: noGit });
		const parsed = validateBuildInfo(JSON.parse(serializeBuildInfo(info)));

		expect(parsed).toEqual({ ok: true, info });
	});

	it.each([
		['array', []],
		['nulo', null],
		['chave extra', { version: 1, commit: SHA, source: 'git', dirty: false, extra: 1 }],
		['versão futura', { version: 2, commit: SHA, source: 'git', dirty: false }],
		['source desconhecido', { version: 1, commit: SHA, source: 'manual', dirty: false }],
		['commit curto', { version: 1, commit: 'abc1234', source: 'git', dirty: false }],
		['commit com maiúsculas', { version: 1, commit: SHA.toUpperCase(), source: 'git', dirty: false }],
		['dirty como string', { version: 1, commit: SHA, source: 'git', dirty: 'false' }],
		['commit nulo com source git', { version: 1, commit: null, source: 'git', dirty: false }],
		['commit com source unknown', { version: 1, commit: SHA, source: 'unknown', dirty: false }],
	])('rejeita %s', (_label, value) => {
		expect(validateBuildInfo(value).ok).toBe(false);
	});
});
