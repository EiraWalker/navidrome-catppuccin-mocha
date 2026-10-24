import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('original project license and package metadata consistently declare MIT', async () => {
  const license = await read('LICENSE')
  const packageInfo = JSON.parse(await read('package.json'))
  const themeInfo = JSON.parse(await read('theme.json'))
  assert.match(license, /^MIT License/)
  assert.match(license, /Copyright \(c\) 2026 EiraWalker/)
  assert.match(license, /Permission is hereby granted, free of charge/)
  assert.doesNotMatch(license, /\[year\]|\[fullname\]/)
  assert.equal(packageInfo.license, 'MIT')
  assert.equal(themeInfo.license, 'MIT')
})

test('owned theme modules use MIT headers without changing palette attribution', async () => {
  for (const path of [
    'src/catppuccinMochaEira.js',
    'src/catppuccinMochaEira.css.js',
  ]) {
    assert.match(await read(path), /^\/\/ SPDX-License-Identifier: MIT\r?\n/)
  }
  assert.match(await read('src/mocha.js'), /MIT © Catppuccin/)
  assert.match(
    await read('LICENSES/Catppuccin-MIT.txt'),
    /Copyright \(c\) 2021 Catppuccin/,
  )
})

test('upstream GPL text and combined-binary licensing boundary are preserved', async () => {
  const gpl = (await read('LICENSES/Navidrome-GPL-3.0.txt')).replace(
    /\r\n/g,
    '\n',
  )
  assert.equal(
    createHash('sha256').update(gpl).digest('hex'),
    'c61f12da7cdad526bdcbed47a4c0a603e60dbbfdaf8b66933cd088e9132c303f',
  )
  const notices = await read('THIRD_PARTY_NOTICES.md')
  assert.match(
    notices,
    /combined application continues to be distributed under GPL-3.0/,
  )
  assert.match(notices, /upstream patch context/)
  assert.match(
    await read('README.md'),
    /combined customized Navidrome executable remain GPL-3.0/,
  )
})
