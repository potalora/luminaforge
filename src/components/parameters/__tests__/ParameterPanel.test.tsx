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

  it('renders style selector', () => {
    render(<ParameterPanel />);
    expect(screen.getByTestId('style-selector')).toBeInTheDocument();
    expect(screen.getByTestId('style-classic')).toBeInTheDocument();
    expect(screen.getByTestId('style-spiral-fin')).toBeInTheDocument();
  });

  it('renders cross-section picker', () => {
    render(<ParameterPanel />);
    expect(screen.getByTestId('cross-section-picker')).toBeInTheDocument();
  });

  it('renders all 12 cross-section shapes', () => {
    render(<ParameterPanel />);
    const shapes = [
      'circle', 'oval', 'squircle', 'superellipse',
      'heart', 'teardrop', 'petal', 'leaf',
      'polygon', 'star', 'gear', 'flower',
    ];
    for (const shape of shapes) {
      expect(screen.getByTestId(`shape-${shape}`)).toBeInTheDocument();
    }
  });

  it('renders main shape parameters including profileCurve', () => {
    render(<ParameterPanel />);
    expect(screen.getByTestId('height-slider')).toBeInTheDocument();
    expect(screen.getByTestId('diameter-slider')).toBeInTheDocument();
    expect(screen.getByTestId('taper-slider')).toBeInTheDocument();
    expect(screen.getByTestId('profileCurve-slider')).toBeInTheDocument();
    expect(screen.getByTestId('twistAngle-slider')).toBeInTheDocument();
  });

  describe('spiral-fin style (default)', () => {
    it('renders fins section with fin params', () => {
      render(<ParameterPanel />);
      expect(screen.getByTestId('finCount-slider')).toBeInTheDocument();
      expect(screen.getByTestId('finHeight-slider')).toBeInTheDocument();
      expect(screen.getByTestId('finWidth-slider')).toBeInTheDocument();
    });

    it('does not render ridge params', () => {
      render(<ParameterPanel />);
      expect(screen.queryByTestId('ridgeCount-slider')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ridgeDepth-slider')).not.toBeInTheDocument();
    });

    it('renders smoothInnerWall toggle in fins section', () => {
      render(<ParameterPanel />);
      expect(screen.getByTestId('smoothInnerWall-true')).toBeInTheDocument();
      expect(screen.getByTestId('smoothInnerWall-false')).toBeInTheDocument();
    });

    it('ridgeProfile hidden in advanced when spiral-fin', async () => {
      const user = userEvent.setup();
      render(<ParameterPanel />);
      await user.click(screen.getByTestId('section-advanced'));
      expect(screen.queryByTestId('ridgeProfile-select')).not.toBeInTheDocument();
    });
  });

  describe('classic style', () => {
    beforeEach(() => {
      useDesignStore.getState().setParam('style', 'classic');
    });

    it('renders ridges section with ridge params', () => {
      render(<ParameterPanel />);
      expect(screen.getByTestId('ridgeCount-slider')).toBeInTheDocument();
      expect(screen.getByTestId('ridgeDepth-slider')).toBeInTheDocument();
    });

    it('renders smoothInnerWall toggle in ridges section', () => {
      render(<ParameterPanel />);
      expect(screen.getByTestId('smoothInnerWall-true')).toBeInTheDocument();
      expect(screen.getByTestId('smoothInnerWall-false')).toBeInTheDocument();
    });

    it('does not render fin params', () => {
      render(<ParameterPanel />);
      expect(screen.queryByTestId('finCount-slider')).not.toBeInTheDocument();
      expect(screen.queryByTestId('finHeight-slider')).not.toBeInTheDocument();
      expect(screen.queryByTestId('finWidth-slider')).not.toBeInTheDocument();
    });
  });

  describe('cross-section sub-params', () => {
    it('no sub-params shown for circle', () => {
      render(<ParameterPanel />);
      expect(screen.queryByTestId('ovalRatio-slider')).not.toBeInTheDocument();
      expect(screen.queryByTestId('polygonSides-slider')).not.toBeInTheDocument();
    });

    it('ovalRatio shown when crossSection is oval', () => {
      useDesignStore.getState().setParam('crossSection', 'oval');
      render(<ParameterPanel />);
      expect(screen.getByTestId('ovalRatio-slider')).toBeInTheDocument();
    });

    it('squircleN shown when crossSection is squircle', () => {
      useDesignStore.getState().setParam('crossSection', 'squircle');
      render(<ParameterPanel />);
      expect(screen.getByTestId('squircleN-slider')).toBeInTheDocument();
    });

    it('superN shown when crossSection is superellipse', () => {
      useDesignStore.getState().setParam('crossSection', 'superellipse');
      render(<ParameterPanel />);
      expect(screen.getByTestId('superN-slider')).toBeInTheDocument();
    });

    it('polygonSides shown when crossSection is polygon', () => {
      useDesignStore.getState().setParam('crossSection', 'polygon');
      render(<ParameterPanel />);
      expect(screen.getByTestId('polygonSides-slider')).toBeInTheDocument();
    });

    it('star params shown when crossSection is star', () => {
      useDesignStore.getState().setParam('crossSection', 'star');
      render(<ParameterPanel />);
      expect(screen.getByTestId('starPoints-slider')).toBeInTheDocument();
      expect(screen.getByTestId('starInnerRatio-slider')).toBeInTheDocument();
    });

    it('gearTeeth shown when crossSection is gear', () => {
      useDesignStore.getState().setParam('crossSection', 'gear');
      render(<ParameterPanel />);
      expect(screen.getByTestId('gearTeeth-slider')).toBeInTheDocument();
    });

    it('petalCount shown when crossSection is flower', () => {
      useDesignStore.getState().setParam('crossSection', 'flower');
      render(<ParameterPanel />);
      expect(screen.getByTestId('petalCount-slider')).toBeInTheDocument();
    });
  });

  describe('advanced section', () => {
    it('collapsed by default', () => {
      render(<ParameterPanel />);
      expect(screen.queryByTestId('wallThickness-slider')).not.toBeInTheDocument();
    });

    it('shows advanced params when expanded', async () => {
      const user = userEvent.setup();
      render(<ParameterPanel />);
      await user.click(screen.getByTestId('section-advanced'));
      expect(screen.getByTestId('wallThickness-slider')).toBeInTheDocument();
      expect(screen.getByTestId('resolution-slider')).toBeInTheDocument();
    });

    it('ridgeProfile shown in advanced for classic style', async () => {
      useDesignStore.getState().setParam('style', 'classic');
      const user = userEvent.setup();
      render(<ParameterPanel />);
      await user.click(screen.getByTestId('section-advanced'));
      expect(screen.getByTestId('ridgeProfile-select')).toBeInTheDocument();
    });
  });

  describe('style switching', () => {
    it('clicking classic switches to ridge params', async () => {
      const user = userEvent.setup();
      render(<ParameterPanel />);

      // Starts with fins (spiral-fin is default)
      expect(screen.getByTestId('finCount-slider')).toBeInTheDocument();

      // Click Classic
      await user.click(screen.getByTestId('style-classic'));

      // Now shows ridges
      expect(screen.getByTestId('ridgeCount-slider')).toBeInTheDocument();
      expect(screen.queryByTestId('finCount-slider')).not.toBeInTheDocument();
    });
  });
});
