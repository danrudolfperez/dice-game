// Central design token file.
// Edit here to update colors/fonts across both the React UI and the Phaser canvas.

export const theme = {
  font: {
    serif: "'Playfair Display', Georgia, serif",
  },

  colors: {
    // Layout backgrounds (also exposed as Tailwind utilities via @theme in index.css)
    pageBg: '#0f0f0f',
    panelBg: '#16213e',
    canvasBg: '#1a1a2e',

    // Text / accent
    accentText: '#a78bfa',   // violet-300 — result text, loading label
    diceLabel: '#1a1a2e',    // dark bg color — number printed on face
  },

  dice: {
    shadow: { color: 0x000000, alpha: 0.35 },

    // Face fill + stroke — listed top → bottom for painter's algorithm order
    top:    { fill: 0xf5f0ff, stroke: 0x9d6ff0 },
    front:  { fill: 0xd4b8f0, stroke: 0x7c3aed },
    left:   { fill: 0x9d78d8, stroke: 0x5c1acd },
    right:  { fill: 0xb898e4, stroke: 0x6c2ad8 },
    back:   { fill: 0x7060b0, stroke: 0x4c1aad },
    bottom: { fill: 0x5a4a98, stroke: 0x3c0a8d },
  },
} as const
