# LuminaForge — Design Specification

## 1. Design Philosophy

**Core principle: The 3D preview is the hero. Everything else serves it.**

The UI should feel like a focused instrument — not a bloated CAD app. Think "music production DAW meets 3D printing" — dark, immersive, with the 3D viewport dominating the screen and controls docked to the side. The design should evoke the feeling of crafting something physical: warm, tactile, precise.

### Design Pillars
1. **Immersive** — dark theme, full-bleed 3D viewport, minimal chrome
2. **Tactile** — sliders feel physical, changes feel instant, feedback is visual
3. **Confident** — strong typography, clear hierarchy, no visual clutter
4. **Warm** — not cold/techy; amber/copper accents evoke the warmth of light and ceramics

---

## 2. Brand Identity

### Color Palette

```
/* Core */
--bg-primary:        #0D0D0F;     /* Near-black background */
--bg-secondary:      #161619;     /* Panel backgrounds */
--bg-tertiary:       #1E1E22;     /* Card/input backgrounds */
--bg-elevated:       #252529;     /* Hover states, elevated surfaces */

/* Accent — Warm amber/copper */
--accent-primary:    #E08A3C;     /* Primary actions, active states */
--accent-secondary:  #C4722E;     /* Hover on primary */
--accent-subtle:     #E08A3C1A;   /* 10% opacity accent for backgrounds */
--accent-glow:       #E08A3C33;   /* Glow effects */

/* Text */
--text-primary:      #F0EDE8;     /* Primary text — warm white */
--text-secondary:    #9B978F;     /* Secondary/label text */
--text-tertiary:     #5C5952;     /* Disabled/hint text */

/* Semantic */
--success:           #6BBF6A;     /* Valid/printable indicators */
--warning:           #E0C33C;     /* Print warnings */
--error:             #D94B4B;     /* Validation errors */

/* Viewport */
--grid-color:        #1A1A1E;     /* 3D viewport grid */
--model-base:        #D4C4A8;     /* Default model material color */
--model-highlight:   #E08A3C;     /* Selected/active geometry */
```

### Typography

```
/* Display / Headers */
Font: "Instrument Serif" (Google Fonts) — elegant, distinctive
Weights: 400 (regular)
Usage: Logo, page headers, preset names

/* UI / Body */
Font: "DM Sans" (Google Fonts) — clean geometric sans
Weights: 400, 500, 600
Usage: Labels, parameters, body text, buttons

/* Monospace / Values */
Font: "JetBrains Mono" (Google Fonts)
Weights: 400
Usage: Numeric parameter values, dimensions, export info
```

### Scale & Spacing

```
/* Type Scale */
--text-xs:    0.75rem;    /* 12px — fine print */
--text-sm:    0.8125rem;  /* 13px — labels */
--text-base:  0.875rem;   /* 14px — body */
--text-lg:    1rem;        /* 16px — section headers */
--text-xl:    1.25rem;     /* 20px — page headers */
--text-2xl:   1.75rem;     /* 28px — display */
--text-3xl:   2.5rem;      /* 40px — hero */

/* Spacing */
--space-1:    4px;
--space-2:    8px;
--space-3:    12px;
--space-4:    16px;
--space-5:    20px;
--space-6:    24px;
--space-8:    32px;
--space-10:   40px;
--space-12:   48px;
--space-16:   64px;
```

### Border Radius & Effects

```
--radius-sm:     6px;      /* Inputs, small buttons */
--radius-md:     8px;      /* Cards, panels */
--radius-lg:     12px;     /* Modals, large cards */
--radius-full:   9999px;   /* Pills, toggles */

/* Borders */
--border-subtle:    1px solid #ffffff08;
--border-default:   1px solid #ffffff12;
--border-accent:    1px solid var(--accent-primary);

/* Shadows */
--shadow-sm:     0 1px 2px rgba(0,0,0,0.3);
--shadow-md:     0 4px 12px rgba(0,0,0,0.4);
--shadow-lg:     0 8px 24px rgba(0,0,0,0.5);
--shadow-glow:   0 0 20px var(--accent-glow);
```

---

## 3. Layout Architecture

### Editor Page (Primary Interface)

```
┌──────────────────────────────────────────────────────────┐
│  Logo    [Vase] [Lamp]    Preset ▼    [Share] [Export ▼] │  ← Top bar (48px)
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Parameter │          3D Viewport                        │
│  Panel     │          (Three.js Canvas)                  │
│            │                                             │
│  280px     │          - Orbit controls                   │
│  fixed     │          - Grid floor                       │
│  width     │          - Ambient + directional light      │
│            │          - Model centered                   │
│            │                                             │
│  Scrollable│                                             │
│  sections: │     ┌─────────────────────────────┐         │
│            │     │  View controls (bottom-left) │         │
│  ▸ Profile │     │  [Solid][Wire][X-ray] [Grid] │        │
│  ▸ Twist   │     └─────────────────────────────┘         │
│  ▸ Shape   │                                             │
│  ▸ Pattern │     ┌──────────────────────────────┐        │
│  ▸ Print   │     │  Dimensions overlay (top-right)│       │
│            │     │  H: 150mm  Ø: 80mm  Wall: 1.6mm│      │
│            │     └──────────────────────────────┘        │
├────────────┴─────────────────────────────────────────────┤
│  [Print warnings bar — appears contextually]             │  ← Status bar
└──────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌──────────────────────┐
│  Logo   [≡] Menu     │  ← Compact top bar
├──────────────────────┤
│                      │
│    3D Viewport       │  ← 60% of viewport height
│    (touch orbit)     │
│                      │
├──────────────────────┤
│  [Profile][Twist]... │  ← Tab bar for param sections
├──────────────────────┤
│                      │
│  Active Parameter    │  ← Bottom sheet (draggable)
│  Section             │
│                      │
├──────────────────────┤
│  [Export STL]        │  ← Sticky bottom CTA
└──────────────────────┘
```

### Landing Page

```
┌───────────────────────────────────────────────┐
│  Nav: Logo  |  Presets  |  About  |  [Editor] │
├───────────────────────────────────────────────┤
│                                               │
│  Hero: Animated 3D vase rotating slowly       │
│  "Design. Twist. Print."                      │
│  [Start Creating →]                           │
│                                               │
├───────────────────────────────────────────────┤
│  Preset Gallery Grid (3-4 columns)            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│  │     │ │     │ │     │ │     │             │
│  │ 3D  │ │ 3D  │ │ 3D  │ │ 3D  │             │
│  │thumb│ │thumb│ │thumb│ │thumb│             │
│  │     │ │     │ │     │ │     │             │
│  ├─────┤ ├─────┤ ├─────┤ ├─────┤             │
│  │name │ │name │ │name │ │name │             │
│  └─────┘ └─────┘ └─────┘ └─────┘             │
├───────────────────────────────────────────────┤
│  How it works (3-step illustration)           │
├───────────────────────────────────────────────┤
│  About / Footer                               │
└───────────────────────────────────────────────┘
```

---

## 4. Component Design

### Parameter Slider

The most-used component. Must feel precise and responsive.

```
┌─────────────────────────────────────┐
│  Twist Angle                  180°  │  ← Label + monospace value
│  ═══════════●───────────────────    │  ← Track with thumb
│  0°                          720°   │  ← Min/max labels (text-tertiary)
└─────────────────────────────────────┘

States:
- Default: Track in bg-tertiary, filled portion in accent-primary
- Hover: Thumb grows slightly, glow effect
- Dragging: Value updates in real-time, accent-glow on thumb
- Disabled: All elements in text-tertiary

Behavior:
- Click anywhere on track to jump
- Drag thumb for continuous control
- Scroll wheel on hover for fine adjustment (±1 unit)
- Double-click value label to type exact number
- Shift+drag for 10x precision (0.1° increments)
```

### Dropdown / Select

```
┌─────────────────────────────────────┐
│  Cross Section            ┌──────┐  │
│                           │Circle▾│  │
│                           └──────┘  │
└─────────────────────────────────────┘

Dropdown open:
┌──────────────┐
│ ● Circle     │  ← Active item has accent dot
│   Polygon    │
│   Star       │
│   Superellipse│
│   Organic    │
└──────────────┘

Each option can have a small icon/preview showing the shape.
```

### Toggle Group

For binary/ternary choices like view mode:

```
┌──────────────────────────────┐
│  ┌──────┬──────┬──────┐      │
│  │Solid │ Wire │X-ray │      │  ← Segmented control
│  │ ███  │      │      │      │  ← Active has accent bg
│  └──────┴──────┴──────┘      │
└──────────────────────────────┘
```

### Collapsible Parameter Section

```
▾ Twist & Spiral                        ← Section header (clickable)
──────────────────────────────────
  Twist Angle                    180°
  ═══════════●──────────────────
  
  Rib Count                         6
  ═══●──────────────────────────
  
  Rib Depth                      3mm
  ════●─────────────────────────
  
  Direction          [CW] [CCW]
  
  Easing      [Lin][EIn][EOut][EIO]

▸ Surface Pattern                       ← Collapsed section
▸ Print Settings                        ← Collapsed section
```

### Export Button

Primary CTA — should feel substantial and rewarding:

```
┌──────────────────────────────────┐
│  ┌─────────────────────────────┐ │
│  │  ↓  Download STL            │ │  ← Primary accent button
│  └─────────────────────────────┘ │
│           or  [3MF] [OBJ]       │  ← Secondary format links
└──────────────────────────────────┘

On click: Brief generating animation (spinning icon), then browser download.
```

### Preset Card

```
┌─────────────────────┐
│                     │
│    3D Thumbnail     │  ← Auto-rotating preview or static render
│    (dark bg)        │
│                     │
├─────────────────────┤
│  Twisted Hex Vase   │  ← Instrument Serif, text-primary
│  Spiral • Hexagon   │  ← DM Sans, text-secondary, tags
└─────────────────────┘

Hover: Subtle scale(1.02), border-accent glow
Click: Loads preset into editor
```

### Print Warning Bar

Appears contextually at the bottom of the viewport:

```
┌──────────────────────────────────────────────────────────┐
│  ⚠ Wall thickness (0.6mm) is below minimum for FDM      │
│  printing. Recommended: ≥0.8mm            [Fix] [Ignore] │
└──────────────────────────────────────────────────────────┘

Color: warning background, with clear action buttons.
```

---

## 5. 3D Viewport Design

### Environment
- **Background**: Subtle gradient from `#0D0D0F` to `#141418` (radial, from center)
- **Grid**: Faint grid lines on ground plane, fading to transparent at edges
- **Lighting**: 3-point setup — key light (warm white, upper-right), fill (cool, left), rim (subtle, back)
- **Material**: Matte ceramic look (MeshStandardMaterial, roughness: 0.7, metalness: 0.05)
- **Model color**: `--model-base` (#D4C4A8) — warm clay/ceramic tone
- **Shadow**: Soft contact shadow on ground plane

### Camera Controls
- **Orbit**: Left-click drag (touch: one-finger drag)
- **Zoom**: Scroll wheel (touch: pinch)
- **Pan**: Right-click drag (touch: two-finger drag)
- **Reset**: Double-click viewport or [Reset View] button
- **Default angle**: Slight high-angle (30° elevation), 45° azimuth

### View Modes
| Mode | Description |
|------|-------------|
| Solid | Default — full material render |
| Wireframe | Edge-only view to inspect topology |
| X-ray | Translucent with visible internal structure |
| Print Preview | Dimensions overlay, layer lines simulation |

### Dimension Overlay
Floating in viewport top-right corner:
```
H: 150.0 mm
Ø: 80.0 mm
Wall: 1.6 mm
Est. ~45g PLA
```
Monospace font, semi-transparent dark background pill.

---

## 6. Animation & Micro-interactions

### Page Load
- Staggered fade-in: Logo → nav items → hero text → 3D viewport → preset cards
- Hero 3D model fades in with subtle scale(0.95 → 1.0)
- Duration: 600ms total, 80ms stagger between elements

### Parameter Change
- 3D model updates in real-time during slider drag (debounced 150ms)
- Smooth geometry transition via morph targets or fast regeneration
- Subtle pulse on dimension overlay when values change

### Export
- Button text: "Download STL" → spinner → "✓ Downloaded" (green flash)
- Duration: Actual generation time + 300ms minimum for perceived feedback

### Preset Selection
- Card scales up slightly on hover
- On click: viewport model cross-fades to new geometry
- Parameter panel values animate to new positions

### Section Collapse/Expand
- Smooth height transition (200ms ease-out)
- Chevron rotates 90°

---

## 7. Accessibility

- All interactive elements keyboard-navigable
- Sliders support arrow keys (step), Page Up/Down (big step), Home/End (min/max)
- ARIA labels on all controls and the 3D viewport
- Color contrast meets WCAG AA for all text on dark backgrounds
- Focus rings visible (accent-primary outline)
- Screen reader announcements for parameter changes and export status
- Reduced motion: Respect `prefers-reduced-motion` — disable 3D rotation animation, simplify transitions

---

## 8. Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| ≥1280px | Full layout: 280px sidebar + viewport |
| 1024–1279px | Narrower sidebar (240px), slightly smaller viewport |
| 768–1023px | Sidebar collapses to bottom panel, viewport takes full width (60/40 split) |
| <768px | Full-screen viewport + draggable bottom sheet for parameters |

---

## 9. Print-Ready Preview (Stretch Goal)

A special view mode that simulates how the object will look printed:
- Layer line texture overlay (adjustable layer height: 0.12–0.32mm)
- Filament color selector (PLA color swatches)
- Build plate visualization (configurable bed size)
- Estimated print time and filament weight display
