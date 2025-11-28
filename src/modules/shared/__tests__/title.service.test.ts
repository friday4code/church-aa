import { describe, it, expect } from 'vitest'
import { titleManager } from '../title.service'

describe('TitleManager', () => {
  it('formats and sanitizes titles', () => {
    const s = titleManager.sanitize('<b>Hello</b>')
    expect(s).toBe('Hello')
    const f = titleManager.format('Hello')
    expect(f.includes('Hello')).toBe(true)
  })

  it('resolves default by path hierarchy', () => {
    titleManager.setDefaults({ '/': 'Home', '/admin': 'Admin', '/admin/users': 'Users' })
    const a = titleManager.getDefault('/admin/users/all')
    expect(a).toBe('Users')
    const b = titleManager.getDefault('/admin/unknown')
    expect(b).toBe('Admin')
    const c = titleManager.getDefault('/unknown')
    expect(c).toBe('Home')
  })
})

