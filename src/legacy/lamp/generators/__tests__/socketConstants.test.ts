import { describe, it, expect } from 'vitest';
import {
  SOCKET_SPECS,
  WIRE_CHANNEL,
  CONNECTION_LIP,
  LAMP_BASE_THICKNESS,
  BULB_CLEARANCES,
  MIN_BULB_CLEARANCE,
} from '../socketConstants';
import type { SocketType } from '@/types/design';

describe('SOCKET_SPECS', () => {
  const socketTypes: SocketType[] = ['E12', 'E14', 'E26', 'E27'];

  it('covers all socket types', () => {
    for (const type of socketTypes) {
      expect(SOCKET_SPECS[type]).toBeDefined();
    }
  });

  it.each(socketTypes)('%s has positive threadDiameter', (type) => {
    expect(SOCKET_SPECS[type].threadDiameter).toBeGreaterThan(0);
  });

  it.each(socketTypes)('%s has mountHoleDiameter > threadDiameter', (type) => {
    const spec = SOCKET_SPECS[type];
    expect(spec.mountHoleDiameter).toBeGreaterThan(spec.threadDiameter);
  });

  it.each(socketTypes)('%s has positive collarHeight', (type) => {
    expect(SOCKET_SPECS[type].collarHeight).toBeGreaterThan(0);
  });

  it.each(socketTypes)('%s has positive lampPipeBore', (type) => {
    expect(SOCKET_SPECS[type].lampPipeBore).toBeGreaterThan(0);
  });
});

describe('WIRE_CHANNEL', () => {
  it('has positive width and depth', () => {
    expect(WIRE_CHANNEL.width).toBeGreaterThan(0);
    expect(WIRE_CHANNEL.depth).toBeGreaterThan(0);
  });
});

describe('CONNECTION_LIP', () => {
  it('has positive height, wallThickness, tolerance', () => {
    expect(CONNECTION_LIP.height).toBeGreaterThan(0);
    expect(CONNECTION_LIP.wallThickness).toBeGreaterThan(0);
    expect(CONNECTION_LIP.tolerance).toBeGreaterThan(0);
  });

  it('tolerance is less than wallThickness', () => {
    expect(CONNECTION_LIP.tolerance).toBeLessThan(CONNECTION_LIP.wallThickness);
  });
});

describe('LAMP_BASE_THICKNESS', () => {
  it('is positive', () => {
    expect(LAMP_BASE_THICKNESS).toBeGreaterThan(0);
  });
});

describe('BULB_CLEARANCES', () => {
  it('all bulbs have positive diameter', () => {
    for (const [, spec] of Object.entries(BULB_CLEARANCES)) {
      expect(spec.diameter).toBeGreaterThan(0);
    }
  });
});

describe('MIN_BULB_CLEARANCE', () => {
  it('is positive', () => {
    expect(MIN_BULB_CLEARANCE).toBeGreaterThan(0);
  });
});
