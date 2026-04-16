import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassificationInput } from '@/components/student/answer-inputs/ClassificationInput';
import { classificationFamily } from '@/lib/practice/engine/families/classification';

describe('ClassificationInput', () => {
  const mockOnSubmit = vi.fn();
  const definition = classificationFamily.generate(1, { categorySet: 'account-type', itemCount: 4 });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the problem prompt and item labels', () => {
    render(
      <ClassificationInput
        family={classificationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText(/problem/i)).toBeInTheDocument();
    expect(screen.getByText(/place each account into the correct account-type category/i)).toBeInTheDocument();
    definition.parts.forEach((part) => {
      expect(screen.getByText(part.label)).toBeInTheDocument();
    });
  });

  it('renders category dropdowns for each item', () => {
    render(
      <ClassificationInput
        family={classificationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    definition.parts.forEach((part) => {
      const select = screen.getByTestId(`${part.id}-select`);
      expect(select).toBeInTheDocument();
    });
  });

  it('submits correct answers and calls onSubmit with a practice envelope', async () => {
    render(
      <ClassificationInput
        family={classificationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    for (const part of definition.parts) {
      const select = screen.getByTestId(`${part.id}-select`);
      await userEvent.selectOptions(select, part.targetId);
    }

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    const envelope = mockOnSubmit.mock.calls[0][0];
    expect(envelope.contractVersion).toBe('practice.v1');
    expect(envelope.activityId).toBe(definition.activityId);
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.parts.every((p: { isCorrect: boolean }) => p.isCorrect)).toBe(true);
  });

  it('submits incorrect answers and shows per-item results', async () => {
    render(
      <ClassificationInput
        family={classificationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    for (const part of definition.parts) {
      const wrongCategoryId = definition.categories.find((c) => c.id !== part.targetId)?.id;
      if (wrongCategoryId) {
        const select = screen.getByTestId(`${part.id}-select`);
        await userEvent.selectOptions(select, wrongCategoryId);
      }
    }

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    const envelope = mockOnSubmit.mock.calls[0][0];
    expect(envelope.parts.every((p: { isCorrect: boolean }) => p.isCorrect)).toBe(false);
    expect(screen.getByText(/^incorrect/i)).toBeInTheDocument();
  });

  it('disables submit until all items have a category selection', async () => {
    render(
      <ClassificationInput
        family={classificationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    expect(submitButton).toBeDisabled();

    const firstPart = definition.parts[0];
    const firstSelect = screen.getByTestId(`${firstPart.id}-select`);
    await userEvent.selectOptions(firstSelect, firstPart.targetId);
    expect(submitButton).toBeDisabled();

    for (const part of definition.parts.slice(1)) {
      const select = screen.getByTestId(`${part.id}-select`);
      await userEvent.selectOptions(select, part.targetId);
    }

    expect(submitButton).toBeEnabled();
  });

  it('hides submit button after grading and shows result', async () => {
    render(
      <ClassificationInput
        family={classificationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    for (const part of definition.parts) {
      const select = screen.getByTestId(`${part.id}-select`);
      await userEvent.selectOptions(select, part.targetId);
    }

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(screen.queryByRole('button', { name: /submit answer/i })).not.toBeInTheDocument();
    expect(screen.getByText(/correct!/i)).toBeInTheDocument();
  });

  it('shows category labels in the results', async () => {
    render(
      <ClassificationInput
        family={classificationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    for (const part of definition.parts) {
      const select = screen.getByTestId(`${part.id}-select`);
      await userEvent.selectOptions(select, part.targetId);
    }

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    definition.categories.forEach((category) => {
      expect(screen.getAllByText(category.label).length).toBeGreaterThan(0);
    });
  });
});