import { createTranslate, createTranslateTemplate } from 'src/contexts/i18n'
jest.mock('redux-persist', () => ({
  persistReducer: jest.fn((config, reducers) => reducers),
  persistStore: jest.fn(),
  PersistGate: ({ children }: any) => children,
}))

const en = {
  ok: 'OK',
  sidebar: {
    home: 'Home',
    about:
      'About {{topic}} and {{other}} but first and foremost about {{topic}}',
    menu: {
      login: 'Login',
      share: 'Share',
    },
  },
}

describe('translate function', function () {
  const t = createTranslate(en, false)

  it('key can be a single string', function () {
    expect(t('ok')).toBe('OK')
  })

  it('can handle multiple keys', function () {
    expect(t('sidebar', 'menu', 'login')).toBe('Login')
  })

  it('if the last key is a string[] than join the result by comma', function () {
    expect(t('sidebar', 'menu', ['login', 'share'])).toBe('Login, Share')
  })

  it('returns the last key if translation could not be found', function () {
    expect(t('foo')).toBe('foo')
    expect(t('foo', 'bar', 'baz')).toBe('baz')
    expect(t('foo', ['bar', 'baz'])).toBe('bar, baz')
  })

  it('if the last key is neither string nor string[] return it', function () {
    expect(t(3)).toBe(3)
    expect(t(false)).toBe(false)
    expect(t(null)).toBe(null)
    expect(t('sidebar', 'menu', 3)).toBe(3)
  })

  it('if translation is disabled join all keys and return them', function () {
    const t = createTranslate(en, true)

    expect(t('foo')).toBe('foo')
    expect(t('ok', 'sidebar')).toBe('ok.sidebar')
    expect(t('sidebar', 'menu', 'logout')).toBe('sidebar.menu.logout')
    expect(t(null)).toBe('')
    expect(t('sidebar', null)).toBe('sidebar.')
    expect(t('sidebar', 3)).toBe('sidebar.3')
    expect(t('sidebar', ['foo', 'bar'])).toBe('sidebar.foo,bar')
  })
})

describe('translateTemplate function', function () {
  const tt = createTranslateTemplate(en, false)

  it(`behaves like the simple translation function
    if it does not match a template string`, function () {
    expect(tt({}, 'ok')).toBe('OK')
    expect(tt({}, 'sidebar', 'menu', 'login')).toBe('Login')
  })

  it(`replaces all tags in a template string according to
    the passed map`, function () {
    const fillers = { topic: 'foo', other: 'bar' }
    expect(tt(fillers, 'sidebar', 'about')).toBe(
      'About foo and bar but first and foremost about foo',
    )
  })
})
