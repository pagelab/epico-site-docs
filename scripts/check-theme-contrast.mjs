// Gate de contraste do tema próprio: resolve as variáveis públicas --sl-* de
// src/styles/theme.css nas duas paletas (dark padrão e light via
// [data-theme='light']) e falha quando qualquer par essencial fica abaixo de
// WCAG AA. As relações semânticas que o tema não redefine vêm do contrato
// público do Starlight 0.42 (props.css): --sl-color-bg aponta para
// --sl-color-black, e o bloco claro herda o dark por cascata.
import { readFile } from 'node:fs/promises';

const THEME_PATH = new URL('../src/styles/theme.css', import.meta.url);

// Pares exigidos por paleta. `4.5` é AA para texto; o anel de foco e cores
// de interface sem texto usam o mínimo de componente visual, `3`.
const REQUIRED_PAIRS = [
  ['corpo sobre fundo', '--sl-color-text', '--sl-color-bg', 4.5],
  ['títulos sobre fundo', '--sl-color-white', '--sl-color-bg', 4.5],
  ['link sobre fundo', '--sl-color-text-accent', '--sl-color-bg', 4.5],
  ['texto de botão sobre ação', '--sl-color-text-invert', '--sl-color-bg-accent', 4.5],
  ['corpo na navegação', '--sl-color-text', '--sl-color-bg-nav', 4.5],
  ['corpo na sidebar', '--sl-color-text', '--sl-color-bg-sidebar', 4.5],
  ['texto secundário na sidebar', '--sl-color-gray-3', '--sl-color-bg-sidebar', 4.5],
  ['corpo em código inline', '--sl-color-text', '--sl-color-bg-inline-code', 4.5],
  ['anel de foco sobre fundo', '--sl-color-accent', '--sl-color-bg', 3],
];

// Defaults públicos do Starlight que o tema não precisa repetir.
const VENDOR_DEFAULTS = {
  '--sl-color-bg': 'var(--sl-color-black)',
};

function parseDeclarations(css) {
  const dark = new Map();
  const light = new Map();
  let target = null;
  let depth = 0;

  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const rawLine of withoutComments.split('\n')) {
    const line = rawLine.trim();

    if (depth === 0 && line.endsWith('{')) {
      const selector = line.slice(0, -1).trim();
      target = selector.includes("[data-theme='light']") ? light : dark;
    }

    if (line === '{') depth += 1;
    else if (line.includes('{')) depth += 1;
    if (line.includes('}')) depth -= 1;

    const match = /^(--[\w-]+)\s*:\s*(.+);$/.exec(line);
    if (match && target && depth >= 1) target.set(match[1], match[2]);
  }

  return { dark, light };
}

function resolveVar(value, effective) {
  let result = value;
  // Resolve de dentro para fora até estabilizar; ciclos estouram o conjunto.
  for (let i = 0; i < 32; i += 1) {
    const useVar = /var\((--[\w-]+)(?:\s*,\s*([^()]+))?\)/.exec(result);
    if (!useVar) return result;
    const [, name, fallback] = useVar;
    const replacement = effective.get(name) ?? fallback ?? '';
    result = result.replace(useVar[0], replacement);
  }
  throw new Error(`var() sem resolução em "${value}"`);
}

function hslToRgb(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const hue = ((h % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  let rgb;
  if (hue < 1) rgb = [chroma, x, 0];
  else if (hue < 2) rgb = [x, chroma, 0];
  else if (hue < 3) rgb = [0, chroma, x];
  else if (hue < 4) rgb = [0, x, chroma];
  else if (hue < 5) rgb = [x, 0, chroma];
  else rgb = [chroma, 0, x];
  const min = light - chroma / 2;
  return rgb.map((channel) => Math.round((channel + min) * 255));
}

function parseColor(value) {
  const value_ = value.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value_);
  if (hex) {
    const digits = hex[1].length === 3
      ? [...hex[1]].map((c) => c + c).join('')
      : hex[1];
    return [
      Number.parseInt(digits.slice(0, 2), 16),
      Number.parseInt(digits.slice(2, 4), 16),
      Number.parseInt(digits.slice(4, 6), 16),
    ];
  }

  const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*[\d.]+)?\s*\)$/i.exec(
    value_,
  );
  if (hsl) return hslToRgb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]));

  throw new Error(`cor sem suporte no gate: "${value_}" (ajuste o tema ou o parser)`);
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const l1 = luminance(parseColor(fg));
  const l2 = luminance(parseColor(bg));
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function effectiveVars(dark, light) {
  const effective = new Map(Object.entries(VENDOR_DEFAULTS));
  for (const [name, value] of dark) effective.set(name, value);
  for (const [name, value] of light) effective.set(name, value);
  return effective;
}

const css = await readFile(THEME_PATH, 'utf8');
const { dark, light } = parseDeclarations(css);
const themes = [
  ['dark', effectiveVars(dark, new Map())],
  ['light', effectiveVars(dark, light)],
];

const failures = [];
const rows = [];

for (const [themeName, vars] of themes) {
  const resolved = new Map();
  for (const name of vars.keys()) {
    resolved.set(name, resolveVar(vars.get(name), vars));
  }

  for (const [label, fgName, bgName, minimum] of REQUIRED_PAIRS) {
    const fg = resolved.get(fgName);
    const bg = resolved.get(bgName);
    if (!fg || !bg) {
      failures.push(`${themeName} ${label}: variável ausente (${fgName} ou ${bgName})`);
      continue;
    }
    const ratio = contrast(fg, bg);
    rows.push(`${themeName}  ${label.padEnd(34)} ${ratio.toFixed(2)}:1  (mín ${minimum})`);
    if (ratio < minimum) {
      failures.push(
        `${themeName} ${label}: ${ratio.toFixed(2)}:1 < ${minimum}:1 (${fgName} ${fg} sobre ${bgName} ${bg})`,
      );
    }
  }
}

console.log(rows.join('\n'));

if (failures.length > 0) {
  console.error(`\nContraste do tema: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\nContraste do tema: PASS');
}
