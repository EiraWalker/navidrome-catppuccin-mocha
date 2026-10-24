import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import theme from '../src/catppuccinMochaEira.js'
import stylesheet from '../src/catppuccinMochaEira.css.js'
import { mocha as p } from '../src/mocha.js'

const luminance = (hex) => {
  const rgb = hex
    .match(/[0-9a-f]{2}/gi)
    .map((value) => parseInt(value, 16) / 255)
  const linear = rgb.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  )
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}
const contrast = (a, b) => {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

test('palette contains the complete canonical Mocha colors', () => {
  assert.equal(Object.keys(p).length, 26)
  assert.equal(p.base, '#1e1e2e')
  assert.equal(p.mauve, '#cba6f7')
  for (const value of Object.values(p)) assert.match(value, /^#[0-9a-f]{6}$/)
  assert.ok(Object.isFrozen(p))
})

test('theme has a distinct, resolvable Navidrome identity', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../theme.json', import.meta.url)),
  )
  assert.equal(theme.themeName, manifest.defaultTheme)
  assert.equal(manifest.id, 'CatppuccinMochaEiraTheme')
  assert.notEqual(theme.themeName, 'Catppuccin Mocha')
  assert.equal(theme.palette.type, 'dark')
})

test('main text, links and button labels meet WCAG AA contrast', () => {
  for (const [label, foreground, background] of [
    ['body', p.text, p.base],
    ['paper', p.text, p.mantle],
    ['secondary text', p.subtext1, p.mantle],
    ['helper text', p.subtext0, p.mantle],
    ['links', p.blue, p.mantle],
    ['accent button', p.crust, p.mauve],
    ['error', p.red, p.surface0],
    ['success', p.green, p.surface0],
  ])
    assert.ok(contrast(foreground, background) >= 4.5, label)
})

test('surfaces and semantic states use palette tokens consistently', () => {
  assert.equal(theme.palette.background.default, p.base)
  assert.equal(theme.palette.background.paper, p.mantle)
  assert.equal(theme.overrides.MuiTableCell.head.backgroundColor, p.mantle)
  assert.equal(
    theme.overrides.MuiSnackbarContent.root.backgroundColor,
    p.surface0,
  )
  assert.equal(theme.overrides.MuiFormHelperText.root['&$error'].color, p.red)
  assert.equal(theme.palette.primary.contrastText, p.crust)
})

test('login theme overrides real NDLogin style slots, without external assets', () => {
  assert.match(theme.overrides.NDLogin.main.background, /radial-gradient/)
  assert.equal(theme.overrides.NDLogin.card.backgroundColor, p.mantle)
  assert.doesNotMatch(theme.overrides.NDLogin.main.background, /url\(/)
})

test('desktop and mobile players share mauve controls and focus affordances', () => {
  assert.equal(theme.player.theme, 'dark')
  assert.equal(theme.player.stylesheet, stylesheet)
  assert.match(stylesheet, /react-jinke-music-player-mobile-progress/)
  assert.match(stylesheet, /outline: 2px solid/)
  assert.match(stylesheet, /#cba6f7/)
  assert.doesNotMatch(stylesheet, /@import|url\(|<script|javascript:/i)
})

test('all emitted hex colors belong to the canonical palette', () => {
  const colors = JSON.stringify(theme).match(/#[0-9a-f]{6}/gi) || []
  const allowed = new Set(Object.values(p))
  for (const color of colors) assert.ok(allowed.has(color), color)
})

test('keep upstream layout invariants for responsive cover and playlist views', () => {
  assert.equal(theme.overrides.NDPlaylistDetails?.details?.minWidth, undefined)
  assert.equal(
    theme.overrides.NDAlbumGridView?.albumContainer?.['& img']?.borderRadius,
    undefined,
  )
})
