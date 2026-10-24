import { writeFile, mkdir } from 'node:fs/promises'
import { mocha as p } from '../src/mocha.js'

const accents = [
  'rosewater',
  'flamingo',
  'pink',
  'mauve',
  'red',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'blue',
  'lavender',
]
const surfaces = [
  'crust',
  'mantle',
  'base',
  'surface0',
  'surface1',
  'surface2',
  'text',
  'subtext0',
]
const swatches = (colors, top, width) =>
  colors
    .map(
      (name, i) =>
        `<g transform="translate(${40 + i * width},${top})"><rect width="${width - 10}" height="54" rx="8" fill="${p[name]}"/><text x="0" y="76" fill="${p.subtext1}" font-size="13">${name}</text></g>`,
    )
    .join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="450" viewBox="0 0 1120 450" role="img" aria-label="Catppuccin Mocha Eira color palette for Navidrome">
<rect width="1120" height="450" rx="20" fill="${p.base}"/>
<text x="40" y="64" fill="${p.text}" font-family="system-ui,sans-serif" font-size="30" font-weight="650">Catppuccin Mocha Eira</text>
<text x="40" y="96" fill="${p.subtext0}" font-family="system-ui,sans-serif" font-size="16">A soft, complete dark theme for Navidrome · Mauve accent · Mocha surfaces</text>
<g font-family="system-ui,sans-serif">${swatches(accents, 136, 87)}${swatches(surfaces, 256, 130)}</g>
<rect x="40" y="374" width="190" height="42" rx="8" fill="${p.mauve}"/>
<text x="72" y="401" fill="${p.crust}" font-family="system-ui,sans-serif" font-size="16" font-weight="600">Play something good</text>
<text x="258" y="400" fill="${p.subtext1}" font-family="system-ui,sans-serif" font-size="14">Canonical Catppuccin palette · No external fonts or trackers</text>
</svg>`
await mkdir(new URL('../assets/', import.meta.url), { recursive: true })
await writeFile(new URL('../assets/palette.svg', import.meta.url), svg)
console.log('Generated assets/palette.svg from src/mocha.js')
