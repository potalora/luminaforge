import type { SocketType } from '@/types/design';

export interface SocketSpec {
  name: string;
  threadDiameter: number;     // mm — major diameter of bulb thread
  mountHoleDiameter: number;  // mm — friction-fit opening in base for socket body
  collarHeight: number;       // mm — height of socket collar above base surface
  lampPipeBore: number;       // mm — M10x1 bore for wire routing
}

// IEC 60061 nominal dimensions with printing clearance
export const SOCKET_SPECS: Record<SocketType, SocketSpec> = {
  E12: {
    name: 'Candelabra',
    threadDiameter: 12,
    mountHoleDiameter: 26,
    collarHeight: 18,
    lampPipeBore: 10.5,
  },
  E14: {
    name: 'Small Edison',
    threadDiameter: 14,
    mountHoleDiameter: 29,
    collarHeight: 20,
    lampPipeBore: 10.5,
  },
  E26: {
    name: 'Standard (US)',
    threadDiameter: 26.22,
    mountHoleDiameter: 40,
    collarHeight: 25,
    lampPipeBore: 10.5,
  },
  E27: {
    name: 'Standard (EU)',
    threadDiameter: 27,
    mountHoleDiameter: 41,
    collarHeight: 25,
    lampPipeBore: 10.5,
  },
} as const;

export interface BulbClearance {
  diameter: number;  // mm — max bulb diameter
  height: number;    // mm — overall bulb height including base
}

export const BULB_CLEARANCES: Record<string, BulbClearance> = {
  A19:  { diameter: 60,  height: 110 },
  A15:  { diameter: 48,  height: 89 },
  ST64: { diameter: 64,  height: 140 },
  B11:  { diameter: 35,  height: 100 },
  G25:  { diameter: 79,  height: 120 },
} as const;

// SPT-1 lamp cord channel dimensions (with clearance)
export const WIRE_CHANNEL = {
  width: 7,    // mm
  depth: 4,    // mm
} as const;

// Connection lip between base and shade
export const CONNECTION_LIP = {
  height: 5,          // mm
  tolerance: 0.3,     // mm gap for friction-fit
  wallThickness: 2,   // mm
} as const;

// Safety: LED bulbs only for 3D printed shades
export const MIN_BULB_CLEARANCE = 15; // mm from bulb surface to shade inner wall

// Base thickness for the solid bottom of the lamp base
export const LAMP_BASE_THICKNESS = 3; // mm
