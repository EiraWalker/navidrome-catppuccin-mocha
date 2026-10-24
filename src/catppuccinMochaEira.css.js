// SPDX-License-Identifier: GPL-3.0-only
import { mocha as p } from './mocha.js'

export default `
.react-jinke-music-player-main .music-player-panel,
.audio-lists-panel {
  background: ${p.mantle};
  color: ${p.text};
  border-top: 1px solid ${p.surface0};
  box-shadow: 0 -4px 24px ${p.crust};
}
.react-jinke-music-player-main .music-player-panel .panel-content,
.audio-lists-panel-content .audio-item {
  color: ${p.text};
}
.react-jinke-music-player-main .player-singer,
.audio-lists-panel-content .player-singer {
  color: ${p.subtext0};
}
.react-jinke-music-player-main svg,
.react-jinke-music-player .music-player-controller {
  color: ${p.subtext1};
}
.react-jinke-music-player-main svg:hover,
.react-jinke-music-player-main svg:active,
.react-jinke-music-player-main .lyric-btn-active,
.react-jinke-music-player-main .lyric-btn-active svg {
  color: ${p.mauve} !important;
}
.react-jinke-music-player-main .rc-slider-rail,
.react-jinke-music-player-mobile-progress .rc-slider-rail {
  background-color: ${p.surface1};
}
.react-jinke-music-player-main .rc-slider-track,
.react-jinke-music-player-main .rc-slider-handle,
.react-jinke-music-player-mobile-progress .rc-slider-track,
.react-jinke-music-player-mobile-progress .rc-slider-handle {
  background-color: ${p.mauve};
  border-color: ${p.mauve};
}
.react-jinke-music-player-main .rc-slider-handle:focus,
.react-jinke-music-player-mobile-progress .rc-slider-handle:focus {
  outline: 2px solid ${p.lavender};
  outline-offset: 3px;
  box-shadow: none;
}
.audio-lists-panel-header {
  color: ${p.text};
  border-bottom: 1px solid ${p.surface0};
  box-shadow: none;
}
.audio-lists-panel-content .audio-item:nth-child(2n+1) {
  background-color: transparent;
}
.audio-lists-panel-content .audio-item:hover {
  background-color: ${p.surface0};
}
.audio-lists-panel-content .audio-item.playing,
.audio-lists-panel-content .audio-item.playing svg,
.audio-lists-panel-content .audio-item.playing .player-singer {
  color: ${p.mauve} !important;
  background-color: ${p.surface0};
}
.react-jinke-music-player-main .music-player-lyric {
  color: ${p.text};
  -webkit-text-stroke: 0.25px ${p.base};
}
.react-jinke-music-player-main ::-webkit-scrollbar-thumb,
.audio-lists-panel ::-webkit-scrollbar-thumb {
  background-color: ${p.surface2};
}
.react-jinke-music-player .music-player-controller {
  background-color: ${p.mantle};
  border: 1px solid ${p.surface0};
}
.react-jinke-music-player-mobile-cover {
  background-color: ${p.base};
  border-color: ${p.surface0};
}
`
