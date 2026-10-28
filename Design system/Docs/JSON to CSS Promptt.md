**You are a senior design systems engineer. Your task is to write a Node.js script that parses a W3C / Figma Tokens JSON file (\`design-tokens.tokens.json\`) and converts it into a production-ready CSS variables file (\`tokens.css\`).**

**\#\#\#\# 1\. Architectural Principles & Color System Rules**  
Follow industry-standard two-tier design token architecture (W3C DTCG / Material Design 3):  
\- \*\*Tier 1 — Primitive Colors (Foundational / Private):\*\*  
  \- Generated from \`primitives\['key colours'\]\` and \`primitives\['colour palletes'\]\`.  
  \- Prefix with \`--primitive-\` (e.g., \`--primitive-primary-40\`, \`--primitive-neutral-98\`, \`--primitive-key-primary\`).  
  \- \*\*RULE:\*\* Primitives represent raw tonal scales and palettes. They MUST NEVER be used directly in component styling or UI implementation.  
\- \*\*Tier 2 — Color Roles (Semantic / Public UI Contract):\*\*  
  \- Generated from \`'colour roles'\` (e.g., \`primary\`, \`on primary\`, \`surface\`, \`surface container\`, \`on surface\`, \`error\`).  
  \- Prefix with \`--color-\` (e.g., \`--color-primary\`, \`--color-surface\`, \`--color-on-surface\`).  
  \- \*\*RULE:\*\* Color roles MUST resolve to their underlying primitive using CSS \`var(...)\` (e.g., \`--color-primary: var(--primitive-primary-40);\`).  
  \- \*\*RULE:\*\* Color roles are the ONLY color tokens permitted for direct UI consumption (surfaces, text, icons, borders, interactive states).  
  \- This ensures decoupling: modifying themes or dark mode only requires updating role references without touching UI components.

**\#\#\#\# 2\. Typography & Effect Tokens**  
\- \*\*Typography (\`typography\`):\*\*  
  \- Generate atomic CSS variables for each typography role (\`display large\`, \`headline medium\`, \`title small\`, \`body large\`, \`label medium\`, etc.):  
    \- \`--type-{role}-font-family\`  
    \- \`--type-{role}-font-size\` (in \`px\` or \`rem\`)  
    \- \`--type-{role}-font-weight\`  
    \- \`--type-{role}-line-height\` (in \`px\` or unitless ratio)  
    \- \`--type-{role}-letter-spacing\` (in \`px\`)  
  \- Generate shorthand composite utility classes (e.g., \`.type-body-large { font-family: ...; font-size: ...; }\`).  
\- \*\*Effects (\`effect\`):\*\*  
  \- Convert \`custom-shadow\` drop shadows (\`soft shadow\`, \`medium shadow\`, \`hard shadow\`) into valid CSS \`box-shadow\` values:  
    \`--effect-{name}: {offsetX}px {offsetY}px {radius}px {spread}px {color};\`.

**\#\#\#\# 3\. Alias Resolution & Single Source of Truth**  
\- Recursively resolve token aliases formatted as \`{primitives.colour palletes.primary.primary40}\` to their corresponding CSS variable name \`var(--primitive-primary-40)\`.  
\- Convert all keys into consistent \`kebab-case\`.  
\- Group variables in \`:root\` with descriptive comments explaining the hierarchy.  
\- Output clean, valid CSS to ensure \`design-tokens.tokens.json\` remains the authoritative source of truth across web platforms.

