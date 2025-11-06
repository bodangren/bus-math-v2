'use client'

import { useEffect } from 'react'

export interface ResourceBasePathFixerProps {
  selector?: string
  productionBasePath?: string
}

export function ResourceBasePathFixer({
  selector = 'a[href^="/resources/"]',
  productionBasePath = '/Business-Operations'
}: ResourceBasePathFixerProps) {
  useEffect(() => {
    const prefix = process.env.NODE_ENV === 'production' ? productionBasePath : ''
    const anchors = document.querySelectorAll<HTMLAnchorElement>(selector)
    anchors.forEach((anchor) => {
      const original = anchor.getAttribute('href') ?? ''
      if (!original.startsWith(prefix)) {
        anchor.setAttribute('href', `${prefix}${original}`)
      }
    })
  }, [selector, productionBasePath])

  return null
}
