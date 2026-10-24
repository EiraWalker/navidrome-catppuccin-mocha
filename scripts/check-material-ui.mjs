import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import theme from '../src/catppuccinMochaEira.js'
import { mocha as p } from '../src/mocha.js'

const require = createRequire(
  fileURLToPath(
    new URL('../.build/navidrome/ui/package.json', import.meta.url),
  ),
)
const styles = require('@material-ui/core/styles')
const errors = []
const original = console.error
console.error = (...args) => errors.push(args.join(' '))
let normalized
try {
  normalized = (styles.createTheme || styles.createMuiTheme)(theme)
} finally {
  console.error = original
}
assert.deepEqual(
  errors,
  [],
  'Material-UI must accept the complete theme without invalid override/state rules',
)
assert.equal(normalized.palette.primary.main, p.mauve)
assert.equal(normalized.palette.primary.contrastText, p.crust)
assert.equal(normalized.palette.background.default, p.base)
assert.equal(
  normalized.overrides.MuiFormHelperText.root['&$error'].color,
  p.red,
)
console.log('Material-UI 4 runtime normalization passed without theme warnings')
