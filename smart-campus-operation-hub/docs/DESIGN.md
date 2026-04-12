# Design System Strategy: The Architectural Narrative

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Precise Curator."** 

Moving beyond the generic "dashboard" aesthetic, this system treats digital space as high-end architecture. We reject the "boxed-in" feeling of traditional SaaS layouts. Instead of rigid borders and heavy dividers, we utilize **Tonal Architecture**—defining space through subtle shifts in luminance and atmospheric depth. The goal is a layout that feels "carved" out of a single, cohesive environment rather than "assembled" from disparate widgets. We prioritize intentional asymmetry in the header and sidebar to break the monotonous grid, creating a sophisticated, editorial rhythm.

---

## 2. Color & Atmospheric Theory
We utilize a sophisticated palette where "Depth" replaces "Lines."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using `1px solid` borders to define sections. Layout boundaries must be established via background color shifts. 
- Use `surface-container-low` for the main content canvas.
- Use `surface-container-lowest` (White) for elevated cards.
- This creates a "soft-edge" UI that feels high-end and custom.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, fine-paper layers:
- **Level 0 (Base):** `surface` (#f7f9fb) — The foundation.
- **Level 1 (Sectioning):** `surface-container-low` (#f2f4f6) — Use for content areas.
- **Level 2 (Interaction):** `surface-container-highest` (#e0e3e5) — Use for active states or hover regions.
- **The Sidebar:** Utilize `primary` (#2a14b4) as the deep indigo anchor. It should feel like a solid monolithic element that grounds the lighter content area.

### The "Glass & Gradient" Rule
To prevent the UI from feeling "flat," main CTAs and floating navigation elements should utilize a subtle gradient: `from-primary` to `to-primary-container`. For modal overlays or floating headers, use `backdrop-blur-md` with a 70% opacity `surface-container-lowest` to create a "frosted glass" effect that maintains environmental context.

---

## 3. Typography: Editorial Precision
We use **Inter** not just for legibility, but as a brand signifier of precision.

- **Display & Headlines:** Use `headline-lg` (2rem) with a `tracking-tight` (-0.02em) for a bold, authoritative "magazine" feel. Headlines should never be pure black; use `on-surface-variant` (#464554) to soften the contrast.
- **The Title Scale:** `title-lg` and `title-md` act as the primary wayfinding. They should be semi-bold (600) to stand out against the soft background shifts.
- **Labels:** `label-md` (0.75rem) should be used for secondary metadata in all-caps with `tracking-widest` (0.1em) to provide a sophisticated, technical aesthetic for facilities and maintenance logs.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too heavy for "The Precise Curator." We use **Ambient Atmosphere.**

- **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` background. The `0.125rem` difference in luminance is sufficient to "lift" the object without a shadow.
- **Ambient Shadows:** For floating elements (like the Profile dropdown), use a custom shadow: `0 20px 25px -5px rgba(25, 28, 30, 0.04)`. The shadow color is a 4% tint of the `on-surface` token, ensuring it feels like a natural light obstruction rather than a "glow."
- **Ghost Borders:** If an edge must be defined (e.g., in high-density data tables), use `outline-variant` at `20%` opacity. **Never use 100% opacity borders.**

---

## 5. Component Guidelines

### Sidebar & Navigation
- **The Indigo Monolith:** The sidebar uses `primary` (#2a14b4). Navigation items use `on-primary` at 70% opacity for inactive states, and 100% with a `primary-container` (#4338ca) background "pill" for active states.
- **Icons:** Use Lucide icons at `20px`. The weight should be `stroke-width={1.5}` to maintain the "Crisp" design intent.

### Buttons & Interaction
- **Primary:** Gradient `from-primary` to `primary-container`. `rounded-md` (0.375rem). No shadow.
- **Secondary:** `surface-container-high` background with `on-surface` text. This blends into the layout until hovered.
- **Tertiary:** Purely typographic with an `underline-offset-4`.

### Cards & Data Lists
- **The Forbid Rule:** No horizontal divider lines (`<hr>` or `border-b`). 
- **The Solution:** Use `py-4` (1rem) spacing between list items and a subtle `hover:bg-surface-container-low` transition to define rows.
- **Nesting:** Data within cards should use `label-sm` for captions to create a clear "Info Hierarchy" that doesn't compete with the main title.

### Input Fields
- Avoid the "boxed" input. Use a `surface-container-highest` background with a bottom-only `primary` focus state (2px). This creates a cleaner, more modern look for "Bookings" and "Maintenance" forms.

---

## 6. Do's and Don'ts

### Do
- **Use "White Space" as a Separator:** Leverage the `spacing-8` (2rem) and `spacing-12` (3rem) tokens to create distinct zones of focus.
- **Embrace Asymmetry:** Place your header actions (Notification/Profile) in a floating "Glass" container that doesn't span the full width of the screen.
- **Responsive Fluidity:** On mobile, the Sidebar must transition to a bottom-nav or a full-screen `surface` overlay, never a "hamburger" that feels like an afterthought.

### Don't
- **Don't use `border-slate-200`:** It breaks the "No-Line" rule and makes the app look like a generic template.
- **Don't use pure black (#000):** It is too aggressive for this palette. Always use `on-surface` (#191c1e).
- **Don't crowd the sidebar:** Navigation items should have at least `py-3` (0.75rem) of breathing room to ensure the deep indigo background feels "expensive."
- **Don't use standard shadows:** High-contrast shadows look "cheap." Always prefer tonal shifts over shadows.