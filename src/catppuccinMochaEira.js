// SPDX-License-Identifier: GPL-3.0-only
// Copyright 2026 EiraWalker
import { mocha as p } from './mocha.js'
import stylesheet from './catppuccinMochaEira.css.js'

export default {
  themeName: 'Catppuccin Mocha Eira',
  palette: {
    type: 'dark',
    primary: { main: p.mauve, contrastText: p.crust },
    secondary: { main: p.blue, contrastText: p.crust },
    error: { main: p.red, contrastText: p.crust },
    warning: { main: p.peach, contrastText: p.crust },
    info: { main: p.sky, contrastText: p.crust },
    success: { main: p.green, contrastText: p.crust },
    background: { default: p.base, paper: p.mantle },
    text: { primary: p.text, secondary: p.subtext1, disabled: p.overlay1 },
    divider: p.surface0,
    action: {
      active: p.subtext1,
      hover: p.surface0,
      selected: p.surface1,
      disabled: p.overlay0,
      disabledBackground: p.surface0,
    },
  },
  shape: { borderRadius: 8 },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: { backgroundColor: p.base, color: p.text },
        '::selection': { backgroundColor: p.surface2, color: p.text },
        ':focus-visible': { outline: `2px solid ${p.mauve}`, outlineOffset: 3 },
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-track': { backgroundColor: p.mantle },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: p.surface2,
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: { colorPrimary: { backgroundColor: p.mantle, color: p.text } },
    MuiDrawer: { paper: { backgroundColor: p.crust, color: p.text } },
    MuiPaper: { root: { backgroundColor: p.mantle, color: p.text } },
    MuiCard: { root: { border: `1px solid ${p.surface0}` } },
    MuiButton: {
      root: { textTransform: 'none' },
      textPrimary: { color: p.mauve },
      textSecondary: { color: p.blue },
      containedPrimary: {
        backgroundColor: p.mauve,
        color: p.crust,
        '&:hover': { backgroundColor: p.lavender },
      },
      outlinedPrimary: { borderColor: p.mauve },
    },
    MuiIconButton: { root: { color: p.subtext1 } },
    MuiLink: { root: { color: p.blue } },
    MuiInputBase: { root: { color: p.text } },
    MuiInput: { underline: { '&:before': { borderBottomColor: p.surface2 } } },
    MuiInputLabel: { root: { color: p.subtext0 } },
    MuiOutlinedInput: {
      root: { '&:hover $notchedOutline': { borderColor: p.overlay2 } },
      notchedOutline: { borderColor: p.surface2 },
    },
    MuiFormHelperText: {
      root: { color: p.subtext0, '&$error': { color: p.red } },
    },
    MuiChip: {
      root: { backgroundColor: p.surface0, color: p.text },
      clickable: { '&:hover': { backgroundColor: p.surface1 } },
    },
    MuiTableHead: { root: { backgroundColor: p.mantle } },
    MuiTableCell: {
      root: { color: p.text, borderBottomColor: p.surface0 },
      head: { color: p.subtext1, backgroundColor: p.mantle },
    },
    MuiTableRow: {
      root: {
        '&$hover:hover': { backgroundColor: p.surface0 },
        '&$selected': { backgroundColor: p.surface1 },
        '&$selected:hover': { backgroundColor: p.surface1 },
      },
    },
    MuiMenuItem: {
      root: {
        '&$selected': { backgroundColor: p.surface0, color: p.mauve },
        '&$selected:hover': { backgroundColor: p.surface1 },
      },
    },
    MuiSnackbarContent: {
      root: { color: p.text, backgroundColor: p.surface0 },
    },
    MuiAlert: {
      standardError: { color: p.red, backgroundColor: p.surface0 },
      standardSuccess: { color: p.green, backgroundColor: p.surface0 },
      standardWarning: { color: p.peach, backgroundColor: p.surface0 },
      standardInfo: { color: p.sky, backgroundColor: p.surface0 },
    },
    MuiTooltip: { tooltip: { color: p.text, backgroundColor: p.surface0 } },
    MuiTabs: { indicator: { backgroundColor: p.mauve } },
    MuiDivider: { root: { backgroundColor: p.surface0 } },
    NDLogin: {
      main: {
        background: `radial-gradient(ellipse at top right, ${p.surface0} 0%, ${p.base} 48%, ${p.crust} 100%)`,
      },
      card: { backgroundColor: p.mantle, border: `1px solid ${p.surface0}` },
      systemName: { color: p.mauve },
      systemNameLink: { color: p.mauve },
      welcome: { color: p.subtext1 },
      message: { color: p.subtext0 },
      button: { boxShadow: 'none' },
    },
  },
  player: { theme: 'dark', stylesheet },
}
