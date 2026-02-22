import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileShapePicker } from '../ProfileShapePicker';
import { useDesignStore } from '@/store/designStore';
import { DEFAULT_VASE_PARAMS } from '@/types/design';

describe('ProfileShapePicker', () => {
  beforeEach(() => {
    useDesignStore.setState({
      params: { ...DEFAULT_VASE_PARAMS },
    });
  });

  it('renders 6 profile shape buttons', () => {
    render(<ProfileShapePicker />);
    expect(screen.getByTestId('profile-cylinder')).toBeInTheDocument();
    expect(screen.getByTestId('profile-tapered')).toBeInTheDocument();
    expect(screen.getByTestId('profile-bulbous')).toBeInTheDocument();
    expect(screen.getByTestId('profile-flared')).toBeInTheDocument();
    expect(screen.getByTestId('profile-hourglass')).toBeInTheDocument();
    expect(screen.getByTestId('profile-scurve')).toBeInTheDocument();
  });

  it('shows active state on the current profile shape', () => {
    render(<ProfileShapePicker />);
    // Default is 'tapered'
    const taperedBtn = screen.getByTestId('profile-tapered');
    expect(taperedBtn).toHaveAttribute('aria-checked', 'true');

    const cylinderBtn = screen.getByTestId('profile-cylinder');
    expect(cylinderBtn).toHaveAttribute('aria-checked', 'false');
  });

  it('clicking a profile card updates the store', async () => {
    const user = userEvent.setup();
    render(<ProfileShapePicker />);

    await user.click(screen.getByTestId('profile-bulbous'));
    expect(useDesignStore.getState().params.profileShape).toBe('bulbous');
  });

  it('clicking updates active state', async () => {
    const user = userEvent.setup();
    render(<ProfileShapePicker />);

    await user.click(screen.getByTestId('profile-flared'));
    expect(screen.getByTestId('profile-flared')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('profile-tapered')).toHaveAttribute('aria-checked', 'false');
  });

  it('each card contains an SVG element', () => {
    render(<ProfileShapePicker />);
    const picker = screen.getByTestId('profile-shape-picker');
    const svgs = picker.querySelectorAll('svg');
    expect(svgs).toHaveLength(6);
  });

  it('each card has a label', () => {
    render(<ProfileShapePicker />);
    expect(screen.getByText('Cylinder')).toBeInTheDocument();
    expect(screen.getByText('Tapered')).toBeInTheDocument();
    expect(screen.getByText('Bulbous')).toBeInTheDocument();
    expect(screen.getByText('Flared')).toBeInTheDocument();
    expect(screen.getByText('Hourglass')).toBeInTheDocument();
    expect(screen.getByText('S-Curve')).toBeInTheDocument();
  });
});
