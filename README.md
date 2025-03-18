# color-picker-native

A lightweight, framework-agnostic color picker with support for solid colors and gradients.

## Features

- 🎨 Solid color picker with HSV color space
- 🌈 Linear gradient support
- 🎯 Color presets
- 📱 Mobile-friendly
- 🔄 Recent colors history
- 🎯 Eyedropper tool support
- 🚫 No framework dependencies

## Installation

```bash
npm install color-picker-native
# or
yarn add color-picker-native
```

## Usage

### ES Module

```javascript
import ColorPicker from 'color-picker-native';
import 'color-picker-native/style.css';

// Create a solid color picker
const picker = new ColorPicker('#container', {
  color: '#ff0000',
  onChange: (color) => {
    console.log('Selected color:', color);
  }
});

// Create a gradient picker
const gradientPicker = new ColorPicker('#container', {
  mode: 'gradient',
  onChange: (gradient) => {
    console.log('Selected gradient:', gradient);
  }
});
```

### Browser

```html
<link rel="stylesheet" href="https://unpkg.com/color-picker-native@1.0.1/es/style.css">
<script type="module">
  import ColorPicker from 'https://unpkg.com/color-picker-native@1.0.1/es/ColorPicker.js';
  
  const picker = new ColorPicker('#container', {
    color: '#ff0000'
  });
</script>
```

## API

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| color | string | '#000000' | Initial color value |
| mode | 'solid' \| 'gradient' | 'solid' | Color picker mode |
| onChange | function | null | Callback when color changes |
| presets | string[] | [...] | Array of preset colors |

### Methods

#### setColor(color: string)
Sets the current color value.

#### getColor(): string
Gets the current color value.

#### destroy()
Removes the color picker and cleans up event listeners.

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## License

MIT 