import { execFileSync } from 'node:child_process';
import { resolveBuildInfo, serializeBuildInfo } from '../lib/build-info.mjs';

export const prerender = true;

/**
 * Endpoint estático com a identidade do build (commit publicado). Lido pela
 * sonda de produção para saber qual versão está servida. Ver
 * `src/lib/build-info.mjs`.
 */
export function GET(): Response {
	const info = resolveBuildInfo({ env: process.env, git: readGit });

	return new Response(serializeBuildInfo(info), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
}

function readGit(): { commit: string; dirty: boolean } | null {
	try {
		const run = (args: string[]) =>
			execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

		return {
			commit: run(['rev-parse', 'HEAD']),
			dirty: run(['status', '--porcelain']) !== '',
		};
	} catch {
		return null;
	}
}
