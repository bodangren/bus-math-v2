"use client"

import React from 'react'

interface MultilingualSupportProps {
  en: string
  zh: string
  language: 'en' | 'zh'
  className?: string
}

/**
 * MultilingualSupport component
 *
 * Displays content in either English or Chinese based on user preference.
 * This component enables bilingual support throughout the application.
 *
 * @param en - English text content
 * @param zh - Chinese text content
 * @param language - Current language preference
 * @param className - Optional CSS classes
 */
export function MultilingualSupport({ en, zh, language, className = '' }: MultilingualSupportProps) {
  return (
    <span className={className} lang={language === 'en' ? 'en' : 'zh-CN'}>
      {language === 'en' ? en : zh}
    </span>
  )
}
