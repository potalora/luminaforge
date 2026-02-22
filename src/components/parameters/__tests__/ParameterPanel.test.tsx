import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParameterPanel } from '../ParameterPanel';
import { useDesignStore } from '@/store/designStore';
import { DEFAULT_VASE_PARAMS } from '@/types/design';

describe('ParameterPanel', () => {
  beforeEach(() => {
    useDesignStore.setState({
      objectType: 'vase',
      params: { ...DEFAULT_VASE_PARAMS },
    });
  });

  it('renders LuminaForge heading', () => {
    render(<ParameterPanel />);
    expect(screen.getByText('LuminaForge')).toBeInTheDocument();
  });

  it('renders object type toggle', () => {
    render(<ParameterPanel />);
    expect(screen.getByTestId('object-type-vase')).toBeInTheDocument();
    expect(screen.getByTestId('object-type-lamp')).toBeInTheDocument();
  });

  it('lamp button is disabled', () => {
    render(<ParameterPanel />);
    expect(screen.getByTestId('object-type-lamp')).toBeDisabled();
  });

  it('renders all main parameters', () => {
    render(<ParameterPanel />);
    expect(screen.getByTestId('profileShape-select')).toBeInTheDocument();
    expect(screen.getByTestId('height-slider')).toBeInTheDocument();
    expect(screen.getByTestId('baseDiameter-slider')).toBeInTheDocument();
    expect(screen.getByTestId('topDiameter-slider')).toBeInTheDocument();
    expect(screen.getByTestId('twistAngle-slider')).toBeInTheDocument();
    expect(screen.getByTestId('crossSection-select')).toBeInTheDocument();
  });

  it('advanced section is collapsed by default', () => {
    render(<ParameterPanel />);
    expect(screen.queryByTestId('wallThickness-slider')).not.toBeInTheDocument();
  });

  it('expanding advanced section shows advanced params', async () => {
    const user = userEvent.setup();
    render(<ParameterPanel />);
    await user.click(screen.getByTestId('section-advanced'));
    expect(screen.getByTestId('wallThickness-slider')).toBeInTheDocument();
    expect(screen.getByTestId('resolution-slider')).toBeInTheDocument();
    expect(screen.getByTestId('ribCount-slider')).toBeInTheDocument();
  });

  it('polygon sides hidden when crossSection is circle', async () => {
    const user = userEvent.setup();
    render(<ParameterPanel />);
    await user.click(screen.getByTestId('section-advanced'));
    expect(screen.queryByTestId('polygonSides-slider')).not.toBeInTheDocument();
  });

  it('polygon sides shown when crossSection is polygon', async () => {
    useDesignStore.getState().setParam('crossSection', 'polygon');
    const user = userEvent.setup();
    render(<ParameterPanel />);
    await user.click(screen.getByTestId('section-advanced'));
    expect(screen.getByTestId('polygonSides-slider')).toBeInTheDocument();
  });

  it('star params shown only when crossSection is star', async () => {
    useDesignStore.getState().setParam('crossSection', 'star');
    const user = userEvent.setup();
    render(<ParameterPanel />);
    await user.click(screen.getByTestId('section-advanced'));
    expect(screen.getByTestId('starPoints-slider')).toBeInTheDocument();
    expect(screen.getByTestId('starInnerRatio-slider')).toBeInTheDocument();
  });
});
