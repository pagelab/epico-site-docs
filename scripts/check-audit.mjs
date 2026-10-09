// Gate de vulnerabilidades de dependências, o passo `npm run audit` do verify.
// Executável por `node scripts/check-audit.mjs` e importável pelos testes de
// regressão em tests/audit-gate.test.ts.
//
// Equivale a `npm audit --audit-level=high` com UMA diferença decidida pelo
// owner em 2026-10-09 (opção A do TASKS.md): exceções NOMEADAS por advisory.
// O `npm audit` não tem lista de ignorados, e o `braces` até 3.0.3
// (GHSA-vfj7-8cjw-p6xm) não tem versão corrigida publicada, o que mantinha o
// verify, e portanto todo deploy do Workers Builds, bloqueado.
//
// Regras:
// - todo advisory high ou critical precisa estar em `allowedAdvisories`, por
//   id GHSA e nome do pacote. Um advisory novo, mesmo no mesmo pacote, falha;
// - uma exceção expira sozinha quando o npm passa a indicar correção
//   não-major para o pacote afetado (`fixAvailable` verdadeiro ou com
//   `isSemVerMajor: false`): o gate falha pedindo a atualização;
// - formato inesperado, erro do npm, timeout ou severidade high sem advisory
//   raiz verificável FALHAM. Na dúvida o gate bloqueia, nunca libera.
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const blockingSeverities = new Set(['high', 'critical']);

/**
 * Exceções vigentes. Remover a entrada assim que existir versão corrigida.
 *
 * @type {ReadonlyArray<{ id: string, package: string, decidedBy: string, reason: string }>}
 */
export const allowedAdvisories = [
	{
		id: 'GHSA-vfj7-8cjw-p6xm',
		package: 'braces',
		decidedBy: 'owner, 2026-10-09',
		reason:
			'sem versão corrigida (3.0.3 é a última publicada). Os padrões de glob vêm só de configuração do mantenedor, sem entrada remota, e o efeito possível é derrubar o build ou o lint.',
	},
];

const advisoryUrlPattern = /^https:\/\/github\.com\/advisories\/(GHSA-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4})$/u;

/** @param {unknown} value */
function isRecord(value) {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} via */
function advisoryId(via) {
	const url = isRecord(via) ? via.url : undefined;
	const match = typeof url === 'string' ? advisoryUrlPattern.exec(url) : null;
	return match ? match[1] : null;
}

/**
 * Advisories high ou critical alcançáveis a partir de um nó, seguindo as
 * referências por nome do campo `via` (com guarda contra ciclos).
 *
 * @param {string} name
 * @param {Record<string, unknown>} nodes
 * @param {Set<string>} seen
 * @returns {Array<Record<string, unknown>>}
 */
function reachableBlockingAdvisories(name, nodes, seen = new Set()) {
	if (seen.has(name)) {
		return [];
	}
	seen.add(name);

	const node = nodes[name];
	if (!isRecord(node) || !Array.isArray(node.via)) {
		return [];
	}

	const found = [];
	for (const via of node.via) {
		if (typeof via === 'string') {
			found.push(...reachableBlockingAdvisories(via, nodes, seen));
		} else if (isRecord(via) && blockingSeverities.has(String(via.severity))) {
			found.push(via);
		}
	}
	return found;
}

/**
 * @param {unknown} fixAvailable
 * @returns {boolean} correção que o npm aplicaria sem quebra de major
 */
function hasNonMajorFix(fixAvailable) {
	if (fixAvailable === true) {
		return true;
	}
	return isRecord(fixAvailable) && fixAvailable.isSemVerMajor === false;
}

/**
 * Avalia o relatório `npm audit --json` (auditReportVersion 2).
 *
 * @param {unknown} report
 * @param {ReadonlyArray<{ id: string, package: string }>} allowed
 * @returns {{ violations: string[], exceptions: typeof allowedAdvisories[number][] }}
 */
export function evaluateAudit(report, allowed = allowedAdvisories) {
	/** @type {string[]} */
	const violations = [];
	/** @type {Set<typeof allowedAdvisories[number]>} */
	const used = new Set();

	if (!isRecord(report)) {
		return { violations: ['npm audit não devolveu um relatório JSON utilizável'], exceptions: [] };
	}

	if (report.error !== undefined) {
		const summary = isRecord(report.error) && typeof report.error.summary === 'string'
			? `: ${report.error.summary}`
			: '';
		return { violations: [`npm audit devolveu erro${summary}`], exceptions: [] };
	}

	const metadataCounts = isRecord(report.metadata) ? report.metadata.vulnerabilities : undefined;
	if (
		report.auditReportVersion !== 2
		|| !isRecord(report.vulnerabilities)
		|| !isRecord(metadataCounts)
	) {
		return {
			violations: ['formato inesperado do relatório do npm audit (esperado auditReportVersion 2 com vulnerabilities e metadata)'],
			exceptions: [],
		};
	}

	const nodes = report.vulnerabilities;
	const blockingNodes = Object.entries(nodes).filter(
		([, node]) => isRecord(node) && blockingSeverities.has(String(node.severity)),
	);

	const reportedBlocking = Number(metadataCounts.high ?? 0) + Number(metadataCounts.critical ?? 0);
	if (reportedBlocking > 0 && blockingNodes.length === 0) {
		violations.push(`metadata aponta ${reportedBlocking} vulnerabilidade(s) high ou critical, mas o relatório não detalha nenhuma`);
	}

	/** Advisories raiz, deduplicados, com o nó que os carrega. */
	const seenAdvisories = new Set();
	for (const [name, node] of blockingNodes) {
		if (!isRecord(node) || !Array.isArray(node.via)) {
			continue;
		}

		for (const via of node.via) {
			if (!isRecord(via) || !blockingSeverities.has(String(via.severity))) {
				continue;
			}

			const id = advisoryId(via);
			const advisoryName = typeof via.name === 'string' ? via.name : name;
			const key = `${id ?? via.url ?? via.source}|${advisoryName}`;
			if (seenAdvisories.has(key)) {
				continue;
			}
			seenAdvisories.add(key);

			const match = id === null
				? undefined
				: allowed.find((entry) => entry.id === id && entry.package === advisoryName);

			if (match === undefined) {
				violations.push(
					`${advisoryName}: advisory ${via.severity} sem exceção vigente (${id ?? via.url ?? 'sem identificação'}): ${via.title ?? 'sem título'}`,
				);
				continue;
			}

			if (hasNonMajorFix(node.fixAvailable)) {
				violations.push(
					`${advisoryName}: a exceção de ${match.id} expirou porque o npm indica correção sem quebra de major. Rode \`npm audit fix\` e remova a entrada de allowedAdvisories`,
				);
				continue;
			}

			used.add(/** @type {typeof allowedAdvisories[number]} */ (match));
		}
	}

	for (const [name, node] of blockingNodes) {
		if (reachableBlockingAdvisories(name, nodes).length === 0) {
			violations.push(
				`${name}: severidade ${isRecord(node) ? node.severity : 'desconhecida'} sem advisory raiz verificável no relatório`,
			);
		}
	}

	return { violations, exceptions: [...used] };
}

/**
 * Roda `npm audit --json` e devolve o relatório, ou o motivo de não ter
 * conseguido um. O npm sai com 1 quando há vulnerabilidades, então o código
 * de saída não é critério: o JSON é.
 *
 * @returns {{ report: unknown } | { failure: string }}
 */
export function runNpmAudit() {
	const result = spawnSync('npm', ['audit', '--json'], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		timeout: 180_000,
	});

	if (result.error !== undefined) {
		return { failure: `não foi possível executar npm audit: ${result.error.message}` };
	}

	if (result.signal !== null) {
		return { failure: `npm audit interrompido pelo sinal ${result.signal}` };
	}

	try {
		return { report: JSON.parse(result.stdout) };
	} catch {
		return { failure: 'a saída do npm audit --json não é JSON válido' };
	}
}

const invokedDirectly = process.argv[1] !== undefined
	&& import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
	const outcome = runNpmAudit();
	const { violations, exceptions } = 'failure' in outcome
		? { violations: [outcome.failure], exceptions: [] }
		: evaluateAudit(outcome.report);

	if (violations.length > 0) {
		console.error('Dependency audit: FAIL');
		console.error(violations.map((violation) => `- ${violation}`).join('\n'));
		process.exitCode = 1;
	} else {
		for (const entry of exceptions) {
			console.log(`Exceção vigente: ${entry.id} (${entry.package}), decidida por ${entry.decidedBy}: ${entry.reason}`);
		}
		console.log(`Dependency audit: PASS (nenhum high ou critical fora das exceções nomeadas, ${exceptions.length} vigente(s))`);
	}
}
