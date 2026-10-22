import { useEffect } from 'react'
import { SITE_NAME } from '../config/site'

/**
 * Sets `document.title` for the current page.
 *
 * @param title - page title; the site name is appended automatically
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME} chat` : `${SITE_NAME} chat – local network messaging`
  }, [title])
}
