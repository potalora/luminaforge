import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParamSelect } from '../ParamSelect';
import { useDesignStore } from '@/store/designStore';

const CROSS_SECTION_OPTIONS = [
  { value: 'circle', label: 'Circle' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'star', label: 'Star' },
];

describe('ParamSelect', () => {
  beforeEach(() => {
    useDesignStore.setState({
      params: { ...useDesignStore.getState().params, crossSection: 'circle' },
    });
  });

  it('renders label', () => {
    render(
      <ParamSelect paramKey="crossSection" label="Cross Section" options={CROSS_SECTION_OPTIONS} />
    );
    expect(screen.getByText('Cross Section')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(
      <ParamSelect paramKey="crossSection" label="Cross Section" options={CROSS_SECTION_OPTIONS} />
    );
    const select = screen.getByTestId('crossSection-select');
    expect(select.querySelectorAll('option')).toHaveLength(3);
  });

  it('shows current value from store', () => {
    render(
      <ParamSelect paramKey="crossSection" label="Cross Section" options={CROSS_SECTION_OPTIONS} />
    );
    expect(screen.getByTestId('crossSection-select')).toHaveValue('circle');
  });

  it('selection change updates store', () => {
    render(
      <ParamSelect paramKey="crossSection" label="Cross Section" options={CROSS_SECTION_OPTIONS} />
    );
    fireEvent.change(screen.getByTestId('crossSection-select'), {
      target: { value: 'polygon' },
    });
    expect(useDesignStore.getState().params.crossSection).toBe('polygon');
  });
});
