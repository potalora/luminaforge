# CLAUDE.md — LuminaForge

## Project Overview

LuminaForge is a web-based parametric design tool for generating 3D-printable lamps and vases. Users manipulate sliders and controls to create twisted spirals, geometric shells, and decorative forms, then export print-ready STL files. Think "gridfinitygenerator.com but for decorative objects."

**Key architectural decision**: All geometry generation runs client-side in a Web Worker using JSCAD. The backend is minimal (share links, analytics, future user accounts). This is a frontend-heavy application.

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript strict mode)
- **3D Rendering**: Three.js via React Three Fiber (R3F) + @react-three/drei
- **Geometry Engine**: @jscad/modeling (runs in Web Worker via Comlink)
- **State**: Zustand
- **Styling**: Tailwind CSS + CSS custom properties for design tokens
- **Export**: @jscad/stl-serializer, @jscad/3mf-serializer
- **Backend**: Vercel serverless functions, Vercel KV for share links
- **Auth** (Phase 4+): NextAuth.js v5
- **Testing**: Vitest + React Testing Library + Playwright

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page (SSR)
│   ├── editor/page.tsx     # Main editor (client component)
│   └── api/                # Serverless API routes
├── components/
│   ├── editor/             # Editor shell, layout, top bar
│   ├── parameters/         # Slider, select, toggle, section components
│   ├── viewport/           # R3F scene, model renderer, controls
│   ├── presets/            # Preset cards and gallery
│   └── ui/                 # Shared primitives (Button, Tooltip, etc.)
├── generators/             # JSCAD geometry generation (runs in worker)
│   ├── vase/               # Vase-specific generators
│   ├── lamp/               # Lamp-specific generators
│   └── shared/             # Shared utils, validation, exporters
├── store/                  # Zustand stores
├── hooks/                  # Custom hooks (worker comm, export, validation)
├── lib/                    # Utilities (param encoding, units, analytics)
├── types/                  # TypeScript type definitions
└── presets/                # Curated preset configurations
```

## Key Files You'll Work With Most

- `src/generators/vase/vaseGenerator.ts` — Core vase geometry (thin wrapper around shared shellBuilder)
- `src/generators/lamp/lampGenerator.ts` — Core lamp geometry (orchestrates base + shade)
- `src/generators/lamp/lampBaseGenerator.ts` — Lamp base: decorative shell + socket cavity + wire channel + lip
- `src/generators/lamp/lampShadeGenerator.ts` — Lamp shade: decorative shell with open bottom + inner lip
- `src/generators/lamp/socketConstants.ts` — E12/E14/E26/E27 socket specs, wire channel, connection lip constants
- `src/generators/shared/shellBuilder.ts` — `buildDecorativeShell()` — shared engine for vase + lamp parts
- `src/generators/shared/offsetPolygon.ts` — `offsetPolygonInward()` — normal-based wall offset
- `src/generators/worker.ts` — Web Worker entry (Comlink: generateVase, exportSTL, generateLamp, exportLampSTL)
- `src/store/designStore.ts` — Central state: vaseParams, lampParams, objectType, nested setters
- `src/types/design.ts` — All param types: DecorativeShellParams, VaseParams, LampParams, defaults
- `src/components/editor/EditorLayout.tsx` — Main editor composition
- `src/components/viewport/ModelRenderer.tsx` — Three.js mesh from JSCAD output
- `src/components/parameters/ParameterPanel.tsx` — Vase parameter panel (needs lamp dispatch)
- `src/components/parameters/parameterConfig.ts` — Vase param config arrays
- `src/hooks/useGeometryWorker.ts` — Worker communication hook (objectType dispatch)

## Development Commands

```bash
npm run dev          # Start dev server — ALWAYS use port 3001: PORT=3001 npm run dev
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript strict check
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run generate     # (custom) Test geometry generation in Node
```

## Architecture Rules

### Geometry Generation
- ALL geometry generation happens in the Web Worker (`src/generators/worker.ts`), NEVER on the main thread
- Use `@jscad/modeling` for CSG operations — do NOT use Three.js CSG (too slow, non-manifold results)
- Generator functions must be pure: `(params: VaseParams) => Geom3` — no side effects
- Transfer geometry to main thread via Transferable ArrayBuffers (positions, normals, indices)
- Debounce parameter changes at 150ms before triggering worker regeneration
- Use progressive refinement: low-res preview during slider drag, full-res on release

### Three.js / React Three Fiber
- Use R3F declarative components, NOT imperative Three.js in useEffect
- Dispose old BufferGeometry explicitly when replacing with new generation
- Camera defaults: position [200, 150, 200], fov 35
- Material: MeshStandardMaterial for vases, MeshPhysicalMaterial for lamps (transmission)
- Lighting: 3-point setup (warm key, cool fill, subtle rim)

### State Management
- `designStore` (Zustand) is the single source of truth for all design parameters
- Parameter changes flow: UI → store → debounced worker call → geometry → viewport
- URL hash encoding syncs with store for sharing (`useShareUrl` hook)
- View state (camera, view mode) in separate `viewportStore` — NOT in design store

### Styling
- Dark theme only (for now). All colors via CSS custom properties in `globals.css`
- Tailwind for layout/spacing. CSS variables for brand colors/theming
- Fonts: Instrument Serif (display), DM Sans (UI), JetBrains Mono (values)
- Accent color: warm amber `#E08A3C`. NOT purple/blue tech gradients.
- The 3D viewport should feel immersive — minimal UI chrome

### TypeScript
- Strict mode enabled. No `any` types except in JSCAD interop where types are incomplete.
- All parameter types defined in `src/types/design.ts`
- Use discriminated unions for object type: `{ type: 'vase'; params: VaseParams } | { type: 'lamp'; params: LampParams }`
- Prefer `const` assertions for static configuration objects

### Export
- Binary STL is the primary format (smallest, universal slicer support)
- STL serialization happens in the worker — return ArrayBuffer, download via Blob URL on main thread
- Export at maximum resolution (128+ segments) regardless of preview resolution
- File naming: `luminaforge-{type}-{timestamp}.stl`

### Testing
- Geometry generators must have unit tests — they're pure functions, easy to test
- Test that all presets generate valid geometry (no null, no empty meshes)
- Test parameter boundary values (min, max, 0, negative edge cases)
- Test URL parameter encoding/decoding round-trips

## Code Style

- Functional components with hooks (no class components)
- Named exports for components, default exports only for pages
- Use `useCallback` and `useMemo` judiciously — only where profiling shows benefit
- Prefer composition over prop drilling — use Zustand selectors
- File names: PascalCase for components, camelCase for everything else
- Import order: React → external libs → internal absolute → relative

## Common Pitfalls

1. **JSCAD types**: The @jscad/modeling package has incomplete TypeScript types. Use the `@types/jscad__modeling` package if available, or create local type declarations in `src/types/jscad.d.ts`.

2. **Web Worker + Next.js**: Workers need special webpack config in `next.config.js`:
   ```js
   webpack: (config) => {
     config.module.rules.push({
       test: /\.worker\.ts$/,
       use: { loader: 'worker-loader' },
     });
     return config;
   }
   ```
   Alternatively, use `new Worker(new URL(..., import.meta.url))` which Next.js supports natively.

3. **Three.js memory leaks**: Always dispose geometries and materials when components unmount or when geometry is replaced. Use R3F's `useFrame` cleanup or `useEffect` return.

4. **JSCAD Boolean operations are slow**: Voronoi cutouts on lamps can take 5+ seconds. Always run in worker. Consider pre-computing boolean operations at lower resolution for preview.

5. **Manifold geometry**: JSCAD generally produces manifold output, but complex boolean operations can sometimes create non-manifold edges. Validate with `@jscad/modeling`'s `measureVolume` — if it returns negative or zero, the mesh is likely non-manifold.

6. **R3F re-renders**: The `<Canvas>` component re-renders on parent re-renders. Use `React.memo` on viewport sub-components and Zustand selectors to prevent unnecessary re-renders during parameter changes.

7. **Subagent permissions**: Task tool agents may be denied Write/Edit/Bash permissions by the user's permission mode. If dispatching parallel agents for implementation, the user may need to approve permissions. Consider implementing directly if agents fail.

8. **Lamp test performance**: Lamp generator tests involve CSG boolean operations on decorative shells and are very slow (~13 min for full shade suite). Run targeted tests during development rather than the full suite: `npx vitest run <specific-test-file>`.

## Design Reference

See `docs/DESIGN_SPEC.md` for full visual design specification including colors, typography, layout, and component designs. Key points:
- Dark immersive theme, warm amber accents
- 3D viewport is the hero — takes maximum screen space
- Parameter panel: 280px fixed left sidebar (desktop), bottom sheet (mobile)
- Responsive breakpoints: 1280px (full), 1024px (narrow), 768px (tablet), <768px (mobile)

## Phase Roadmap Context

- **Phase 1 (current)**: Spiral vase generator + 3D preview + STL export
- **Phase 2**: Additional shapes, lamp generator, presets
- **Phase 3**: Lamp-specific features (socket mounts, light patterns)
- **Phase 4**: User accounts, saved designs, premium tier
- **Phase 5**: Community gallery, additional object types

When building features, check which phase they belong to. Don't over-engineer for future phases — but DO design data structures and interfaces that won't need breaking changes.

## JSCAD Quick Reference

```typescript
import { primitives, transforms, booleans, extrusions, utils } from '@jscad/modeling';

// Create shapes
const cyl = primitives.cylinder({ radius: 10, height: 50, segments: 64 });
const sphere = primitives.sphere({ radius: 15, segments: 32 });

// Transform
const moved = transforms.translate([0, 0, 25], cyl);
const rotated = transforms.rotateZ(Math.PI / 4, cyl);
const scaled = transforms.scale([1, 1, 2], cyl);

// Boolean
const result = booleans.subtract(cyl, sphere);
const combined = booleans.union(cyl, sphere);

// Extrude (key for vases)
const shape2d = primitives.circle({ radius: 10, segments: 6 }); // hexagon
const extruded = extrusions.extrudeLinear({ height: 100 }, shape2d);
const revolved = extrusions.extrudeRotate({ segments: 64 }, shape2d);

// Slice-based extrusion (best for twisted vases)
// Use extrudeFromSlices for full control over each layer
import { extrudeFromSlices, slice } from '@jscad/modeling/src/operations/extrusions';
```

## Git Tracking

- **Remote**: https://github.com/potalora/luminaforge (public, MIT license)
- `.claude/` is listed in `.gitignore` — never pushed to remotes.

## Git Workflow

- `main` — production (auto-deploys to Vercel)
- `develop` — integration branch
- Feature branches: `feat/vase-generator`, `feat/lamp-shells`, etc.
- Commit messages: conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`)
- PR required for merges to `develop` and `main`

## Environment Setup

```bash
# Prerequisites: Node 20+, npm 10+
git clone <repo>
cd luminaforge
npm install
cp .env.example .env.local   # Fill in API keys
npm run dev
```

No Docker needed. No external services needed for development (share links use in-memory mock in dev).

## Development Methodology

### Spec & Test Driven Development

This project follows **spec-driven, test-driven development**. These rules are non-negotiable:

1. **Write tests incrementally** — never write a large batch of code without testing it. Every meaningful function or module gets tests before or immediately after implementation. Do not move on to the next module until the current one passes all tests.
2. **Small batches** — build and verify in small increments. A batch should be testable and provable before starting the next one.
3. **Always check with the user before building user flows** — never autonomously design or implement user-facing flows (UI interactions, page layouts, navigation, editor workflows) without confirming the approach with the user first. Backend/engine code can proceed more independently, but anything the user will see or interact with requires sign-off.
4. **Frontend work requires the `frontend-design` skill** — always invoke the `frontend-design` skill when working on any frontend components, layouts, or UI. No exceptions.

## Session Protocol

**At the end of every autonomous session, you MUST:**

1. **Update this file** (`CLAUDE.md`) with:
   - Latest progress (what was completed)
   - Planned next steps (what comes next)
   - Any known issues or bugs discovered
2. **Commit your work** — all code changes, test results, and this file update

This ensures continuity between sessions. Never leave work uncommitted or undocumented.

## Current Progress

### Completed

- **Batch 1 — Engine Layer**: Core geometry engine code.
  - `src/types/design.ts` — VaseParams, LampParams, DesignParams, defaults
  - `src/types/geometry.ts` — GeometryResult, GeometryWorkerAPI
  - `src/types/jscad.d.ts` — Ambient type declarations for @jscad/modeling
  - `src/generators/vase/crossSections.ts` — createCirclePoints, createPolygonPoints, createStarPoints, applyRidgeModulation, createCrossSection
  - `src/generators/vase/profiles.ts` — getProfileScale (6 baked-in profile curves), getTwistProgress (4 easings)
  - `src/generators/vase/vaseGenerator.ts` — generateVase (hollow vase via extrudeFromSlices + boolean subtract)

- **Batch 2 — Plumbing Layer**: Connects geometry engine to UI.
  - `src/generators/shared/geometryConverter.ts` — JSCAD Geom3 → Three.js-ready buffers
  - `src/store/designStore.ts` — Zustand store: objectType, params, setParam, setParams, resetParams, setObjectType
  - `src/generators/worker.ts` — Web Worker via Comlink: generateVase + exportSTL
  - `src/hooks/useGeometryWorker.ts` — React hook: 150ms debounce, stale cancellation, exportSTL download

- **Batch 3 — Editor UI**: Full editor interface.
  - Editor page with responsive layout (sidebar + viewport)
  - Parameter panel with sliders, selects, toggles, collapsible sections
  - 3D viewport with R3F canvas, camera controls, lighting, grid
  - Model renderer connecting geometry worker to Three.js
  - Viewport store for camera/view state
  - Export button and generating indicator

- **Batch 3.5 — Feedback Round**: Geometry, params, and UI polish. 183 total tests, all passing.
  - **Param restructure**: `baseDiameter`/`topDiameter` → `diameter`/`taper` (baked-in profile identity)
  - **Rib → Ridge rename**: `ribCount`/`ribDepth`/`ribProfile` → `ridgeCount`/`ridgeDepth`/`ridgeProfile`
  - **Profile rewrite**: Each profile has a characteristic curve (bulbous=belly, hourglass=pinch, etc.) multiplied by linear taper. Hourglass now actually pinches.
  - **Resolution default**: 64 → 128 segments for smooth ridges
  - **Ridge defaults**: 20 ridges, 5mm depth (dense spiral aesthetic)
  - **Viewport centering**: Z-up→Y-up rotation on mesh, orbit target at vase midpoint
  - **Display plate**: Warm dark cylinder beneath vase for ground reference
  - **Camera**: Adjusted to [220, 180, 220] for breathing room
  - **Profile shape picker**: 3x2 grid of SVG silhouette cards with amber active state
  - **Panel restructure**: Shape (with visual picker) → Ridges (promoted) → Advanced (collapsed)
  - **Warm Workshop theme**: warm-gray backgrounds, sidebar gradient, Instrument Serif italic section headers, accent bar on sections, wider slider tracks
  - **Dead code removed**: `createBase()` deleted from vaseGenerator
  - **`@testing-library/jest-dom`** installed for vitest matchers

- **Batch 4 — Spiral Fin Style + Shapes**: New vase style and 12 cross-section shapes.
  - Spiral-fin vase style with fin count, height, width params
  - 12 cross-section shapes: circle, oval, squircle, superellipse, heart, teardrop, petal, leaf, polygon, star, gear, flower
  - Profile curve slider (-1 to 1) for hourglass/bulbous control
  - Cross-section picker (4x3 SVG grid) with shape-specific sub-params
  - Style selector (Classic / Spiral Fin)

- **Batch 4.1 — Fin Geometry Fixes + Design Refresh**: 283 total tests, all passing.
  - **Rounded fin geometry**: Replaced 5-point triangular fin profile with 9-point sin²(π·t) raised-cosine curve for smooth, rounded blades
  - **Nyquist fix**: Spiral-fin mode boosts cross-section segments to `finCount * 10` so cosine waves render as smooth curves instead of aliased zigzags
  - **Fin width slider fix**: Added `dynamicMax` to `SliderConfig` interface; finWidth slider max now computed from finCount (`360/finCount * 0.8`), clamped to 0.95 in generator
  - **New defaults**: finCount=55, finHeight=3.5, finWidth=2.2 (tuned from visual testing); slider ranges centered around defaults (finCount 30-80, finHeight 1-6, finWidth 0.5-4.0)
  - **Default style**: spiral-fin (was classic)
  - **Modern Zen frontend refresh**: Cormorant Garamond (display), Outfit (UI body), IBM Plex Mono (values)
  - **Typography refinements**: body letter-spacing 0.01em, thinner slider tracks (3px), section headers with light weight + 0.2em tracking, smaller 14px slider thumbs
  - **ParamSlider `maxOverride` prop**: enables dynamic max from parent via `dynamicMax` config
  - **README.md**: Project README for public repo (humanized, no AI slop)
  - **MIT license**: Added LICENSE file
  - **Published to GitHub**: https://github.com/potalora/luminaforge (public)

- **Batch 4.2 — Smooth Inner Wall Toggle + Concave Wall Fix**: 295 total tests, all passing.
  - **smoothInnerWall toggle for spiral-fin**: Added toggle to `FIN_PARAMS` so both classic and spiral-fin styles respect the `smoothInnerWall` setting (was hardcoded to `true` for spiral-fin)
  - **Per-point radial wall clamping**: Replaced uniform `radiusOffset` with `applyWallInset()` that shrinks each inner wall point radially by `wallThickness`, clamped to `wallThickness * 0.3` minimum radius. Prevents inner wall collapse on concave shapes (star, heart, teardrop, petal, leaf, gear, flower)
  - **`buildShell` refactor**: `radiusOffset` parameter replaced with `wallInset` (positive value). Inner shell generated at full outer radius, then per-point offset applied
  - **12 new tests**: UI toggle visibility in spiral-fin, smooth vs finned inner wall for spiral-fin, 7 concave shapes with aggressive `wallThickness: 4`, star with deep valleys + thick wall, heart with spiral-fin + thick wall

- **Batch 4.3 — Normal-Based Wall Offset + Test Split**: 304 total tests, all passing.
  - **Normal-based wall offset**: Replaced radial `applyWallInset` with `offsetPolygonInward` — offsets along averaged edge normals (miter) for uniform perpendicular wall thickness. Miter capped at 2× offset to prevent spikes at sharp corners; minRadius clamp prevents collapse on concave shapes.
  - **Slope compensation**: Wall inset scales by `√(1 + (dR/dH)²)` per layer so sloped/bulbous/hourglass regions maintain consistent thickness instead of thinning on steep surfaces.
  - **Test file split**: Monolithic `vaseGenerator.test.ts` (406 lines) split into 4 focused files: `vaseGenerator.classic.test.ts` (32 tests), `vaseGenerator.spiralFin.test.ts` (9 tests), `vaseGenerator.concave.test.ts` (12 tests), `vaseGenerator.wallOffset.test.ts` (6 tests)
  - **Vitest threading**: Added thread pool (4–8 threads) to `vitest.config.ts` for parallel test execution
  - **6 new offsetPolygonInward unit tests**: circle uniform offset, all-finite, point count preservation, minRadius clamp, square perpendicular offset, star robustness
  - **3 new slope compensation integration tests**: bulbous+thick wall, hourglass+thick wall, steep taper+thick wall

- **Batch 5a — Lamp Engine + Plumbing**: 398 total tests, all passing.
  - **DecorativeShellParams shared interface**: Extracted shared decorative params used by vase, lamp base, and lamp shade. `VaseParams extends DecorativeShellParams`. Defined in `src/types/design.ts`.
  - **Shared shellBuilder**: `buildDecorativeShell()` in `src/generators/shared/shellBuilder.ts` — extracted from vase generator, used by both vase and lamp generators. Interface: `(params: DecorativeShellParams, options: ShellBuildOptions) => Geom3`.
  - **Shared offsetPolygon**: `offsetPolygonInward()` extracted to `src/generators/shared/offsetPolygon.ts`.
  - **Vase refactor**: `vaseGenerator.ts` now a thin wrapper calling `buildDecorativeShell` twice (outer + inner) + boolean subtract. Re-exports `offsetPolygonInward` for backward compat.
  - **Socket constants**: `src/generators/lamp/socketConstants.ts` — E12, E14, E26, E27 specs (IEC 60061), wire channel (SPT-1: 7mm×4mm), connection lip (friction-fit: 5mm height, 0.3mm tolerance; gravity-sit: half height).
  - **Lamp generators**: `lampBaseGenerator.ts` (hollow decorative base + socket cavity + optional wire channel + connection lip), `lampShadeGenerator.ts` (hollow decorative shade with open bottom + inner connection lip), `lampGenerator.ts` (orchestrator: base + shade positioned on top via union).
  - **Store dual params**: `designStore.ts` has `vaseParams`, `lampParams` with backward-compatible `params` alias (= `vaseParams`). Nested setters: `setLampParam`, `setLampBaseParam`, `setLampShadeParam`, `setLampParams`, `resetLampParams`.
  - **Worker lamp methods**: `worker.ts` has `generateLamp(params)` + `exportLampSTL(params, part)` where part is `'combined' | 'base' | 'shade'`.
  - **Hook objectType dispatch**: `useGeometryWorker.ts` dispatches to `api.generateVase` or `api.generateLamp` based on `objectType`. `exportSTL` accepts optional `LampExportPart` for per-part export.
  - **Lamp param UI components**: `LampParamSlider.tsx`, `LampParamToggle.tsx`, `LampParamSelect.tsx` — mirror vase param components but use `setLampBaseParam`/`setLampShadeParam` via `part` prop.
  - **94 new tests**: socketConstants (23), lampBaseGenerator (12), lampShadeGenerator (19), lampGenerator (3), shellBuilder (26), designStore lamp params (11).

### Known Issues

- **Sharp ridge modulation**: The triangle wave formula can produce modulation values > 1 for negative angles (from `atan2`), meaning ridges can be deeper than `ridgeDepth` in some orientations.
- **Polygon/star spiral-fin broken**: Polygon and star cross-sections produce malformed geometry in spiral-fin mode. Tracked in [#2](https://github.com/potalora/luminaforge/issues/2).
- **Lamp CSG tests are slow**: `lampShadeGenerator` tests take ~13 min (12 cross-sections × boolean subtract). Run lamp tests selectively: `npx vitest run src/generators/lamp/__tests__/lampBaseGenerator.test.ts`
- **RidgeProfile valid values**: `'round' | 'sharp' | 'flat'` — NOT `'pointed'`.

### Planned Next Steps

- **Batch 5b — Lamp Frontend** (next session, in progress):
  - Create `lampParameterConfig.ts` — config arrays for lamp base/shade decorative params (mirrors `parameterConfig.ts` pattern)
  - Create `SocketTypePicker.tsx` — visual picker for E12/E14/E26/E27 socket types
  - Create `LampParameterPanel.tsx` — main lamp panel with base/shade tab switcher + decorative param sections per part
  - Create `LampCrossSectionPicker.tsx` — cross-section picker wired to lamp base/shade store
  - Create `LampStyleSelector.tsx` — style selector wired to lamp base/shade store
  - Update `ObjectTypeToggle.tsx` — enable lamp button (currently disabled with "Coming soon"), wire to `setObjectType`
  - Update `ParameterPanel.tsx` — dispatch between vase panel and `LampParameterPanel` based on `objectType`
  - Update `ExportButton.tsx` — add part dropdown for lamp export (combined/base/shade)
  - Update `ViewportContainer.tsx` — read lamp dimensions for camera/plate sizing when `objectType === 'lamp'`
  - Update `ModelRenderer.tsx` — use MeshPhysicalMaterial (transmission) for lamp shades
  - **Frontend work requires the `frontend-design` skill** — invoke before building any UI
- **Fix polygon/star spiral-fin bug** ([#2](https://github.com/potalora/luminaforge/issues/2))
- Consider progressive refinement: low-res preview during slider drag, full-res on release
