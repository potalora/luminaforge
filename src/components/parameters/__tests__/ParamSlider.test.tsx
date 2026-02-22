import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParamSlider } from '../ParamSlider';
import { useDesignStore } from '@/store/designStore';

describe('ParamSlider', () => {
  beforeEach(() => {
    useDesignStore.setState({
      params: { ...useDesignStore.getState().params, height: 150 },
    });
  });

  it('renders label and value', () => {
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} unit="mm" />
    );
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByTestId('height-value')).toHaveTextContent('150');
  });

  it('renders unit text', () => {
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} unit="mm" />
    );
    expect(screen.getByTestId('height-value')).toHaveTextContent('mm');
  });

  it('renders slider with correct min/max/step', () => {
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} />
    );
    const slider = screen.getByTestId('height-slider');
    expect(slider).toHaveAttribute('min', '50');
    expect(slider).toHaveAttribute('max', '400');
    expect(slider).toHaveAttribute('step', '1');
  });

  it('slider change updates store', () => {
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} />
    );
    const slider = screen.getByTestId('height-slider');
    fireEvent.change(slider, { target: { value: '200' } });
    expect(useDesignStore.getState().params.height).toBe(200);
  });

  it('clicking value enters edit mode', async () => {
    const user = userEvent.setup();
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} />
    );
    await user.click(screen.getByTestId('height-value'));
    expect(screen.getByTestId('height-edit-input')).toBeInTheDocument();
  });

  it('edit input commits on Enter', async () => {
    const user = userEvent.setup();
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} />
    );
    await user.click(screen.getByTestId('height-value'));
    const input = screen.getByTestId('height-edit-input');
    await user.clear(input);
    await user.type(input, '250{Enter}');
    expect(useDesignStore.getState().params.height).toBe(250);
  });

  it('edit input clamps value to max', async () => {
    const user = userEvent.setup();
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} />
    );
    await user.click(screen.getByTestId('height-value'));
    const input = screen.getByTestId('height-edit-input');
    await user.clear(input);
    await user.type(input, '999{Enter}');
    expect(useDesignStore.getState().params.height).toBe(400);
  });

  it('edit input cancels on Escape', async () => {
    const user = userEvent.setup();
    render(
      <ParamSlider paramKey="height" label="Height" min={50} max={400} step={1} />
    );
    await user.click(screen.getByTestId('height-value'));
    const input = screen.getByTestId('height-edit-input');
    await user.clear(input);
    await user.type(input, '999{Escape}');
    // Value should remain unchanged
    expect(useDesignStore.getState().params.height).toBe(150);
  });

  it('displays decimal values for sub-1 step', () => {
    useDesignStore.setState({
      params: { ...useDesignStore.getState().params, wallThickness: 1.6 },
    });
    render(
      <ParamSlider paramKey="wallThickness" label="Wall Thickness" min={0.8} max={4} step={0.1} unit="mm" />
    );
    expect(screen.getByTestId('wallThickness-value')).toHaveTextContent('1.6');
  });
});
