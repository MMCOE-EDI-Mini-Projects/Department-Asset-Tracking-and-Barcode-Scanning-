# Department Asset Tracking — Frontend Design System

This document is extracted from the reference login/dashboard implementation. All teams must follow these tokens and component patterns when building any module, so the entire application looks and feels like one product.

---

## 1. Typography

**Font family (global, applies to every element):**
```css
font-family: Arial, sans-serif;
```

**Type scale**

| Use case | Size | Weight | Notes |
|---|---|---|---|
| Logo / brand mark | 45px | normal | left panel logo icon only |
| Page / Panel heading (h1, h2) | 30px | normal (browser default bold for h-tags) | e.g. "Welcome Back", "Department Asset Tracking", dashboard "Welcome, {name}!" |
| Card icon | 30px | normal | emoji/icon glyphs on dashboard cards |
| Navbar title | 20px | bold | top navbar brand text |
| Button text | 16px | bold | all buttons |
| Body / paragraph text | 15px | normal | descriptive paragraph copy |
| Feature list item | 15px | normal | left-panel feature rows |
| Input text | 15px | normal | form field values |
| Form label | 14px | bold | above every input |
| Card heading (h3) | default (~16-18px) | bold | dashboard card titles |
| Card body text | 14px | normal | dashboard card descriptions, `color: #64748b` |
| Message banner | 14px | normal | success/error alerts |
| Role badge / pill | 12px | normal | small pill labels |
| Demo/helper info text | 12px | normal | fine print, `color: #64748b` |

**Line height:** `1.5`–`1.6` for paragraph/body copy blocks.

---

## 2. Color Palette

### Brand / Primary
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#2563eb` | Primary buttons, links, focus states, active pill/badge backgrounds |
| `--color-primary-hover` | `#1d4ed8` | Button hover state |
| `--color-primary-dark` | `#0f172a` | Navbar background, dark gradient start, primary body text alternative |
| `--color-primary-gradient-end` | `#1e3a5f` / `#2563eb` | Used in left-panel and page-background gradients |

### Neutrals / Text
| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#1e293b` | Base body text color |
| `--color-text-secondary` | `#64748b` | Subtitles, helper text, card descriptions, muted copy |
| `--color-border` | `#cbd5e1` | Input borders |
| `--color-bg-page` | `#f1f5f9` | Dashboard page background |
| `--color-bg-soft` | `#f8fafc` | Demo-info / soft info panel background |
| `--color-white` | `#ffffff` | Card and container backgrounds |

### Status Colors
| Token | Background | Text | Border | Usage |
|---|---|---|---|---|
| Success | `#dcfce7` | `#166534` | `#bbf7d0` | Success messages/toasts |
| Error | `#fee2e2` | `#991b1b` | `#fecaca` | Error/validation messages |
| Info / Accent chip | `#eff6ff` | `#1d4ed8` | none | Permission tags, access-list chips |

### Destructive / Danger
| Token | Hex | Usage |
|---|---|---|
| `--color-danger` | `#dc2626` | Logout button, delete/destructive actions |

### Overlays / Shadows
| Token | Value | Usage |
|---|---|---|
| Container shadow | `0 20px 50px rgba(0,0,0,0.25)` | Large elevated surfaces (auth container/modals) |
| Card shadow | `0 3px 10px rgba(0,0,0,0.05)` | Standard dashboard cards |
| Focus ring | `0 0 0 3px rgba(37,99,235,0.1)` | Input focus glow, paired with `border-color: #2563eb` |

---

## 3. Spacing & Radius

| Token | Value | Usage |
|---|---|---|
| Radius — large surface | `20px` | Auth container, main card wrappers |
| Radius — cards/sections | `12px` | Dashboard cards, access-section panel |
| Radius — inputs/buttons | `8px` | All inputs and buttons |
| Radius — small chip | `7px` | Message banners, access-item chips |
| Radius — pill | `20px` | Role badges |
| Standard field spacing | `20px` bottom margin | Between form groups |
| Panel padding | `55px 45px` / `55px 50px` | Left/right auth panels |
| Dashboard content padding | `40px` | Main dashboard content area |
| Card padding | `25px` | Dashboard cards |
| Button/input padding | `14px` | Vertical rhythm for all inputs & buttons |

---

## 4. Buttons

**Primary Button**
```css
background: #2563eb;
color: white;
font-size: 16px;
font-weight: bold;
padding: 14px;
border: none;
border-radius: 8px;
cursor: pointer;
```
Hover: `background: #1d4ed8;`
Use for: primary form submits (Login, Save, Create, Confirm).

**Danger / Destructive Button**
```css
background: #dc2626;
color: white;
padding: 9px 18px;
border-radius: 8px;
font-size: 13px;
width: auto; /* not full width */
```
Use for: Logout, Delete, Reject, Disposal actions.

**Secondary Button (recommended pattern to standardize — not explicit in source, derive from tokens)**
```css
background: transparent;
color: #2563eb;
border: 1px solid #2563eb;
border-radius: 8px;
padding: 14px;
font-weight: bold;
```
Use for: Cancel, secondary/lower-emphasis actions. Hover: `background: #eff6ff;`

**Button rules for all teams**
- Buttons are full-width (`width: 100%`) inside forms unless explicitly inline (like navbar Logout).
- Always `border-radius: 8px`, bold text, `14px` vertical padding for full-size buttons.
- Never use colors outside the palette above for buttons.

---

## 5. Form Elements

**Text input**
```css
width: 100%;
padding: 14px;
border: 1px solid #cbd5e1;
border-radius: 8px;
font-size: 15px;
outline: none;
```
Focus:
```css
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
```

**Label**
```css
display: block;
font-size: 14px;
font-weight: bold;
margin-bottom: 8px;
```

**Password field:** icon (👁 / 🙈 toggle) absolutely positioned at `right: 14px`, vertically centered, `color: #64748b`.

**Links (e.g. "Forgot Password?")**
```css
color: #2563eb;
text-decoration: none;
font-size: 13px;
```

---

## 6. Feedback / Messages

Status banners (success/error) share one base style, differentiated only by the status color table in Section 2:
```css
padding: 12px;
border-radius: 7px;
margin-bottom: 18px;
font-size: 14px;
border: 1px solid <status-border-color>;
background: <status-bg-color>;
color: <status-text-color>;
```

---

## 7. Structural Components

**Elevated container (auth screens, modals)**
- White background, `border-radius: 20px`, `box-shadow: 0 20px 50px rgba(0,0,0,0.25)`, `overflow: hidden`.

**Navbar**
- Height `70px`, background `#0f172a`, white text, `padding: 0 40px`, flex space-between.
- Title: `20px` bold. Right side: user name + role badge (pill, `#2563eb` bg, `12px` text, `20px` radius) + destructive logout button.

**Dashboard cards**
- White background, `12px` radius, `25px` padding, shadow `0 3px 10px rgba(0,0,0,0.05)`.
- Icon (`30px`) → Heading (bold) → Description (`14px`, `#64748b`).
- Laid out in a responsive grid: `repeat(3, 1fr)` desktop → `1fr` under `800px`.

**Chips / tags (permissions, access lists)**
```css
background: #eff6ff;
color: #1d4ed8;
padding: 10px 15px;
border-radius: 7px;
font-size: 14px;
```

**Page background (auth/marketing panels)**
```css
background: linear-gradient(135deg, #0f172a, #1e3a5f);
```

**Left brand panel gradient**
```css
background: linear-gradient(160deg, #0f172a, #2563eb);
```

---

## 8. Responsive Rules

Breakpoint: `800px`
- Auth container becomes `95%` width.
- Left brand panel is hidden (`display: none`).
- Right panel becomes full width.
- Card grid collapses from 3 columns to 1 column.

All modules should reuse this single breakpoint rather than introducing new ones, unless a module has a documented reason to diverge.

---

## 9. Iconography

The reference UI uses plain Unicode glyphs, not an icon library (`▣ ▥ ♻ ↻ ◉ ✓ 👁 🙈`). Until an icon library is adopted app-wide, teams should continue using simple Unicode/emoji glyphs at the sizes specified in Section 1 rather than mixing in a different icon set, to keep visual weight consistent.

---

## 10. Quick Reference — CSS Custom Properties

Teams should define these once (e.g. in a shared `variables.css` or root stylesheet) and reference them everywhere instead of hardcoding hex values:

```css
:root {
  /* Brand */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-dark: #0f172a;
  --color-primary-gradient-end: #1e3a5f;

  /* Text & neutrals */
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #cbd5e1;
  --color-bg-page: #f1f5f9;
  --color-bg-soft: #f8fafc;
  --color-white: #ffffff;

  /* Status */
  --color-success-bg: #dcfce7;
  --color-success-text: #166534;
  --color-success-border: #bbf7d0;
  --color-error-bg: #fee2e2;
  --color-error-text: #991b1b;
  --color-error-border: #fecaca;
  --color-info-bg: #eff6ff;
  --color-info-text: #1d4ed8;

  /* Danger */
  --color-danger: #dc2626;

  /* Radius */
  --radius-lg: 20px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --radius-xs: 7px;
  --radius-pill: 20px;

  /* Shadows */
  --shadow-container: 0 20px 50px rgba(0,0,0,0.25);
  --shadow-card: 0 3px 10px rgba(0,0,0,0.05);
  --shadow-focus: 0 0 0 3px rgba(37,99,235,0.1);

  /* Font */
  --font-family: Arial, sans-serif;
}
```

---

## 11. Ground Rules for All Teams

1. Do not introduce new fonts — Arial/sans-serif only.
2. Do not introduce new blues, grays, or status colors — use the palette in Section 2.
3. All interactive elements (buttons, inputs, links) must use the radii and padding values above — no ad hoc sizing per module.
4. Primary actions = `--color-primary`. Destructive actions = `--color-danger`. Never swap these.
5. Any new component (tables, modals, dropdowns, pagination, etc.) should derive its colors, radius, and shadow values from the tokens in Section 10 rather than picking new ones — raise it with the team first if the existing tokens don't fit.
