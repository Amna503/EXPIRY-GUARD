const KEY = 'expiryguard-theme'
export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Storage can be blocked. Fall back to light.
  }
  return 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function toggleTheme() {
  const next: Theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
  applyTheme(next)
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Ignore storage errors. The theme still changes for this visit.
  }
}
