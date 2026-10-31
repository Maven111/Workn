/**
 * scripts/build-tokens.js
 * Converts design-tokens.tokens.json into two-tier CSS variables.
 *
 * Architecture:
 * 1. Primitives: Raw foundational tonal palettes (--primitive-*). NOT used directly in UI.
 * 2. Color Roles: Semantic layer (--color-*). ONLY layer used directly in UI.
 * 3. Typography: Font sizing, weights, line heights (--type-*).
 * 4. Effects: Box shadows (--effect-*).
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.resolve(__dirname, '../design-tokens.tokens.json');
const OUTPUT_FILE = path.resolve(__dirname, '../tokens.css');

function toKebab(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeAlphaHex(hex) {
  if (typeof hex !== 'string') return hex;
  // If hex has 8 characters and ends in 'ff' (full opacity), standard 6-char hex is cleaner
  if (hex.length === 9 && hex.toLowerCase().endsWith('ff')) {
    return hex.slice(0, 7);
  }
  return hex;
}

function buildTokens() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Could not find input file at ${INPUT_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
  const tokens = JSON.parse(rawData);

  const primitiveMap = new Map();
  const primitiveVars = [];
  const colorRoleVars = [];
  const effectVars = [];
  const typographyVars = [];
  const typographyClasses = [];

  // =========================================================================
  // 1. TIER 1: PRIMITIVE TOKENS (Foundational - DO NOT USE DIRECTLY IN UI)
  // =========================================================================

  // 1a. Key Colours
  if (tokens.primitives && tokens.primitives['key colours']) {
    primitiveVars.push('  /* --- Primitive Key Colours --- */');
    for (const [name, token] of Object.entries(tokens.primitives['key colours'])) {
      const cleanName = name.replace(' key colour', '');
      const varName = `--primitive-key-${toKebab(cleanName)}`;
      const val = normalizeAlphaHex(token.value);
      primitiveMap.set(`primitives.key colours.${name}`, varName);
      primitiveVars.push(`  ${varName}: ${val};`);
    }
    primitiveVars.push('');
  }

  // 1b. Tonal Palettes (Primary, Secondary, Neutral, etc.)
  if (tokens.primitives && tokens.primitives['colour palletes']) {
    primitiveVars.push('  /* --- Primitive Tonal Palettes (HCT Scales) --- */');
    for (const [paletteName, steps] of Object.entries(tokens.primitives['colour palletes'])) {
      const paletteSlug = toKebab(paletteName);
      primitiveVars.push(`  /* Palette: ${paletteName} */`);

      for (const [stepKey, token] of Object.entries(steps)) {
        const toneNum = stepKey.replace(/^[a-zA-Z\s]+/, '');
        const varName = `--primitive-${paletteSlug}-${toneNum}`;
        const val = normalizeAlphaHex(token.value);

        primitiveMap.set(`primitives.colour palletes.${paletteName}.${stepKey}`, varName);
        primitiveVars.push(`  ${varName}: ${val};`);
      }
      primitiveVars.push('');
    }
  }

  // =========================================================================
  // 2. TIER 2: COLOR ROLES (Semantic - USE DIRECTLY IN UI)
  // =========================================================================
  if (tokens['colour roles']) {
    colorRoleVars.push('  /* ======================================================================= */');
    colorRoleVars.push('  /* COLOR ROLES (SEMANTIC) - CONSUME THESE DIRECTLY IN UI COMPONENTS       */');
    colorRoleVars.push('  /* ======================================================================= */');

    for (const [roleName, token] of Object.entries(tokens['colour roles'])) {
      const roleSlug = toKebab(roleName);
      const varName = `--color-${roleSlug}`;

      // Resolve alias reference, e.g.: "{primitives.colour palletes.primary.primary40}"
      const refKey = token.value.replace(/[{}]/g, '');
      const mappedPrimitive = primitiveMap.get(refKey);

      if (mappedPrimitive) {
        const comment = token.description ? ` /* ${token.description} */` : '';
        colorRoleVars.push(`  ${varName}: var(${mappedPrimitive});${comment}`);
      } else {
        colorRoleVars.push(`  ${varName}: ${normalizeAlphaHex(token.value)};`);
      }
    }
  }

  // =========================================================================
  // 3. EFFECT / ELEVATION TOKENS
  // =========================================================================
  if (tokens.effect) {
    effectVars.push('  /* ======================================================================= */');
    effectVars.push('  /* ELEVATION & SHADOW EFFECTS                                             */');
    effectVars.push('  /* ======================================================================= */');

    for (const [effectName, token] of Object.entries(tokens.effect)) {
      const slug = toKebab(effectName);
      if (token.type === 'custom-shadow' && token.value) {
        const { offsetX, offsetY, radius, spread, color } = token.value;
        effectVars.push(
          `  --effect-${slug}: ${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color};`
        );
      }
    }
  }

  // =========================================================================
  // 4. TYPOGRAPHY TOKENS
  // =========================================================================
  if (tokens.typography) {
    typographyVars.push('  /* ======================================================================= */');
    typographyVars.push('  /* TYPOGRAPHY TOKENS                                                       */');
    typographyVars.push('  /* ======================================================================= */');

    for (const [typeName, styles] of Object.entries(tokens.typography)) {
      const slug = toKebab(typeName);
      const ff = styles.fontFamily?.value ? `'${styles.fontFamily.value}', sans-serif` : 'inherit';
      const fs = styles.fontSize?.value ? `${styles.fontSize.value}px` : '16px';
      const fw = styles.fontWeight?.value || 400;
      const lh = styles.lineHeight?.value ? `${styles.lineHeight.value}px` : 'normal';
      const ls = styles.letterSpacing?.value !== undefined ? `${styles.letterSpacing.value}px` : 'normal';

      typographyVars.push(`  --type-${slug}-font-family: ${ff};`);
      typographyVars.push(`  --type-${slug}-font-size: ${fs};`);
      typographyVars.push(`  --type-${slug}-font-weight: ${fw};`);
      typographyVars.push(`  --type-${slug}-line-height: ${lh};`);
      typographyVars.push(`  --type-${slug}-letter-spacing: ${ls};`);

      typographyClasses.push(`.type-${slug} {`);
      typographyClasses.push(`  font-family: var(--type-${slug}-font-family);`);
      typographyClasses.push(`  font-size: var(--type-${slug}-font-size);`);
      typographyClasses.push(`  font-weight: var(--type-${slug}-font-weight);`);
      typographyClasses.push(`  line-height: var(--type-${slug}-line-height);`);
      typographyClasses.push(`  letter-spacing: var(--type-${slug}-letter-spacing);`);
      typographyClasses.push(`}\n`);
    }
  }

  // =========================================================================
  // 5. SPACING TOKENS (Approved 8pt/4pt Modular System)
  // =========================================================================
  const spacingVars = [
    '  /* ======================================================================= */',
    '  /* SPACING TOKENS (8PT / 4PT MODULAR SCALE)                                */',
    '  /* ======================================================================= */',
    '  --space-1: 4px;',
    '  --space-2: 8px;',
    '  --space-3: 12px;',
    '  --space-4: 16px;',
    '  --space-5: 20px;',
    '  --space-6: 24px;',
    '  --space-8: 32px;',
    '  --space-10: 40px;',
    '  --space-12: 48px;',
    '  --space-16: 64px;',
  ];

  // =========================================================================
  // 6. BORDER RADIUS TOKENS (Approved Surface Geometry)
  // =========================================================================
  const radiusVars = [
    '  /* ======================================================================= */',
    '  /* BORDER RADIUS TOKENS                                                    */',
    '  /* ======================================================================= */',
    '  --radius-xs: 4px;',
    '  --radius-sm: 6px;',
    '  --radius-md: 10px;',
    '  --radius-lg: 16px;',
    '  --radius-xl: 24px;',
    '  --radius-full: 9999px;',
  ];

  // Assemble CSS document
  const cssContent = `/**
 * AUTOGENERATED FROM design-tokens.tokens.json
 * DO NOT EDIT DIRECTLY.
 *
 * ARCHITECTURAL GUIDELINE:
 * - DO NOT use --primitive-* variables in UI components.
 * - ALWAYS use --color-* (semantic roles) for UI elements, text, surfaces, and borders.
 * - ALWAYS use --space-* and --radius-* for spacing and geometry.
 */

:root {
  /* ======================================================================= */
  /* 1. PRIMITIVES (TIER 1: FOUNDATIONS)                                    */
  /* DO NOT CONSUME DIRECTLY IN UI COMPONENTS                               */
  /* ======================================================================= */
${primitiveVars.join('\n')}

${colorRoleVars.join('\n')}

${effectVars.join('\n')}

${typographyVars.join('\n')}

${spacingVars.join('\n')}

${radiusVars.join('\n')}
}

/* ========================================================================= */
/* TYPOGRAPHY UTILITY CLASSES                                                */
/* ========================================================================= */
${typographyClasses.join('\n')}
`;

  fs.writeFileSync(OUTPUT_FILE, cssContent, 'utf8');
  console.log(`Tokens compiled successfully to ${OUTPUT_FILE}`);
}

buildTokens();
