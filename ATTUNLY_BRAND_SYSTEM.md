# Attunly UI Brand System

Use this document as a reference when creating any UI, marketing page, component, or visual asset for Attunly. Follow these guidelines exactly to maintain brand consistency.

---

## Design Philosophy

**Core principles:**
- **Calm over clever** — No visual tricks. No attention-grabbing animations. The design should feel like a quiet room.
- **Editorial, not SaaS** — Think magazine article, not dashboard. Text-first. Generous whitespace. Let the copy breathe.
- **Confident restraint** — Say less. Show less. Every element earns its place.
- **Human, not corporate** — Warm neutrals. Serif typography. Feels like a thoughtful person wrote it.

**Design mantra:** "Would this feel calm to read at 11pm?"

---

## Logo

- **Mark:** Mesh wave pattern (see `/public/logo.svg`)
- **Wordmark:** "attunly" in Source Serif 4, 600 weight
- **Usage:** Logo mark + wordmark side by side
- **Size:** Logo mark 24-28px, wordmark 20px (`text-xl`)
- **Color:** Espresso on light backgrounds, Paper (inverted) on dark backgrounds

---

## Typography

### Font Family
```css
font-family: 'Source Serif 4', 'Source Serif Pro', Georgia, 'Times New Roman', serif;
```

**Why serif:** Conveys thoughtfulness, editorial quality, and human warmth. Differentiates from typical SaaS (which defaults to geometric sans-serif).

**Fallback stack:** Georgia → Times New Roman → system serif

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Hero) | 48–60px (`text-4xl` to `text-6xl`) | 600 (semibold) | 1.1 | -0.02em (tight) |
| H2 (Section) | 30–36px (`text-3xl` to `text-4xl`) | 600 (semibold) | 1.2 (tight) | normal |
| H3 (Card title) | 18px (`text-lg`) | 500 (medium) | 1.4 | normal |
| Body | 18px (`text-lg`) | 400 (regular) | 1.6–1.7 (relaxed) | normal |
| Body large | 20–24px (`text-xl` to `text-2xl`) | 400 (regular) | 1.6 (relaxed) | normal |
| Small/Caption | 14px (`text-sm`) | 400 or 500 | 1.5 | normal |
| Label (uppercase) | 14px (`text-sm`) | 400 | 1.5 | 0.05em (wide) |

### Type Rules
- **Max line length:** 60 characters (`max-width: 60ch`). Never wider.
- **Paragraph spacing:** 20–24px between paragraphs (`space-y-5` or `space-y-6`)
- **No bold in body copy** unless absolutely necessary
- **Code inline:** Use monospace with subtle background
  ```css
  font-family: 'SF Mono', 'Fira Code', Monaco, monospace;
  background: coffee-cream;
  padding: 2px 8px;
  border-radius: 4px;
  ```

---

## Color Palette — Coffee

Warm, grounded, approachable. Like a quiet coffee shop.

| Name | Tailwind | Hex | Usage |
|------|----------|-----|-------|
| Espresso | `coffee-espresso` | `#1a1614` | Primary text, buttons, headings |
| Dark Roast | `coffee-roast` | `#2c2420` | Hover states |
| Mocha | `coffee-mocha` | `#4a3f38` | Secondary text, code text |
| Cortado | `coffee-cortado` | `#6b5d54` | Body text |
| Latte | `coffee-latte` | `#8c7b70` | Muted text, labels, captions |
| Oat Milk | `coffee-oat` | `#b5a89d` | De-emphasized text (headline accents) |
| Steamed | `coffee-steamed` | `#d4cbc4` | Dividers |
| Foam | `coffee-foam` | `#e8e2dc` | Borders, card borders |
| Cream | `coffee-cream` | `#f6f3f0` | Alt section backgrounds, code bg |
| Paper | `coffee-paper` | `#fffcf9` | Primary background, cards |

### Usage Rules
- **Backgrounds alternate:** Paper → Cream → Paper → Cream
- **Text hierarchy:** Espresso (headings) → Cortado (body) → Latte (muted)
- **No other colors.** No blue links. No green success. No red errors. Everything is coffee.
- **De-emphasized text:** Use `coffee-oat` for secondary parts of headlines (e.g., "without overthinking.")

### Dark Mode (Footer only)
| Element | Color |
|---------|-------|
| Background | `coffee-espresso` |
| Primary text | `coffee-paper` |
| Secondary text | `coffee-latte` |
| Hover text | `coffee-paper` |

---

## Spacing System

### Section Padding
```css
/* Horizontal */
padding-left/right: 24px (mobile) → 48px (tablet) → 96px (desktop)
/* Tailwind: px-6 md:px-12 lg:px-24 */

/* Vertical */
padding-top/bottom: 96px → 128px on larger screens
/* Tailwind: py-24 md:py-32 */
```

### Content Width
- **Max content width:** 672px (`max-w-2xl`)
- **Max text width:** 60 characters (`max-w-[60ch]`)
- **Always center content:** `mx-auto`

### Vertical Rhythm
| Context | Spacing |
|---------|---------|
| Between sections | 96–128px (handled by section padding) |
| Section label to heading | 16px (`mb-4`) |
| Heading to body | 32–40px (`mb-8` to `mb-10`) |
| Between paragraphs | 20–24px (`space-y-5` or `space-y-6`) |
| Between list items | 40px (`space-y-10`) |
| Divider margin | 40px top, 32px bottom (`mt-10 pt-8`) |

---

## Components

### Buttons

**Primary Button**
```css
/* Base */
display: inline-flex;
align-items: center;
justify-content: center;
padding: 14px 24px;
border-radius: 8px;
font-size: 16px;
font-weight: 500;
background: coffee-espresso;
color: coffee-paper;
transition: all 200ms ease-out;

/* Hover */
background: coffee-roast;

/* Tailwind */
inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-medium bg-coffee-espresso text-coffee-paper hover:bg-coffee-roast transition-all duration-200
```

**Secondary Button (Text link style)**
```css
/* Base */
color: coffee-cortado;
font-weight: 500;

/* Hover */
color: coffee-espresso;

/* Tailwind */
inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-medium text-coffee-cortado hover:text-coffee-espresso transition-all duration-200
```

**Button Rules:**
- No shadows on hover
- No borders on secondary buttons
- Always include Slack icon on "Add to Slack" buttons
- Arrow (→) on text-link style buttons

### Cards

```css
/* Container */
padding: 24px;
background: coffee-paper;
border: 1px solid coffee-foam;
border-radius: 8px;

/* Tailwind */
p-6 bg-coffee-paper rounded-lg border border-coffee-foam
```

**Card content:**
- Title: `text-lg font-medium text-coffee-espresso mb-2`
- Description: `text-coffee-cortado`

### Section Labels

```css
/* Uppercase label above headings */
font-size: 14px;
color: coffee-latte;
text-transform: uppercase;
letter-spacing: 0.05em;
margin-bottom: 16px;

/* Tailwind */
text-coffee-latte text-sm tracking-wide uppercase mb-4
```

### Dividers

```css
/* Horizontal rule style */
border-top: 1px solid coffee-steamed;
margin-top: 40px;
padding-top: 32px;

/* Tailwind */
mt-10 pt-8 border-t border-coffee-steamed
```

### Step Indicators

```css
/* Number circle */
width: 40px;
height: 40px;
border-radius: 50%;
background: coffee-espresso;
color: coffee-paper;
font-size: 18px;
font-weight: 600;
display: flex;
align-items: center;
justify-content: center;

/* Tailwind */
flex-shrink-0 w-10 h-10 rounded-full bg-coffee-espresso text-coffee-paper flex items-center justify-center text-lg font-semibold
```

---

## Layout

### Page Structure
```
[Fixed Nav]
[Hero Section]        — paper background
[Problem Section]     — cream background
[Solution Section]    — paper background
[How It Works]        — cream background
[Differentiation]     — paper background
[Trust Section]       — cream background
[Final CTA]           — paper background
[Footer]              — espresso background
```

### Navigation
```css
/* Fixed top nav */
position: fixed;
top: 0;
left: 0;
right: 0;
z-index: 50;
padding: 16px (vertical);
background: rgba(255, 252, 249, 0.95);  /* paper at 95% opacity */
backdrop-filter: blur(8px);
border-bottom: 1px solid coffee-foam;

/* Tailwind */
fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-24 py-4 bg-[#fffcf9]/95 backdrop-blur-sm border-b border-coffee-foam
```

**Nav content:**
- Logo left: Mesh icon + "attunly" (`text-xl font-semibold text-coffee-espresso`)
- CTA right: Primary button (smaller: `text-sm py-2.5 px-5`)

### Hero Sizing
```css
min-height: 70vh;
/* NOT 85vh or 100vh — too much empty space */
```

---

## Motion & Animation

### Scroll Fade-In
```css
/* Initial state */
opacity: 0;
transform: translateY(24px);
transition: opacity 0.6s ease-out, transform 0.6s ease-out;

/* Visible state */
opacity: 1;
transform: translateY(0);
```

**Trigger:** IntersectionObserver at 10% threshold

### Hover Transitions
```css
transition: all 200ms ease-out;
```

### What NOT to animate:
- No parallax
- No scroll-triggered color changes
- No loading animations
- No micro-interactions on text
- No bouncing or elastic easing

---

## Voice & Tone (Copy Guidelines)

### Principles
- **Direct, not clever** — Say what it does. No metaphors.
- **Outcome-focused** — Talk about work unblocking, not feelings.
- **Short sentences** — Break up long thoughts. One idea per sentence.
- **No jargon** — No "leverage," "empower," "seamless," "intelligent."

### Words to USE
- Ask, send, draft, message, help, work, team, Slack, command, simple, calm, easy

### Words to AVOID
- Anxiety, confident, stress, worry (therapy-coded)
- Smart, intelligent, AI-powered, advanced (tech-coded)
- Seamless, frictionless, effortless (marketing fluff)
- Transform, revolutionize, game-changing (hyperbole)

### Headline Pattern
```
[Action] + [context]
[de-emphasized outcome or contrast]

Example:
"Ask for help in Slack"
"without overthinking."
```

### CTA Patterns
- Primary: "Add to Slack"
- Secondary: "See how it works →"
- Never: "Get started," "Try free," "Sign up"

---

## Assets

### Logo Files
- `/public/logo.svg` — Mesh mark (espresso color)
- `/public/logo-bg.svg` — Mesh mark with paper background

### Slack Icon (SVG)
```html
<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
</svg>
```

---

## Anti-Patterns (What NOT to Do)

### Design
- No gradients
- No heavy shadows
- No glassmorphism
- No illustrations or mascots
- No screenshots or product UI
- No feature grids or comparison tables
- No testimonial carousels
- No background patterns or textures
- No colored accents (blue links, green buttons)
- No icons except Slack logo and mesh mark

### Typography
- No sans-serif fonts
- No all-caps headings (only for small labels)
- No bold body text
- No text wider than 60 characters
- No centered body paragraphs (only center CTAs)

### Layout
- No multi-column layouts (except nav)
- No sidebars
- No sticky elements (except nav)
- No horizontal scrolling
- No modals or popups

### Copy
- No questions as headlines ("Ready to transform your workflow?")
- No exclamation points
- No emojis
- No "We" language ("We believe...", "We built...")
- No long paragraphs (max 3 sentences)

---

## Quick Reference

```
Font:           Source Serif 4
Colors:         Coffee palette (espresso→paper)
Logo:           Mesh mark + "attunly"
Max width:      672px content, 60ch text
Spacing:        24/48/96px horizontal, 96/128px vertical
Buttons:        Espresso bg, no shadow, 8px radius
Sections:       Alternate paper/cream
Animation:      Fade-in on scroll only (0.6s ease-out)
Voice:          Direct, outcome-focused, no jargon
```

---

*Last updated: January 2026*
