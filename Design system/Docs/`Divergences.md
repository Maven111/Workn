  
**DIVERGENCE 1: PRIMARY COLOUR CONTRAST**

**Material 3 default:**  
In the standard light scheme, Primary uses tone 40 and On Primary uses tone 100\.

**Workn's brand choice:**  
Primary uses Primary 40 (\#16A34A), while On Primary uses Primary 99 (\#F9FFF5).

**Why:**  
Tone 99 introduces a near-white green tint instead of pure white, helping the interface maintain a consistent brand colour character.

**When this would be wrong:**  
When the pairing is used for normal-sized text. Its contrast ratio is only 3.24:1, below WCAG AA's 4.5:1 requirement. Use a more contrasting foreground or a different background for normal text.

**DIVERGENCE 2: PRIMARY CONTAINER TEXT TONE**

**Material 3 default:**  
The standard light scheme pairs Primary Container tone 90 with On Primary Container tone 10\.

**Workn's brand choice:**  
Workn uses Primary 90 (\#AAFFB3) with Primary 30 (\#007933).

**Why:**  
The darker tone 30 provides a strong green-on-light-green combination while keeping the interface within the brand palette.

**When this would be wrong:**  
When the darker text is not sufficiently distinct from the container in a particular use. The current pairing reaches 4.67:1, which passes WCAG AA for normal text, but the actual rendered colours should still be checked if opacity or overlays are applied.

**DIVERGENCE 3: GREEN-TINTED NEUTRAL SURFACES**

**Material 3 default:**  
Material 3 maps surface roles to neutral and neutral-variant tonal palettes. The resulting colour character depends on the generated theme.

**Workn's brand choice:**  
Workn's neutral and neutral-variant palettes are visibly green-tinted. For example, Surface uses Neutral 98 (\#EEFDF0), while Surface Variant uses Neutral Variant 90 (\#D3E8D8).

**Why:**  
This makes the workspace feel connected to Workn's green identity without requiring every component to use a saturated brand colour.

**When this would be wrong:**  
When the green tint makes the interface feel visually busy, reduces perceived neutrality, or competes with status colours and data visualisations. A more neutral surface system may be preferable for a product that needs a strictly neutral enterprise interface.

**DIVERGENCE 4: TYPOGRAPHY FAMILY**

**Material 3 default:**  
The documented Material 3 type scale uses Roboto, including medium-weight variants for title and label styles.

**Workn's brand choice:**  
Workn uses Space Grotesk for display and most large headline styles, and Manrope for smaller headlines, titles, body text, and labels.

**Why:**  
Space Grotesk gives large headings a more distinctive, contemporary character. Manrope provides a consistent, clean interface voice for reading, navigation, forms, and data-heavy screens.

**When this would be wrong:**  
When the fonts are unavailable, load slowly, render inconsistently across platforms, or reduce readability at small sizes. The two-family approach also becomes less effective if the styles are used inconsistently.

**DIVERGENCE 5: TYPE SCALE, LINE HEIGHT AND LETTER SPACING**

**Material 3 default:**  
The standard scale includes Display Large at 57px with 64px line height, Display Medium at 45px with 52px line height, and Display Small at 36px with 44px line height. Other styles follow Material's established size and line-height scale.

**Workn's brand choice:**  
Workn uses Display Large at 70px/105px, Display Medium at 50px/75px, and Display Small at 42px/63px. The typography tokens also use tighter negative letter spacing, including \-3.5px for Display Large.

**Why**:  
The larger sizes and generous line heights create a more expressive hierarchy, allowing major headings to feel prominent and distinct from functional interface text.

**When this would be wrong:**  
When large headings consume too much vertical space, push essential information below the fold, or wrap awkwardly on smaller screens. Very tight tracking can also reduce readability, particularly at smaller sizes. Responsive typography and real-device testing are essential.

