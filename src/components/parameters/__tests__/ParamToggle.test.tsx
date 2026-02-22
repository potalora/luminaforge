import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParamToggle } from '../ParamToggle';
import { useDesignStore } from '@/store/designStore';

describe('ParamToggle', () => {
  beforeEach(() => {
    useDesignStore.setState({
      params: { ...useDesignStore.getState().params, twistDirection: 'ccw' },
    });
  });

  it('renders label', () => {
    render(
      <ParamToggle
        paramKey="twistDirection"
        label="Twist Direction"
        options={[
          { value: 'cw', label: 'CW' },
          { value: 'ccw', label: 'CCW' },
        ]}
      />
    );
    expect(screen.getByText('Twist Direction')).toBeInTheDocument();
  });

  it('renders both options', () => {
    render(
      <ParamToggle
        paramKey="twistDirection"
        label="Twist Direction"
        options={[
          { value: 'cw', label: 'CW' },
          { value: 'ccw', label: 'CCW' },
        ]}
      />
    );
    expect(screen.getByText('CW')).toBeInTheDocument();
    expect(screen.getByText('CCW')).toBeInTheDocument();
  });

  it('active option has aria-checked=true', () => {
    render(
      <ParamToggle
        paramKey="twistDirection"
        label="Twist Direction"
        options={[
          { value: 'cw', label: 'CW' },
          { value: 'ccw', label: 'CCW' },
        ]}
      />
    );
    expect(screen.getByTestId('twistDirection-ccw')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('twistDirection-cw')).toHaveAttribute('aria-checked', 'false');
  });

  it('clicking inactive option updates store', async () => {
    const user = userEvent.setup();
    render(
      <ParamToggle
        paramKey="twistDirection"
        label="Twist Direction"
        options={[
          { value: 'cw', label: 'CW' },
          { value: 'ccw', label: 'CCW' },
        ]}
      />
    );
    await user.click(screen.getByTestId('twistDirection-cw'));
    expect(useDesignStore.getState().params.twistDirection).toBe('cw');
  });

  it('clicking active option keeps same value', async () => {
    const user = userEvent.setup();
    render(
      <ParamToggle
        paramKey="twistDirection"
        label="Twist Direction"
        options={[
          { value: 'cw', label: 'CW' },
          { value: 'ccw', label: 'CCW' },
        ]}
      />
    );
    await user.click(screen.getByTestId('twistDirection-ccw'));
    expect(useDesignStore.getState().params.twistDirection).toBe('ccw');
  });
});
