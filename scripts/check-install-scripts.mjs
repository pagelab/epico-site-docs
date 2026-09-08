// Falha quando alguma dependência tem script de instalação sem cobertura
// explícita em `allowScripts`. O `npm install-scripts ls` é apenas informativo
// (sempre sai com code 0), então o gate depende desta tradução para exit code.
import { execFileSync } from 'node:child_process';

const clean = 'No packages with unreviewed install scripts.';

try {
  const output = execFileSync('npm', ['install-scripts', 'ls'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (!output.includes(clean)) {
    console.error(output.trim());
    process.exitCode = 1;
  } else {
    console.log('Install scripts policy: PASS');
  }
} catch (error) {
  console.error(String(error.stdout ?? error));
  process.exitCode = 1;
}
