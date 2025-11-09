import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import type { AccessibilityPreferences } from '@/lib/db/schema/profiles';

describe('AccessibilityToolbar', () => {
  const defaultPreferences: AccessibilityPreferences = {
    language: 'en',
    fontSize: 'medium',
    highContrast: false,
    readingLevel: 'intermediate',
    showVocabulary: false,
  };

  it('renders with default preferences', () => {
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    expect(screen.getByRole('toolbar', { name: /accessibility settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to english/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /medium font size/i, pressed: true })).toBeInTheDocument();
  });

  it('calls onPreferencesChange when language is changed', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    const chineseButton = screen.getByRole('button', { name: /switch to chinese/i });
    await user.click(chineseButton);

    expect(mockOnChange).toHaveBeenCalledWith({ language: 'zh' });
  });

  it('calls onPreferencesChange when font size is changed', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    const largeButton = screen.getByRole('button', { name: /large font size/i });
    await user.click(largeButton);

    expect(mockOnChange).toHaveBeenCalledWith({ fontSize: 'large' });
  });

  it('calls onPreferencesChange when high contrast is toggled', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    const contrastButton = screen.getByRole('button', { name: /enable high contrast/i });
    await user.click(contrastButton);

    expect(mockOnChange).toHaveBeenCalledWith({ highContrast: true });
  });

  it('calls onPreferencesChange when reading level is changed', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox', { name: /reading level/i });
    await user.selectOptions(select, 'advanced');

    expect(mockOnChange).toHaveBeenCalledWith({ readingLevel: 'advanced' });
  });

  it('calls onPreferencesChange when vocabulary is toggled', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    const vocabButton = screen.getByRole('button', { name: /show vocabulary/i });
    await user.click(vocabButton);

    expect(mockOnChange).toHaveBeenCalledWith({ showVocabulary: true });
  });

  it('applies high contrast styles when enabled', () => {
    const mockOnChange = vi.fn();
    const highContrastPreferences: AccessibilityPreferences = {
      ...defaultPreferences,
      highContrast: true,
    };

    const { container } = render(
      <AccessibilityToolbar
        preferences={highContrastPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    const card = container.querySelector('.bg-gray-900');
    expect(card).toBeInTheDocument();
  });

  it('displays correct reading level options in English', () => {
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    expect(screen.getByRole('option', { name: 'Basic' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Intermediate' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Advanced' })).toBeInTheDocument();
  });

  it('displays correct reading level options in Chinese', () => {
    const mockOnChange = vi.fn();
    const chinesePreferences: AccessibilityPreferences = {
      ...defaultPreferences,
      language: 'zh',
    };

    render(
      <AccessibilityToolbar
        preferences={chinesePreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    expect(screen.getByRole('option', { name: '基础' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '中级' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '高级' })).toBeInTheDocument();
  });

  it('has correct ARIA attributes for accessibility', () => {
    const mockOnChange = vi.fn();
    render(
      <AccessibilityToolbar
        preferences={defaultPreferences}
        onPreferencesChange={mockOnChange}
      />
    );

    expect(screen.getByRole('group', { name: /language selection/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /font size selection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to english/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
