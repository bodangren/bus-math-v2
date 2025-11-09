import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MultilingualSupport } from './MultilingualSupport';

describe('MultilingualSupport', () => {
  const englishText = 'Hello World';
  const chineseText = '你好世界';

  it('displays English text when language is en', () => {
    render(
      <MultilingualSupport
        en={englishText}
        zh={chineseText}
        language="en"
      />
    );

    expect(screen.getByText(englishText)).toBeInTheDocument();
    expect(screen.queryByText(chineseText)).not.toBeInTheDocument();
  });

  it('displays Chinese text when language is zh', () => {
    render(
      <MultilingualSupport
        en={englishText}
        zh={chineseText}
        language="zh"
      />
    );

    expect(screen.getByText(chineseText)).toBeInTheDocument();
    expect(screen.queryByText(englishText)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MultilingualSupport
        en={englishText}
        zh={chineseText}
        language="en"
        className="custom-class"
      />
    );

    const span = container.querySelector('.custom-class');
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent(englishText);
  });

  it('sets correct lang attribute for English', () => {
    const { container } = render(
      <MultilingualSupport
        en={englishText}
        zh={chineseText}
        language="en"
      />
    );

    const span = container.querySelector('span');
    expect(span).toHaveAttribute('lang', 'en');
  });

  it('sets correct lang attribute for Chinese', () => {
    const { container } = render(
      <MultilingualSupport
        en={englishText}
        zh={chineseText}
        language="zh"
      />
    );

    const span = container.querySelector('span');
    expect(span).toHaveAttribute('lang', 'zh-CN');
  });

  it('handles empty strings', () => {
    render(
      <MultilingualSupport
        en=""
        zh=""
        language="en"
      />
    );

    const span = screen.getByText('', { selector: 'span' });
    expect(span).toBeInTheDocument();
  });

  it('handles special characters in text', () => {
    const specialEnglish = 'Hello & <World>';
    const specialChinese = '你好 & <世界>';

    render(
      <MultilingualSupport
        en={specialEnglish}
        zh={specialChinese}
        language="en"
      />
    );

    expect(screen.getByText(specialEnglish)).toBeInTheDocument();
  });
});
