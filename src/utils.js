// Convert HSVA to RGBA
export function hsvaToRgba({ h, s, v, a }) {
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a
  };
}

// Convert RGBA to HSVA
export function rgbaToHsva({ r, g, b, a }) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, v, a };
}

// Convert Hex to RGBA
export function hexToRgba(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1
  } : null;
}

// Convert RGBA to Hex
export function rgbaToHex({ r, g, b }) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Parse CSS gradient string
export function parseGradient(gradientStr) {
  const match = gradientStr.match(/linear-gradient\((\d+)deg,\s*((?:[^,]+,\s*)*[^)]+)\)/);
  if (!match) return null;

  const angle = parseInt(match[1]);
  const stopsStr = match[2];
  const stopMatches = stopsStr.match(/(#[a-f\d]{6}|#[a-f\d]{3})\s+(\d+)%/g);
  
  if (!stopMatches) return null;

  const stops = stopMatches.map(stop => {
    const [color, position] = stop.trim().split(/\s+/);
    return {
      color: color,
      position: parseInt(position)
    };
  });

  return {
    angle,
    stops
  };
}

// Create CSS gradient string
export function createGradient(angle, stops) {
  const stopStr = stops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');
  return `linear-gradient(${angle}deg, ${stopStr})`;
} 