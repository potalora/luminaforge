# LuminaForge — Frontend Technical Specification

## 1. Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 14+** (App Router) | SSR for landing/SEO, client-heavy editor page |
| Language | **TypeScript** (strict mode) | Type safety for complex geometry parameter types |
| 3D Rendering | **Three.js** + **React Three Fiber** (R3F) | Declarative 3D in React, massive ecosystem |
| Geometry Engine | **JSCAD** (OpenJSCAD v2) | Parametric CSG geometry, runs in browser |
| State Management | **Zustand** | Lightweight, perfect for parameter state + subscriptions |
| Styling | **Tailwind CSS** + CSS variables | Utility-first with design tokens |
| Export | **three-stl-exporter** + custom 3MF writer | STL binary export from Three.js geometry |
| Worker Thread | **Web Workers** (Comlink) | Offload geometry generation from main thread |
| Deployment | **Vercel** | Zero-config Next.js deployment, edge functions |

### Package Dependencies (Core)

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "three": "^0.160.x",
    "@jscad/modeling": "^2.x",
    "@jscad/stl-serializer": "^2.x",
    "@jscad/3mf-serializer": "^2.x",
    "zustand": "^4.x",
    "comlink": "^4.x",
    "framer-motion": "^10.x",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@types/three": "latest",
    "vitest": "latest",
    "@testing-library/react": "latest"
  }
}
```

---

## 2. Project Structure

```
luminaforge/
├── public/
│   ├── presets/                    # Preset thumbnail images
│   └── fonts/                     # Self-hosted fonts
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (fonts, metadata)
│   │   ├── page.tsx               # Landing page
│   │   ├── editor/
│   │   │   └── page.tsx           # Main editor (client component)
│   │   ├── presets/
│   │   │   └── page.tsx           # Preset gallery page
│   │   └── api/
│   │       ├── share/route.ts     # Share link creation/resolution
│   │       └── analytics/route.ts # Event tracking
│   │
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EditorLayout.tsx       # Main editor shell
│   │   │   ├── ParameterPanel.tsx     # Left sidebar container
│   │   │   ├── Viewport.tsx           # R3F Canvas wrapper
│   │   │   ├── TopBar.tsx             # Nav + export controls
│   │   │   ├── StatusBar.tsx          # Print warnings
│   │   │   └── DimensionOverlay.tsx   # Floating dimension display
│   │   │
│   │   ├── parameters/
│   │   │   ├── ParamSlider.tsx        # Core slider component
│   │   │   ├── ParamSelect.tsx        # Dropdown select
│   │   │   ├── ParamToggle.tsx        # Toggle group
│   │   │   ├── ParamSection.tsx       # Collapsible section
│   │   │   ├── ProfileEditor.tsx      # Bezier profile curve editor
│   │   │   └── ColorPicker.tsx        # Model color selector
│   │   │
│   │   ├── viewport/
│   │   │   ├── ModelRenderer.tsx      # Renders JSCAD geometry as Three.js mesh
│   │   │   ├── GroundGrid.tsx         # Infinite grid floor
│   │   │   ├── SceneLighting.tsx      # 3-point light setup
│   │   │   ├── CameraControls.tsx     # Orbit controls config
│   │   │   └── ViewModeToggle.tsx     # Solid/wireframe/x-ray
│   │   │
│   │   ├── presets/
│   │   │   ├── PresetCard.tsx         # Gallery card component
│   │   │   ├── PresetGallery.tsx      # Grid layout
│   │   │   └── PresetCarousel.tsx     # Landing page carousel
│   │   │
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── ui/                        # Shared primitives
│   │       ├── Button.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Dialog.tsx
│   │       └── Toast.tsx
│   │
│   ├── generators/                    # JSCAD geometry generators
│   │   ├── worker.ts                  # Web Worker entry point
│   │   ├── vase/
│   │   │   ├── profiles.ts           # Profile curve definitions
│   │   │   ├── crossSections.ts      # Cross-section shape generators
│   │   │   ├── spiralEngine.ts       # Twist/rib generation
│   │   │   ├── vaseGenerator.ts      # Main vase assembly
│   │   │   └── vaseParams.ts         # Parameter type definitions
│   │   ├── lamp/
│   │   │   ├── shells.ts             # Shell shape generators
│   │   │   ├── patterns.ts           # Cutout pattern generators
│   │   │   ├── socketMounts.ts       # Bulb socket geometry
│   │   │   ├── lampGenerator.ts      # Main lamp assembly
│   │   │   └── lampParams.ts         # Parameter type definitions
│   │   ├── shared/
│   │   │   ├── meshUtils.ts          # Geometry helpers
│   │   │   ├── validation.ts         # Printability checks
│   │   │   └── exporters.ts          # STL/3MF/OBJ serialization
│   │   └── index.ts                  # Generator factory
│   │
│   ├── store/
│   │   ├── designStore.ts            # Main parameter state (Zustand)
│   │   ├── viewportStore.ts          # Camera, view mode state
│   │   ├── uiStore.ts                # Panel state, mobile drawer
│   │   └── presetStore.ts            # Preset management
│   │
│   ├── presets/
│   │   ├── vasePresets.ts            # Curated vase configurations
│   │   └── lampPresets.ts            # Curated lamp configurations
│   │
│   ├── hooks/
│   │   ├── useGeometryWorker.ts      # Web Worker communication
│   │   ├── useDebounce.ts            # Debounced parameter updates
│   │   ├── useShareUrl.ts            # URL parameter encoding/decoding
│   │   ├── useExport.ts              # Export workflow
│   │   └── usePrintValidation.ts     # Real-time print checks
│   │
│   ├── lib/
│   │   ├── paramEncoding.ts          # URL-safe parameter serialization
│   │   ├── units.ts                  # mm/inch conversion helpers
│   │   └── analytics.ts              # Event tracking
│   │
│   └── types/
│       ├── design.ts                 # Core design parameter types
│       ├── preset.ts                 # Preset schema
│       └── export.ts                 # Export format types
│
├── worker/
│   └── geometry.worker.ts            # Web Worker for JSCAD (separate bundle)
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── CLAUDE.md
└── package.json
```

---

## 3. Core Type Definitions

```typescript
// types/design.ts

type ObjectType = 'vase' | 'lamp';

type ProfileShape = 'cylinder' | 'tapered' | 'bulbous' | 'flared' | 'hourglass' | 'scurve' | 'custom';
type CrossSection = 'circle' | 'polygon' | 'star' | 'superellipse' | 'organic';
type RibProfile = 'round' | 'sharp' | 'flat';
type TwistEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
type SurfacePattern = 'smooth' | 'faceted' | 'wave' | 'honeycomb' | 'voronoi';

type LampShell = 'sphere' | 'cylinder' | 'polyhedron' | 'twisted' | 'dome' | 'lantern';
type LightPattern = 'voronoi' | 'lattice' | 'spiralSlots' | 'geometricTiles' | 'shadowLines' | 'solid';
type SocketType = 'E26' | 'E27' | 'E14' | 'none';

interface VaseParams {
  // Base
  height: number;              // mm, 50-400
  baseDiameter: number;        // mm, 30-200
  topDiameter: number;         // mm, 30-250
  wallThickness: number;       // mm, 0.8-4
  baseThickness: number;       // mm, 1-6
  resolution: number;          // 32-256

  // Profile
  profileShape: ProfileShape;
  customProfilePoints?: [number, number][];  // Bezier control points for custom

  // Twist
  twistAngle: number;          // degrees, 0-720
  twistDirection: 'cw' | 'ccw';
  ribCount: number;            // 0-24
  ribDepth: number;            // mm, 0-20
  ribProfile: RibProfile;
  twistEasing: TwistEasing;

  // Cross-section
  crossSection: CrossSection;
  polygonSides?: number;       // 3-12, for polygon
  starPoints?: number;         // 3-12, for star
  starInnerRatio?: number;     // 0.2-0.8, for star
  superellipseN?: number;      // 0.5-4, for superellipse

  // Surface
  surfacePattern: SurfacePattern;
  patternScale?: number;
  patternDepth?: number;
}

interface LampParams {
  height: number;
  diameter: number;
  wallThickness: number;
  shellShape: LampShell;
  lightPattern: LightPattern;
  socketType: SocketType;
  openTop: boolean;
  topOpeningDiameter: number;
  resolution: number;

  // Pattern-specific params
  patternCellCount?: number;
  patternWallMin?: number;
  patternSeed?: number;
  patternRotation?: number;
  // ... (varies by pattern type)
}

type DesignParams = 
  | { type: 'vase'; params: VaseParams }
  | { type: 'lamp'; params: LampParams };

interface DesignState {
  design: DesignParams;
  // Actions
  setParam: <K extends keyof VaseParams | keyof LampParams>(key: K, value: any) => void;
  setObjectType: (type: ObjectType) => void;
  loadPreset: (preset: Preset) => void;
  resetToDefaults: () => void;
}
```

---

## 4. Geometry Generation Pipeline

### Architecture: Web Worker + Transferable Buffers

```
Main Thread                           Worker Thread
─────────────                         ─────────────
                                      
designStore ──► debounce(150ms) ──►  postMessage(params)
                                          │
                                          ▼
                                     JSCAD generates geometry
                                          │
                                          ▼
                                     Convert to BufferGeometry
                                          │
                                          ▼
                                     transferable ArrayBuffers
                                          │
postMessage(buffers) ◄───────────────────┘
       │
       ▼
Three.js BufferGeometry.fromBuffers()
       │
       ▼
Update mesh in R3F scene
```

### Worker Communication (via Comlink)

```typescript
// hooks/useGeometryWorker.ts

import { wrap } from 'comlink';

const useGeometryWorker = () => {
  const workerRef = useRef<Worker>();
  const apiRef = useRef<GeometryWorkerAPI>();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../worker/geometry.worker.ts', import.meta.url)
    );
    apiRef.current = wrap<GeometryWorkerAPI>(workerRef.current);
    return () => workerRef.current?.terminate();
  }, []);

  const generate = useCallback(async (params: DesignParams) => {
    if (!apiRef.current) return null;
    const result = await apiRef.current.generate(params);
    // result contains transferable ArrayBuffers for positions, normals, indices
    return result;
  }, []);

  return { generate };
};
```

### JSCAD Geometry Pipeline

```typescript
// generators/vase/vaseGenerator.ts

import { primitives, transforms, booleans, extrusions } from '@jscad/modeling';

export function generateVase(params: VaseParams): Geom3 {
  // 1. Create cross-section at base
  const baseSection = createCrossSection(params);
  
  // 2. Create height profile (array of scale/position/rotation at each layer)
  const layers = computeLayers(params);
  
  // 3. Loft through layers with twist
  const shell = loftWithTwist(baseSection, layers, params);
  
  // 4. Apply rib modulation
  const ribbed = applyRibs(shell, params);
  
  // 5. Hollow out (shell operation)
  const hollowed = hollowShell(ribbed, params.wallThickness);
  
  // 6. Add solid base
  const withBase = addBase(hollowed, params);
  
  // 7. Apply surface pattern (if any)
  const finished = applySurfacePattern(withBase, params);
  
  return finished;
}
```

### Performance Targets

| Operation | Target | Strategy |
|-----------|--------|----------|
| Simple vase generation | < 500ms | Low-res preview during drag, full on release |
| Complex vase (high res + pattern) | < 3s | Progressive: preview mesh → full mesh |
| Lamp with Voronoi cutouts | < 5s | Pre-computed Voronoi → boolean subtract |
| STL export serialization | < 1s | Binary STL, generated in worker |
| Preview update during drag | < 100ms | Simplified geometry (1/4 resolution) |

### Progressive Refinement Strategy

```
User drags slider
  → Immediate: Update preview with LOW resolution (resolution/4)
  → 150ms debounce expires
  → Worker: Generate FULL resolution geometry
  → Swap preview mesh with full mesh (crossfade)
```

---

## 5. Three.js Viewport Implementation

### Scene Setup (R3F)

```tsx
// components/viewport/Viewport.tsx

<Canvas
  camera={{ position: [200, 150, 200], fov: 35, near: 0.1, far: 10000 }}
  gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
  shadows
>
  <color attach="background" args={['#0D0D0F']} />
  <fog attach="fog" args={['#0D0D0F', 500, 1500]} />
  
  <SceneLighting />
  <GroundGrid />
  <ModelRenderer />
  <CameraControls />
  
  {/* Post-processing */}
  <EffectComposer>
    <SSAO radius={0.4} intensity={20} />
    <Bloom luminanceThreshold={0.8} intensity={0.3} />
  </EffectComposer>
</Canvas>
```

### Material Configuration

```tsx
// Default ceramic-like material
<meshStandardMaterial
  color="#D4C4A8"
  roughness={0.7}
  metalness={0.05}
  envMapIntensity={0.5}
/>

// Lamp mode — show light transmission
<meshPhysicalMaterial
  color="#D4C4A8"
  roughness={0.6}
  metalness={0.0}
  transmission={0.3}       // Subtle translucency for lamp preview
  thickness={wallThickness}
  ior={1.5}
/>
```

---

## 6. URL-Based State & Sharing

### Parameter Encoding

All design parameters are encoded in the URL hash for instant sharing:

```
https://luminaforge.app/editor#v=1&t=vase&h=150&bd=80&td=100&wt=1.6&...
```

```typescript
// lib/paramEncoding.ts

const PARAM_MAP: Record<string, string> = {
  type: 't',
  height: 'h',
  baseDiameter: 'bd',
  topDiameter: 'td',
  wallThickness: 'wt',
  twistAngle: 'ta',
  ribCount: 'rc',
  // ... short keys for all params
};

export function encodeDesign(params: DesignParams): string {
  // Encode to compact URL-safe string
}

export function decodeDesign(hash: string): DesignParams | null {
  // Decode from URL hash, validate, return defaults for missing params
}
```

### Share Flow
1. User clicks "Share" → URL hash updated with current params
2. URL copied to clipboard with toast confirmation
3. Recipient opens URL → params decoded → editor loads with design
4. No backend needed for basic sharing

---

## 7. Export Implementation

```typescript
// hooks/useExport.ts

export function useExport() {
  const { design } = useDesignStore();
  const { generate } = useGeometryWorker();

  const exportSTL = async () => {
    // Generate at max resolution
    const highResParams = { ...design.params, resolution: 128 };
    const geometry = await generate({ ...design, params: highResParams });
    
    // Serialize to binary STL
    const stlBuffer = serializeSTL(geometry);
    
    // Trigger download
    const blob = new Blob([stlBuffer], { type: 'model/stl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luminaforge-${design.type}-${Date.now()}.stl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { exportSTL, exportOBJ, export3MF };
}
```

---

## 8. Performance Optimization

### Bundle Strategy
- **Dynamic imports** for editor page (not loaded on landing)
- **Web Worker** for geometry generation (separate bundle)
- **Three.js** tree-shaken via `three/examples/jsm` imports
- **JSCAD** imported only in worker bundle

### Rendering Optimization
- **Instanced meshes** for repetitive geometry (grid, pattern elements)
- **LOD** (Level of Detail): Low-poly preview during interaction, high-poly on idle
- **Frustum culling**: Automatic via R3F
- **Geometry disposal**: Explicit `.dispose()` on old geometries when params change

### Target Metrics
| Metric | Target |
|--------|--------|
| Initial page load (landing) | < 1.5s LCP |
| Editor page load | < 3s TTI |
| Interaction to preview update | < 200ms |
| Full geometry regeneration | < 3s |
| STL export | < 2s |
| Memory usage (editor) | < 200MB |

---

## 9. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Unit (generators) | Vitest | 90%+ — geometry functions are pure |
| Unit (store) | Vitest | 80%+ — state transitions |
| Component | React Testing Library | Key interactions (slider, export) |
| Visual | Storybook (optional) | Component gallery for design review |
| E2E | Playwright | Critical paths: load preset → export STL |
| Geometry validation | Custom scripts | Manifold checks on all presets |

### Key Test Cases
- All preset configurations generate valid manifold geometry
- Parameter boundary values don't crash generator
- URL encoding/decoding round-trips perfectly
- Export produces valid STL files (parseable by standard tools)
- Mobile layout renders correctly at all breakpoints
