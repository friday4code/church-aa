import { ENV } from "@/config/env"

type TitleDefaults = Record<string, string>

class TitleManager {
  private defaults: TitleDefaults = {}

  setDefaults(map: TitleDefaults) {
    this.defaults = { ...this.defaults, ...map }
  }

  getDefault(pathname: string): string | undefined {
    const parts = pathname.split('?')[0].split('/').filter(Boolean)
    for (let i = parts.length; i >= 1; i--) {
      const key = '/' + parts.slice(0, i).join('/')
      if (this.defaults[key]) return this.defaults[key]
    }
    return this.defaults['/']
  }

  format(title: string): string {
    const clean = this.sanitize(title)
    return `${clean} | ${ENV.APP_NAME}`
  }

  sanitize(title: string): string {
    return String(title || '').replace(/<[^>]*>/g, '').trim()
  }

  setTitle(title: string) {
    const next = this.format(title)
    if (typeof document !== 'undefined' && document.title !== next) {
      document.title = next
    }
    // this.current = next
  }

  setTitleForPath(pathname: string) {
    const fallback = this.getDefault(pathname) || 'App'
    this.setTitle(fallback)
  }
}

export const titleManager = new TitleManager()

export function useTitle(title?: string) {
  if (title) titleManager.setTitle(title)
}

