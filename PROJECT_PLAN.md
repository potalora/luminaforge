# LuminaForge — Parametric Lamp & Vase Generator

## Project Overview

LuminaForge is a web-based parametric design tool for generating 3D-printable lamps and vases. Users manipulate intuitive controls to create twisted spirals, geometric shells, organic forms, and hybrid designs — then export production-ready STL/3MF files. Inspired by the simplicity and focus of [gridfinitygenerator.com](https://gridfinitygenerator.com), but applied to decorative/functional art objects.

### Why This Exists

The parametric decorative 3D printing space is fragmented:
- **Thingiverse/Printables** — static models, no customization
- **OpenSCAD** — powerful but intimidating code-first workflow
- **Fusion 360 / Blender** — overkill for parametric decorative objects
- **Vase mode slicers** — limited to simple profiles, no structural generation

There is no focused, approachable tool that lets someone go from "I want a twisted hexagonal vase with 6 spiral ribs" to a downloadable STL in 30 seconds.

---

## Project Name Options

| Name | Rationale |
|------|-----------|
| **LuminaForge** | Light + making — covers both lamps and creative process |
| **SpireGen** | Spire/spiral + generator — descriptive and memorable |
| **TwistCraft** | Immediately communicates the spiral/twist aesthetic |
| **FormLab3D** | Generic but professional |

*Working name: **LuminaForge** — adjust as branding develops.*

---

## Core Value Proposition

1. **Zero learning curve** — slider-based controls, instant 3D preview
2. **Print-ready output** — manifold geometry, configurable wall thickness, proper tolerances
3. **Beautiful defaults** — curated presets that look stunning out of the box
4. **Focused scope** — lamps and vases only, done exceptionally well

---

## Project Phases

### Phase 1: Foundation (Weeks 1–3)
- Project scaffolding (Next.js + Three.js)
- OpenJSCAD/JSCAD integration for geometry generation
- Core spiral vase generator with basic parameters
- Real-time 3D preview with orbit controls
- STL export functionality
- Basic responsive UI with parameter panel

### Phase 2: Shape Library (Weeks 4–6)
- Additional vase profiles: cylindrical, tapered, bulbous, flared
- Twisted spiral engine with configurable twist rate, rib count, amplitude
- Basic geometric lamp shapes: dodecahedron, icosahedron, faceted cylinder
- Voronoi / lattice pattern generation for lamp shells
- Preset gallery with thumbnail previews
- Cross-section editor (SVG path → revolution profile)

### Phase 3: Lamp-Specific Features (Weeks 7–9)
- Lamp base/socket mount generation (E26/E27/E14 standard sockets)
- Light diffusion pattern previews (simulated light pass-through)
- Multi-part assembly support (base + shade as separate STLs)
- Cord routing channel generation
- Wall thickness validation for light transmission

### Phase 4: Polish & Launch (Weeks 10–12)
- User accounts & saved designs (optional, can defer)
- Shareable design URLs (parameter encoding in URL)
- Curated preset gallery (12–20 stunning defaults)
- Landing page, documentation, SEO
- Performance optimization (Web Workers for geometry generation)
- Mobile-responsive parameter controls
- Analytics integration

### Phase 5: Growth (Post-Launch)
- Community gallery (user-submitted designs)
- Premium presets / advanced features (monetization)
- Additional object types (planters, candle holders, pen cups)
- AI-assisted design suggestions
- Direct slicer integration / print service partnerships

---

## Technical Architecture Summary

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  Next.js 14+ (App Router)                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Parameter │  │ Three.js │  │  Preset   │ │
│  │  Panel    │  │ Viewport │  │  Gallery  │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │        │
│       └──────┬───────┘──────────────┘        │
│              │                               │
│     ┌────────▼────────┐                      │
│     │  Design State   │ (Zustand store)      │
│     │  Manager        │                      │
│     └────────┬────────┘                      │
│              │                               │
│     ┌────────▼────────┐                      │
│     │  Web Worker      │                      │
│     │  JSCAD Engine    │                      │
│     │  (geometry gen)  │                      │
│     └────────┬────────┘                      │
│              │                               │
│     ┌────────▼────────┐                      │
│     │  STL/3MF Export │                      │
│     └─────────────────┘                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            Backend (Minimal)                 │
│  Vercel/Cloudflare serverless               │
│  - Preset storage (JSON/DB)                 │
│  - Share link resolution                    │
│  - Analytics events                         │
│  - (Future) User accounts & saved designs   │
└─────────────────────────────────────────────┘
```

**Key decision: Geometry generation runs entirely client-side** in a Web Worker using JSCAD. No server-side compute needed for STL generation. This keeps costs near zero and eliminates latency.

---

## Success Metrics

| Metric | Phase 1 Target | Launch Target |
|--------|---------------|---------------|
| Time to first STL export | < 60 seconds | < 30 seconds |
| Geometry generation time | < 5 seconds | < 3 seconds |
| Lighthouse Performance | > 80 | > 90 |
| Preset designs available | 3 | 20 |
| Supported object types | Spiral vase | Vases + Lamps |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| JSCAD performance on complex geometry | High | Web Workers, LOD preview, progressive refinement |
| Three.js ↔ JSCAD mesh sync complexity | Medium | Shared buffer transfer, debounced updates |
| Mobile usability of 3D viewport + sliders | Medium | Responsive layout, touch-optimized controls |
| Scope creep into general-purpose CAD | High | Strict scope: lamps and vases only |
| STL manifold issues for printing | High | Automated manifold validation, wall thickness checks |
