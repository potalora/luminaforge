# LuminaForge — Product Specification

## 1. Product Vision

**One-liner:** The parametric design tool that makes beautiful 3D-printable lamps and vases accessible to everyone.

**Elevator pitch:** LuminaForge lets you create stunning twisted spiral vases and geometric lamp shades using simple sliders and controls — no CAD experience needed. Pick a base shape, twist it, sculpt it, preview it in 3D, and download a print-ready STL in seconds.

---

## 2. Target Users

### Primary: 3D Printing Enthusiasts
- Own an FDM/resin printer
- Browse Thingiverse/Printables for models
- Want unique, customized pieces — not cookie-cutter downloads
- Comfortable with slicers but not with CAD software
- **Key motivation:** "I want something unique that I made, not just downloaded"

### Secondary: Makers & Crafters
- May not own a printer but use print services (Shapeways, local makerspaces)
- Interested in home décor, gifts, functional art
- **Key motivation:** "I want a custom lamp/vase that matches my space"

### Tertiary: Designers & Artists
- Use parametric design professionally or as creative practice
- May use OpenSCAD/Grasshopper already
- Want a faster workflow for specific object types
- **Key motivation:** "Rapid iteration on decorative forms"

---

## 3. Object Types & Parameters

### 3.1 Spiral Vases

The flagship object type. A vase is defined by a **profile curve** (the silhouette) that is **revolved** around a central axis with optional **twist**, **rib**, and **pattern** modifications.

#### Base Parameters
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Height | 50–400mm | 150mm | Total vase height |
| Base Diameter | 30–200mm | 80mm | Diameter at bottom |
| Top Diameter | 30–250mm | 100mm | Diameter at top |
| Wall Thickness | 0.8–4mm | 1.6mm | Shell wall thickness |
| Base Thickness | 1–6mm | 2mm | Solid base height |
| Resolution | 32–256 | 64 | Polygon count around circumference |

#### Profile Shapes
| Shape | Description |
|-------|-------------|
| Cylinder | Straight walls |
| Tapered | Linear taper from base to top diameter |
| Bulbous | Sine-curve bulge at configurable height |
| Flared | Trumpet/flare at the top |
| Hourglass | Pinched middle |
| S-Curve | Sigmoid profile |
| Custom | User-defined via draggable bezier control points |

#### Twist & Spiral Parameters
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Twist Angle | 0–720° | 180° | Total twist from base to top |
| Twist Direction | CW / CCW | CW | Clockwise or counter-clockwise |
| Rib Count | 0–24 | 6 | Number of spiral ribs |
| Rib Depth | 0–20mm | 3mm | How far ribs protrude |
| Rib Profile | Round / Sharp / Flat | Round | Cross-section shape of ribs |
| Twist Easing | Linear / Ease-in / Ease-out / Ease-in-out | Linear | How twist accelerates over height |

#### Cross-Section Shapes
The cross-section (horizontal slice) can be modified from circular:
| Shape | Description |
|-------|-------------|
| Circle | Standard round |
| Polygon (N-gon) | Triangle, square, pentagon, hexagon, etc. |
| Star | Star polygon with configurable point count and inner radius ratio |
| Superellipse | Squircle-family shapes (roundness parameter) |
| Organic | Perlin-noise distorted circle |

#### Surface Patterns (Phase 2+)
| Pattern | Description |
|---------|-------------|
| Smooth | No pattern |
| Faceted | Low-poly faceting |
| Wave | Sinusoidal surface displacement |
| Honeycomb | Hexagonal cutout pattern |
| Voronoi | Organic cell pattern cutouts |

---

### 3.2 Geometric Lamps

Lamp shades and enclosures built from geometric primitives with pattern cutouts for light transmission.

#### Base Parameters
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Height | 80–350mm | 200mm | Total lamp height |
| Diameter | 80–300mm | 150mm | Maximum diameter |
| Wall Thickness | 1–4mm | 2mm | Shell thickness |
| Socket Type | E26 / E27 / E14 / None | E26 | Bulb socket mount |
| Open Top | Yes / No | Yes | Whether top is open (heat ventilation) |
| Top Opening Diameter | 20–100mm | 40mm | Size of top opening |

#### Shell Shapes
| Shape | Description |
|-------|-------------|
| Sphere | Full or partial sphere |
| Cylinder | With optional taper |
| Polyhedron | Dodecahedron, icosahedron, truncated variants |
| Twisted Cylinder | Same spiral engine as vases |
| Dome | Half-sphere or parabolic |
| Lantern | Traditional lantern silhouette |

#### Light Pattern Types
| Pattern | Description | Key Parameters |
|---------|-------------|----------------|
| Voronoi | Organic cell cutouts | Cell count, min wall, randomness seed |
| Lattice | Diamond/square grid | Grid spacing, bar width, rotation |
| Spiral Slots | Twisted slot cutouts | Slot count, width, twist angle |
| Geometric Tiles | Repeating polygon tiles | Tile type, scale, gap width |
| Shadow Lines | Parallel or radial line cutouts | Line count, width, curvature |
| Solid | No cutouts (for opaque shades) | — |

#### Lamp-Specific Features
- **Socket mount**: Internal geometry to friction-fit standard bulb sockets
- **Cord channel**: Vertical channel for power cord routing
- **Multi-part mode**: Generate base and shade as separate STL files for assembly
- **Light preview**: Simulated point light source showing shadow/pattern projection

---

### 3.3 Hybrid Objects (Phase 3+)
- **Lamp-vase combos**: Vase that doubles as lamp base with integrated socket mount
- **Candle holders**: Short vases with candle-diameter cavity
- **Planters**: Vases with drainage holes and saucer generation

---

## 4. User Workflows

### 4.1 Quick Start (30-second flow)
1. Land on homepage → see curated presets
2. Click a preset (e.g., "Twisted Hex Vase")
3. See 3D preview with preset parameters loaded
4. Adjust 1–2 sliders (height, twist)
5. Click "Download STL"
6. Done

### 4.2 Custom Design Flow
1. Choose object type: Vase or Lamp
2. Select base shape / profile
3. Configure parameters via sliders and dropdowns
4. Real-time 3D preview updates (debounced ~200ms)
5. Toggle wireframe / solid / x-ray view modes
6. Validate printability (wall thickness, overhangs)
7. Export STL or 3MF
8. (Optional) Save design / share via URL

### 4.3 Preset Exploration Flow
1. Browse preset gallery with filtered categories
2. Preview presets in 3D carousel or grid
3. Click "Customize" to fork a preset into the editor
4. Modify and export

---

## 5. Export & Print Considerations

### Export Formats
| Format | Priority | Notes |
|--------|----------|-------|
| STL (binary) | P0 | Universal slicer support |
| 3MF | P1 | Better format, growing adoption |
| OBJ | P2 | For rendering workflows |
| STEP | P3 | For CAD import (complex to generate) |
| OpenSCAD | P2 | Export as .scad file for further editing |

### Print Validation
The app should warn users about:
- Wall thickness below 0.8mm (FDM minimum)
- Overhangs exceeding 60° without support considerations
- Non-manifold geometry (should never occur with proper generation)
- Total print dimensions exceeding common bed sizes (220mm, 256mm, 300mm, 350mm)
- Estimated print time / filament usage (basic calculation)

### Vase Mode Compatibility
Many spiral vases are ideal for "vase mode" (single-wall spiral) printing. The app should:
- Flag designs compatible with vase mode
- Offer a "vase mode optimized" toggle that ensures single continuous wall
- Warn when features break vase mode compatibility (ribs, cutouts)

---

## 6. Monetization Strategy (Future)

### Free Tier
- All basic shapes and parameters
- 5 preset designs
- STL export
- No account required

### Premium Tier ($5–8/month or $40–60/year)
- Full preset library (20+ curated designs)
- Advanced patterns (Voronoi, honeycomb, custom cross-sections)
- Save unlimited designs to account
- 3MF and OpenSCAD export
- Priority feature requests
- No watermark on shared designs

### Alternative: One-Time Purchase
- Lifetime access for $20–30
- Lower friction, simpler model
- Good for maker community expectations

---

## 7. Competitive Landscape

| Tool | Strengths | Weaknesses | Our Advantage |
|------|-----------|------------|---------------|
| Thingiverse Customizer | Large library | Slow, buggy, limited params | Speed, UX, focused scope |
| OpenSCAD | Infinitely flexible | Code-only, steep learning curve | Visual, instant, no code |
| Fusion 360 | Professional CAD | Overkill, subscription, slow | Purpose-built, free, instant |
| Vase generators on Printables | Free STLs | Static, no customization | Full parametric control |
| gridfinitygenerator.com | Great UX model | Different domain (storage) | Same UX philosophy applied to décor |

---

## 8. Non-Goals (Explicit Scope Boundaries)

- **Not a general CAD tool** — no freeform modeling, boolean operations, assemblies
- **Not a slicer** — no G-code generation, no print profiles
- **Not a marketplace** — no selling/buying designs (Phase 5+ maybe)
- **Not a social platform** — minimal community features, focus on tool quality
- **Not multi-material** — single material per object (multi-color via painting in slicer)
