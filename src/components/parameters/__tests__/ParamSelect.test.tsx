import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParamSelect } from '../ParamSelect';
import { useDesignStore } from '@/store/designStore';

const PROFILE_OPTIONS = [
  { value: 'cylinder', label: 'Cylinder' },
  { value: 'tapered', label: 'Tapered' },
  { value: 'bulbous', label: 'Bulbous' },
  { value: 'flared', label: 'Flared' },
];

describe('ParamSelect', () => {
  beforeEach(() => {
    useDesignStore.setState({
      params: { ...useDesignStore.getState().params, profileShape: 'tapered' },
    });
  });

  it('renders label', () => {
    render(
      <ParamSelect paramKey="profileShape" label="Profile Shape" options={PROFILE_OPTIONS} />
    );
    expect(screen.getByText('Profile Shape')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(
      <ParamSelect paramKey="profileShape" label="Profile Shape" options={PROFILE_OPTIONS} />
    );
    const select = screen.getByTestId('profileShape-select');
    expect(select.querySelectorAll('option')).toHaveLength(4);
  });

  it('shows current value from store', () => {
    render(
      <ParamSelect paramKey="profileShape" label="Profile Shape" options={PROFILE_OPTIONS} />
    );
    expect(screen.getByTestId('profileShape-select')).toHaveValue('tapered');
  });

  it('selection change updates store', () => {
    render(
      <ParamSelect paramKey="profileShape" label="Profile Shape" options={PROFILE_OPTIONS} />
    );
    fireEvent.change(screen.getByTestId('profileShape-select'), {
      target: { value: 'bulbous' },
    });
    expect(useDesignStore.getState().params.profileShape).toBe('bulbous');
  });
});
