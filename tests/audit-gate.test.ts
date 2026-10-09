/**
 * Regressão do gate de vulnerabilidades de dependências. A suíte cobre
 * `evaluateAudit` do `scripts/check-audit.mjs` com relatórios sintéticos do
 * formato `npm audit --json` (auditReportVersion 2), sem rede: a exceção
 * nomeada do `braces` passa, qualquer outro high ou critical falha, a exceção
 * expira quando há correção não-major e tudo que foge do formato falha fechado.
 */
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { allowedAdvisories, evaluateAudit } from '../scripts/check-audit.mjs';

const root = new URL('../', import.meta.url);

const BRACES_ID = 'GHSA-vfj7-8cjw-p6xm';

type Via = string | Record<string, unknown>;

function advisory(name: string, id: string, severity = 'high'): Record<string, unknown> {
	return {
		source: 1,
		name,
		dependency: name,
		title: `${name} advisory`,
		url: `https://github.com/advisories/${id}`,
		severity,
		range: '<=1.0.0',
	};
}

function node(
	name: string,
	severity: string,
	via: Via[],
	fixAvailable: unknown = false,
): Record<string, unknown> {
	return { name, severity, isDirect: false, via, effects: [], range: '*', nodes: [], fixAvailable };
}

function report(
	vulnerabilities: Record<string, unknown>,
	counts: { high?: number; critical?: number } = {},
): Record<string, unknown> {
	const high = counts.high ?? Object.values(vulnerabilities).filter(
		(entry) => (entry as { severity: string }).severity === 'high',
	).length;
	const critical = counts.critical ?? Object.values(vulnerabilities).filter(
		(entry) => (entry as { severity: string }).severity === 'critical',
	).length;

	return {
		auditReportVersion: 2,
		vulnerabilities,
		metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high, critical, total: high + critical } },
	};
}

/** Cadeia do caso real: braces (raiz) -> micromatch -> globby -> markdownlint-cli2. */
function bracesChain(bracesFix: unknown = {
	name: 'markdownlint-cli2',
	version: '0.21.0',
	isSemVerMajor: true,
}) {
	return {
		braces: node('braces', 'high', [advisory('braces', BRACES_ID)], bracesFix),
		micromatch: node('micromatch', 'high', ['braces']),
		globby: node('globby', 'high', ['micromatch']),
		'markdownlint-cli2': node('markdownlint-cli2', 'high', ['globby']),
	};
}

describe('exceção nomeada do audit', () => {
	it('declara exatamente o advisory do braces decidido pelo owner', () => {
		expect(allowedAdvisories).toHaveLength(1);
		expect(allowedAdvisories[0]).toMatchObject({
			id: BRACES_ID,
			package: 'braces',
			decidedBy: 'owner, 2026-10-09',
		});
		expect(allowedAdvisories[0].reason.length).toBeGreaterThan(40);
	});

	it('passa com relatório sem vulnerabilidades', () => {
		const result = evaluateAudit(report({}));

		expect(result.violations).toEqual([]);
		expect(result.exceptions).toEqual([]);
	});

	it('ignora advisories abaixo de high', () => {
		const result = evaluateAudit(
			report({
				'fast-uri': node('fast-uri', 'moderate', [advisory('fast-uri', 'GHSA-aaaa-bbbb-cccc', 'moderate')]),
			}),
		);

		expect(result.violations).toEqual([]);
	});

	it('passa a cadeia do braces e informa a exceção usada', () => {
		const result = evaluateAudit(report(bracesChain()));

		expect(result.violations).toEqual([]);
		expect(result.exceptions.map((entry) => entry.id)).toEqual([BRACES_ID]);
	});

	it('falha quando aparece outro advisory high junto da cadeia do braces', () => {
		const result = evaluateAudit(
			report({
				...bracesChain(),
				sharp: node('sharp', 'high', [advisory('sharp', 'GHSA-wq5f-xc86-pv6w')]),
			}),
		);

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('sharp');
		expect(result.violations[0]).toContain('GHSA-wq5f-xc86-pv6w');
	});

	it('falha para advisory critical sem exceção', () => {
		const result = evaluateAudit(
			report({ axios: node('axios', 'critical', [advisory('axios', 'GHSA-dddd-eeee-ffff', 'critical')]) }),
		);

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('axios');
		expect(result.violations[0]).toContain('GHSA-dddd-eeee-ffff');
		expect(result.violations[0]).toContain('critical');
	});

	it('falha para novo advisory high no mesmo pacote com outro id', () => {
		const result = evaluateAudit(
			report({ braces: node('braces', 'high', [advisory('braces', 'GHSA-gggg-hhhh-iiii')]) }),
		);

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('GHSA-gggg-hhhh-iiii');
	});

	it('falha quando o id da exceção aparece em outro pacote', () => {
		const result = evaluateAudit(
			report({ minimatch: node('minimatch', 'high', [advisory('minimatch', BRACES_ID)]) }),
		);

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('minimatch');
	});

	it('falha quando o advisory chega sem URL de advisory reconhecível', () => {
		const withoutUrl = { ...advisory('braces', BRACES_ID), url: 'https://example.com/other' };
		const result = evaluateAudit(report({ braces: node('braces', 'high', [withoutUrl]) }));

		expect(result.violations).toHaveLength(1);
	});

	it('usa a lista de exceções recebida, não uma fixa', () => {
		const result = evaluateAudit(report(bracesChain()), []);

		expect(result.violations).toHaveLength(1);
		expect(result.exceptions).toEqual([]);
	});
});

describe('expiração da exceção', () => {
	it.each([
		['fixAvailable verdadeiro', true],
		['correção não-major', { name: 'braces', version: '3.0.4', isSemVerMajor: false }],
	])('falha com %s e pede a atualização', (_label, fix) => {
		const result = evaluateAudit(report(bracesChain(fix)));

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('expirou');
		expect(result.violations[0]).toContain('npm audit fix');
		expect(result.exceptions).toEqual([]);
	});

	it.each([
		['sem correção', false],
		['só correção major (downgrade destrutivo)', { name: 'starlight-llms-txt', version: '0.1.2', isSemVerMajor: true }],
	])('mantém a exceção %s', (_label, fix) => {
		const result = evaluateAudit(report(bracesChain(fix)));

		expect(result.violations).toEqual([]);
		expect(result.exceptions).toHaveLength(1);
	});
});

describe('falha fechada', () => {
	it.each([
		['null', null],
		['texto', 'ok'],
		['lista', []],
	])('rejeita relatório %s', (_label, value) => {
		expect(evaluateAudit(value).violations).toHaveLength(1);
	});

	it('rejeita erro devolvido pelo npm, com o resumo', () => {
		const result = evaluateAudit({ error: { code: 'ENOAUDIT', summary: 'registry fora do ar' } });

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('registry fora do ar');
	});

	it.each([
		['versão de relatório diferente', { ...report({}), auditReportVersion: 1 }],
		['sem vulnerabilities', { auditReportVersion: 2, metadata: { vulnerabilities: {} } }],
		['sem metadata', { auditReportVersion: 2, vulnerabilities: {} }],
	])('rejeita %s', (_label, value) => {
		const result = evaluateAudit(value);

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('formato inesperado');
	});

	it('rejeita metadata com high ou critical que o relatório não detalha', () => {
		const result = evaluateAudit(report({}, { high: 2 }));

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('não detalha nenhuma');
	});

	it('rejeita nó high sem advisory raiz alcançável', () => {
		const result = evaluateAudit(
			report({ orphan: node('orphan', 'high', ['missing-package']) }),
		);

		expect(result.violations).toHaveLength(1);
		expect(result.violations[0]).toContain('sem advisory raiz');
	});

	it('não entra em laço com via circular', () => {
		const result = evaluateAudit(
			report({
				a: node('a', 'high', ['b']),
				b: node('b', 'high', ['a']),
			}),
		);

		expect(result.violations).toHaveLength(2);
	});
});

describe('integração com o package.json', () => {
	it('aponta o script audit para o gate e o mantém no verify', async () => {
		const packageJson = JSON.parse(
			await readFile(new URL('package.json', root), 'utf8'),
		) as { scripts: Record<string, string> };

		expect(packageJson.scripts.audit).toBe('node scripts/check-audit.mjs');
		expect(packageJson.scripts.verify).toContain('npm run audit');
		expect(packageJson.scripts.verify.indexOf('npm run audit')).toBeLessThan(
			packageJson.scripts.verify.indexOf('node scripts/check-install-scripts.mjs'),
		);
	});
});
