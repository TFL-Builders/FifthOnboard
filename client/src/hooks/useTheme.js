import { useEffect } from 'react'
import useAuthStore from '../stores/authStore'

/**
 * Resolves and applies the active colour scheme to <html data-theme="…">.
 *
 * Priority order:
 *  1. user.theme === 'dark' | 'light'  →  honour the explicit DB preference
 *  2. user.theme === null / undefined   →  fall back to prefers-color-scheme
 *
 * When running in browser-detection mode a MediaQueryList listener keeps the
 * theme in sync if the user changes their OS setting while the tab is open.
 */
export function useTheme() {
  const userTheme = useAuthStore((s) => s.user?.theme)

  useEffect(() => {
    const html = document.documentElement

    if (userTheme === 'dark' || userTheme === 'light') {
      html.setAttribute('data-theme', userTheme)
      return
    }

    // Null / undefined — use OS preference
    function applySystem() {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }

    applySystem()

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', applySystem)
    return () => mq.removeEventListener('change', applySystem)
  }, [userTheme])
}
