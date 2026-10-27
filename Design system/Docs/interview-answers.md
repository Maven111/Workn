**1\. How would you structure design tokens?**

I structure tokens in three tiers. Primitive tokens hold raw values and are named by what they are: primary.40 is \#*16A34A*, Neutral98 is a surface tone. Semantic tokens, which I call colour roles, are named by job and point at primitives: Primary points at Primary40, On Primary points at a dark or light primitive, Surface points at Neutral98. Component tokens, such as a button background, point at roles. The rule is that references only flow downward. Interfaces use roles, never primitives and never hex values, so there is one place to change a decision.

Typography and effects are composite tokens: each of my 15 type styles bundles family, weight, size, line height and letter spacing, and my three shadows bundle offsets, blur, spread and a colour built from the primary. Names describe purpose, not appearance, because a role called "green" breaks the day the brand changes. Light and dark themes are two mappings of the same role names to different primitive tones. The whole set is exported as JSON, including Figma variables, and converted to CSS variables by a script, so code consumes the same structure Figma defines.  
\---

**2\. When is a token change breaking?**

It depends on what the consumer relies on. Renaming or removing a token is always breaking, because every reference to it fails. Changing the type of a token, say a colour into a dimension, is breaking for the same reason. Changing a value is breaking when it violates something consumers depend on. Contrast is one example: if On Primary moves to a tone that drops the pair below 4.5:1, text becomes unreadable even though nothing fails to compile. Meaning is another: turning primary from green to red inside a product where red means error. Layout is a third: a larger font size or line height can overflow fixed-height containers and cut text off. A change to a primitive is the widest, because every role referencing it moves with it.

Non-breaking changes are additions, and value changes that keep every documented guarantee. In practice I version the token package, deprecate before deleting, and re-run contrast checks on every role pair when a value changes. Repointing my On Primary from Primary99 to Primary10 changes appearance, but it restores a guarantee, so it is a fix and not a break.  
\---

**3\. How would you support multiple brands and themes?**

I keep the semantic layer identical and swap what it points at. Roles such as Primary, On Primary and Surface have the same names everywhere. A theme is a mapping from those names to primitive tones. For light and dark, Primary points at tone 40 in light and tone 80 in dark, from the same tonal palette, so one source colour supports both. For multiple brands, each brand has its own primitives, generated from its own key colours, and the same role mapping is applied to each. In Figma this is variable collections with modes. In code it is CSS variables scoped by attributes such as data-theme and data-brand, so components never change.

The cost is testing. Every brand and theme combination needs its own contrast check, because a role pair that passes in one palette can fail in another. My pinned primary shows this: white on \#16A34A is about 3.3:1, while the default Material primary 40 passes comfortably. I would also keep brand-specific exceptions out of components. If a brand needs a different shape or spacing, that is a token too.  
\---

**4\. Can tokens guarantee accessible contrast?**

No. A token is a name attached to a value. It can make contrast checkable and consistent, but it cannot guarantee it, for three reasons. First, contrast belongs to a pair, not to one colour. A text token is only readable against the backgrounds it actually lands on, and nothing stops a developer placing it on the wrong one. Second, tokens faithfully store whatever value you gave them, including a bad one. In my system, standard white On Primary on my pinned primary \#16A34A is about 3.3:1, below the 4.5:1 text minimum. The token held that failure without complaint. Third, contrast changes with context: hover and disabled states, opacity, text over images, and user text-spacing overrides.

What tokens do give you is structure. Because I defined On roles that pair with specific backgrounds, I could list every pair, record a ratio for each, and then fix or restrict the failures. Real assurance comes from automated checks on those pairs, testing in the built interface, and not relying on colour alone, since contrast ratios say nothing about colour blindness.  
\---

**5\. How do you ensure that colour contrast guidelines are met within a website or application's design?**

I treat it as a process, not a property. First I define the role pairs I will actually use: each On role against its background, text against each surface, and borders against the surface they sit on. Then I check each pair, in light and dark separately, against WCAG AA: 4.5:1 for normal text, and 3:1 for large text and UI components such as input borders. I record the ratio for every pair in a table. Any pair that fails is either fixed by repointing the role, or documented as not used for text, with a reason.

That process found real problems in my system. On Primary at 3.24:1 failed and needed repointing. An outline role at about 2.2:1 failed the 3:1 border minimum. Primary on a light surface is about 3.1:1, so I limit it to buttons and icons, not text. After tokens are defined, I would automate the same pair checks so a later change cannot silently break them, then test the built screens with a tool such as axe and on real devices. Colour must also never be the only signal, so errors carry an icon.  
\---

**6\. Can you discuss the differences between WCAG levels A, AA and AAA?**

The levels are cumulative: AA includes everything in A, and AAA includes both. Level A is the minimum, covering barriers that block people completely, such as text alternatives for images and keyboard operability. Level AA is the standard most teams and regulations target. It adds requirements such as 4.5:1 text contrast, 3:1 contrast for UI components, visible keyboard focus, and content that survives text resizing and spacing changes. Level AAA is the strictest. It asks for things like 7:1 contrast and line spacing of at least 1.5 within paragraphs. W3C does not recommend requiring AAA for whole sites, because some content cannot meet every AAA criterion.

In my own work, I used AA as the target for text and UI contrast. I applied one AAA idea where it was cheap: my body text uses a 1.5 line-height multiplier. I could not meet 7:1 for the brand green. White on \#*16A34A* is about 3.3:1. That is a good example of why AAA is chosen per criterion, where it is achievable, rather than as a blanket goal.  
\---

**7\. Discuss the importance of semantic HTML in the context of accessibility.**

Semantic HTML means using the element that matches the meaning: button for actions, a for navigation, nav and main for regions, H1 to H6 for structure, label for form fields. Browsers turn these into the accessibility tree, which is what screen readers and other assistive technology read. Semantic elements also arrive with behaviour: a button is focusable, activates on Enter and Space, and announces its role. A div with a click handler has none of that, and rebuilding it with roles, tabindex and key handlers is easy to get wrong.

It matters in specific ways. Headings let screen reader users jump between sections. Landmarks let them skip to the main content. A label tied to an input is what makes the field announce its purpose. It also reduces the need for ARIA, and the first rule of ARIA is not to use it when a native element exists.

My design system touches this directly. Title, headline and body are visual styles. They are not heading levels. An H2 can use the title-large style, so the page structure stays correct while the appearance comes from tokens.  
\---

**8\. How do you handle design handoff to developers using Figma?**

I make Figma the single source and move it into code through tokens, not by eye. Colours live as Figma variables with light and dark modes, text as 15 named styles, shadows as effect styles, all named by role. I export them as JSON and convert the JSON to CSS variables with a script, which I instruct an agent to write, specifying that the interface uses roles and never primitive colours. Developers then consume names such as Primary and Title Large, not hex values and pixel sizes.

Handoff also needs verification. My first export contained only typography and effects, with no colour group, because the Figma variables were not included. I spotted it because the file had no colour section. I now check the top-level keys of every export. After a screen is built, I search the codebase for raw colour values and compare the result with the Figma frame.

For layout, Dev Mode and component variants cover spacing and states. I also document each role's job and contrast ratio, so a developer can tell which role to use without asking.  
\---

**9\. Why do AI-generated interfaces tend to look generic, and what specifically do you hand an agent to stop it?**

Given an unconstrained request, a model produces the most statistically likely interface: a default palette, a default typeface, standard spacing and black drop shadows. That is the correct output for an unspecified request, so the sameness is not a bug. It means the constraints were missing. In our class session, three projects built from "make it look good" came out identical.

What I hand the agent is the system, in a form it can read. First, the token JSON with colour roles for both themes, 15 type styles and three shadows built from my primary colour. Second, the CSS variables generated from it. Third, an instruction that the interface uses roles only, with no hard-coded values. Fourth, a short brief covering who the user is, what device they have and what the interface should feel like. I also tell it to read everything first, summarise its understanding, wait for my approval, and ask when two files disagree.

Handing it over is not enough, so I verify. I search the codebase for raw colour values, ask the agent which style it used for a named element, and compare screens built with and without the system.  
\---

**10\. Your line height for display large is a specific number. Why that number and not one step either side of it? What would you lose with each?**

My display large is *70px* with a *105px* line height, which is a *1.5 multiplier*. I will be honest about how I got there. I first set 1.5 on every style without a reason. I then tested 1.4, 1.5 and 1.6, which are 98, 105 and 112px, on a real heading from my business. 

At 1.4 I would lose breathing room. Display large is bold Space Grotesk with tight tracking of about \-5%, so tighter lines risk ascenders and descenders crowding, and the heading starts to look dense. At 1.6 I would lose cohesion. Large text with big gaps reads as separate lines instead of one heading, and each wrapped line costs 112px of screen height on a phone, which matters for a user on a small device.

For body text, 1.5 has an external reason: WCAG 1.4.8, a AAA criterion, asks for line spacing of at least 1.5 within paragraphs. For display text I rely on my own test, not a standard.  
\---

**11\. Point at one place in your own token structure that you would build differently if you started again. Say what you would do instead and what it would cost.**

I would change how my surface tones are sourced. In my Figma roles, Surface Container Low, Surface Container and Surface Container High point at Neutral Variant 96, 94 and 92\. Surface Container Lowest and Highest point at the Neutral palette, as do Surface and Background. The two palettes have slightly different hue and chroma, so the container steps do not share one tint. High and Highest end up nearly the same tone with visibly different tints. I also have duplicates: Surface tint appears twice and Background repeats Surface.

If I started again, I would put every surface tone in one palette, Neutral, with the extra tones the surface roles need defined once: 4, 6, 12, 17, 22, 24, 87, 92, 94 and 96\. I would remove the duplicate roles before exporting anything.

The cost is real. I would need to repoint around five roles, in light and dark. I would re-export the tokens, re-run every contrast pair that involves a surface, and accept a small visible change in the tint of cards. It also makes the neutral palette 24 tones long, which is more to maintain.  
\---

**12\. Wrong-answer analysis: exporting hex values from Figma into a CSS file as a "single source of truth".**

The candidate has described a copy, not a system. Exporting hex values into a CSS file means the code holds values without the relationships behind them. Three things are missing.

First, structure. If the CSS is a flat list of hex values, or names like green-500, there is no role layer saying what a colour is for. Components use colours directly, and a brand change becomes a find-and-replace. Second, enforcement. "Every colour comes from one place" is only true if nothing else hard-codes a colour, and nothing here checks that. Third, synchronisation. The export is a one-off snapshot, so Figma and the code now live separate lives.

In month four, the brand colour changes in Figma. Someone updates the CSS, but a developer who needed a one-off button earlier typed *\#16A34A* directly, and that button stays on the old colour. Dark mode needed a second hand-copied set, which now disagrees. My regression test showed this: a role pointing at a raw hex did not follow when I changed the palette. The fix is references, a script that regenerates the CSS from the tokens on every change, and a search that fails when raw values appear.  
