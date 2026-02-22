import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParamSection } from '../ParamSection';

describe('ParamSection', () => {
  it('renders title', () => {
    render(
      <ParamSection title="Shape">
        <div>child content</div>
      </ParamSection>
    );
    expect(screen.getByText('Shape')).toBeInTheDocument();
  });

  it('renders children when defaultOpen=true', () => {
    render(
      <ParamSection title="Shape" defaultOpen>
        <div>child content</div>
      </ParamSection>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('hides children when defaultOpen=false', () => {
    render(
      <ParamSection title="Shape" defaultOpen={false}>
        <div>child content</div>
      </ParamSection>
    );
    expect(screen.queryByText('child content')).not.toBeInTheDocument();
  });

  it('clicking header toggles visibility', async () => {
    const user = userEvent.setup();
    render(
      <ParamSection title="Advanced" defaultOpen>
        <div>advanced content</div>
      </ParamSection>
    );
    expect(screen.getByText('advanced content')).toBeInTheDocument();

    await user.click(screen.getByTestId('section-advanced'));
    expect(screen.queryByText('advanced content')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('section-advanced'));
    expect(screen.getByText('advanced content')).toBeInTheDocument();
  });

  it('has correct aria-expanded attribute', async () => {
    const user = userEvent.setup();
    render(
      <ParamSection title="Shape" defaultOpen>
        <div>content</div>
      </ParamSection>
    );
    const button = screen.getByTestId('section-shape');
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
