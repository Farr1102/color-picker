import { hsvaToRgba, rgbaToHex, hexToRgba, rgbaToHsva, createGradient, parseGradient } from './utils.js';

class ColorPicker {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      color: '#000000',
      mode: 'solid',
      onChange: null,
      presets: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'],
      gradientPresets: [
        'linear-gradient(90deg, #ff0000 0%, #00ff00 100%)',
        'linear-gradient(90deg, #0000ff 0%, #ff0000 100%)',
        'linear-gradient(90deg, #00ff00 0%, #0000ff 100%)'
      ],
      ...options
    };

    this.currentColor = this.options.color;
    this.hsva = { h: 0, s: 0, v: 0, a: 1 };
    this.recentColors = [];
    this.recentGradients = [];
    this.currentMode = this.options.mode;
    this.eyeDropperStatus = false;
    
    if (this.currentMode === 'gradient') {
      this.gradientStops = [
        { position: 0, color: '#ffffff' },
        { position: 100, color: '#000000' }
      ];
      this.selectedStopIndex = 0;
      this.gradientAngle = 90;
      this.isDraggingStop = false;
    }

    this.init();
  }

  init() {
    this.createElements();
    this.attachEvents();
    this.updateUI();
  }

  updateUI() {
    const rgba = hexToRgba(this.currentColor);
    if (rgba) {
      this.hsva = rgbaToHsva(rgba);
      this.updateCursors();
      this.updateColorPreview();
      this.updatePaletteBackground();
    }
    if (this.currentMode === 'gradient') {
      this.updateGradient();
    }
  }

  updateCursors() {
    if (this.elements.cursor && this.elements.hueCursor) {
      this.elements.cursor.style.left = `${this.hsva.s * 100}%`;
      this.elements.cursor.style.top = `${(1 - this.hsva.v) * 100}%`;
      this.elements.hueCursor.style.left = `${this.hsva.h * 100}%`;
    }
  }

  updateColorPreview() {
    if (this.elements.colorView && this.elements.colorInput) {
      this.elements.colorView.style.backgroundColor = this.currentColor;
      this.elements.colorInput.value = this.currentColor;
    }
  }

  updatePaletteBackground() {
    if (this.elements.palette) {
      const hueColor = hsvaToRgba({ h: this.hsva.h, s: 1, v: 1, a: 1 });
      this.elements.palette.style.backgroundColor = rgbaToHex(hueColor);
    }
  }

  createElements() {
    this.container.innerHTML = `
      <div class="color-picker">
        ${this.createModeSelector()}
        ${this.createColorInput()}
        ${this.currentMode === 'solid' ? this.createSolidPicker() : this.createGradientPicker()}
        ${this.createPresets()}
      </div>
    `;

    // Cache DOM elements
    this.elements = {
      palette: this.container.querySelector('.cp-palette'),
      cursor: this.container.querySelector('.cp-cursor'),
      hue: this.container.querySelector('.cp-hue'),
      hueCursor: this.container.querySelector('.cp-hue-cursor'),
      colorView: this.container.querySelector('.cp-color-view'),
      colorInput: this.container.querySelector('.cp-color-value'),
      presetColors: this.container.querySelector('.cp-preset-colors'),
      modeTabs: this.container.querySelectorAll('.cp-tab'),
      eyedropper: this.container.querySelector('.cp-eyedropper')
    };

    if (this.currentMode === 'gradient') {
      this.elements.gradientBar = this.container.querySelector('.cp-gradient-bar');
      this.elements.gradientAngleInput = this.container.querySelector('.cp-angle-input');
      this.elements.gradientStops = this.container.querySelectorAll('.cp-gradient-stop');
      this.elements.gradientBarBg = this.container.querySelector('.cp-gradient-bar-bg');
    }
  }

  createModeSelector() {
    return `
      <div class="cp-tabs">
        <div class="cp-tab ${this.currentMode === 'solid' ? 'active' : ''}" data-mode="solid">纯色</div>
        <div class="cp-tab ${this.currentMode === 'gradient' ? 'active' : ''}" data-mode="gradient">渐变</div>
      </div>
    `;
  }

  createColorInput() {
    return `
      <div class="cp-color-input">
        <div class="cp-color-view" style="background-color: ${this.currentColor}"></div>
        <div class="cp-color-text">HEX</div>
        <input type="text" class="cp-color-value" value="${this.currentColor}" />
        <button class="cp-eyedropper" title="颜色吸管">
          <svg class="cp-eyedropper-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2L2 12l4.5 4.5L12 12l4.5 4.5L21 12l-9-10z"/>
          </svg>
        </button>
      </div>
    `;
  }

  createSolidPicker() {
    const hueColor = hsvaToRgba({ h: this.hsva.h, s: 1, v: 1, a: 1 });
    return `
      <div class="cp-solid">
        <div class="cp-palette" style="background-color: ${rgbaToHex(hueColor)}">
          <div class="cp-white"></div>
          <div class="cp-black"></div>
          <div class="cp-cursor" style="left: ${this.hsva.s * 100}%; top: ${(1 - this.hsva.v) * 100}%"></div>
        </div>
        <div class="cp-hue">
          <div class="cp-hue-cursor" style="left: ${this.hsva.h * 100}%">
            <div class="circle"></div>
          </div>
        </div>
      </div>
    `;
  }

  createGradientPicker() {
    const hueColor = hsvaToRgba({ h: this.hsva.h, s: 1, v: 1, a: 1 });
    return `
      <div class="cp-gradient">
        <div class="cp-gradient-type-controls">
          <div class="cp-gradient-angle">
            <span>渐变方向:</span>
            <input type="number" class="cp-angle-input" min="0" max="360" value="${this.gradientAngle}" />
            <span>°</span>
          </div>
        </div>
        <div class="cp-gradient-bar">
          <div class="cp-gradient-bar-bg" style="background: ${this.getCurrentGradient()}"></div>
          ${this.gradientStops.map((stop, index) => `
            <div class="cp-gradient-stop ${index === this.selectedStopIndex ? 'active' : ''}"
                 style="left: ${stop.position}%">
              <div class="cp-gradient-stop-color" style="background-color: ${stop.color}"></div>
            </div>
          `).join('')}
        </div>
        <div class="cp-gradient-controls">
          <div class="cp-gradient-stop-panel">
            <div class="cp-palette" style="background-color: ${rgbaToHex(hueColor)}">
              <div class="cp-white"></div>
              <div class="cp-black"></div>
              <div class="cp-cursor" style="left: ${this.hsva.s * 100}%; top: ${(1 - this.hsva.v) * 100}%"></div>
            </div>
            <div class="cp-hue">
              <div class="cp-hue-cursor" style="left: ${this.hsva.h * 100}%">
                <div class="circle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createPresets() {
    const presets = this.currentMode === 'gradient' ? this.options.gradientPresets : this.options.presets;
    const recentColors = this.currentMode === 'gradient' ? this.recentGradients : this.recentColors;
    
    return `
      <div class="cp-presets">
        <div class="cp-preset-label">预设${this.currentMode === 'gradient' ? '渐变' : '颜色'}:</div>
        <div class="cp-preset-colors">
          ${presets.map(preset => `
            <div class="cp-preset-color" style="background: ${preset}"></div>
          `).join('')}
        </div>
      </div>
      ${recentColors.length ? `
        <div class="cp-recent">
          <div class="cp-preset-label">最近使用:</div>
          <div class="cp-preset-colors">
            ${recentColors.map(color => `
              <div class="cp-preset-color" style="background: ${color}"></div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  attachEvents() {
    // Mode tabs events
    this.elements.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.setMode(tab.dataset.mode);
      });
    });

    // Palette events
    if (this.elements.palette) {
      this.elements.palette.addEventListener('mousedown', (e) => {
        this.handlePaletteMouseDown(e);
      });
    }
    
    // Hue slider events
    if (this.elements.hue) {
      this.elements.hue.addEventListener('mousedown', (e) => {
        this.handleHueMouseDown(e);
      });
    }
    
    // Color input events
    if (this.elements.colorInput) {
      this.elements.colorInput.addEventListener('change', (e) => {
        this.handleColorInput(e);
      });
    }

    // Eyedropper events
    if ('EyeDropper' in window && this.elements.eyedropper) {
      this.elements.eyedropper.addEventListener('click', () => {
        this.activateEyedropper();
      });
    } else if (this.elements.eyedropper) {
      this.elements.eyedropper.style.display = 'none';
    }

    // Gradient specific events
    if (this.currentMode === 'gradient') {
      if (this.elements.gradientBar) {
        this.elements.gradientBar.addEventListener('click', (e) => {
          this.addGradientStop(e);
        });
      }
      if (this.elements.gradientAngleInput) {
        this.elements.gradientAngleInput.addEventListener('change', (e) => {
          this.handleGradientAngleChange(e);
        });
      }
      if (this.elements.gradientStops) {
        this.elements.gradientStops.forEach((stop, index) => {
          stop.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.startDraggingStop(index, e);
          });
          stop.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectStop(index);
          });
        });
      }
    }

    // Global mouse events
    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
    document.addEventListener('mouseup', () => {
      this.handleMouseUp();
    });

    // Preset colors events
    const presetElements = this.container.querySelectorAll('.cp-preset-colors .cp-preset-color');
    presetElements.forEach((preset, index) => {
      preset.addEventListener('click', () => {
        const isInRecentSection = preset.closest('.cp-recent') !== null;
        const collection = isInRecentSection ? 
          (this.currentMode === 'gradient' ? this.recentGradients : this.recentColors) :
          (this.currentMode === 'gradient' ? this.options.gradientPresets : this.options.presets);
        
        const colorIndex = Array.from(preset.parentElement.children).indexOf(preset);
        if (this.currentMode === 'gradient') {
          this.setGradient(collection[colorIndex]);
        } else {
          this.setColor(collection[colorIndex]);
        }
      });
    });
  }

  handlePaletteMouseDown(e) {
    this.isPaletteMoving = true;
    this.updatePaletteColor(e);
  }

  handleHueMouseDown(e) {
    this.isHueMoving = true;
    this.updateHue(e);
  }

  handleMouseMove(e) {
    if (this.isPaletteMoving) {
      this.updatePaletteColor(e);
    }
    if (this.isHueMoving) {
      this.updateHue(e);
    }
    if (this.isDraggingStop) {
      this.updateGradientStopPosition(e);
    }
  }

  handleMouseUp() {
    this.isPaletteMoving = false;
    this.isHueMoving = false;
    if (this.isDraggingStop) {
      this.isDraggingStop = false;
      this.updateGradient();
    }
  }

  updatePaletteColor(e) {
    if (!this.elements.palette) return;
    
    const rect = this.elements.palette.getBoundingClientRect();
    let s = (e.clientX - rect.left) / rect.width;
    let v = 1 - (e.clientY - rect.top) / rect.height;
    
    s = Math.max(0, Math.min(1, s));
    v = Math.max(0, Math.min(1, v));
    
    this.hsva.s = s;
    this.hsva.v = v;
    this.updateColor();
  }

  updateHue(e) {
    if (!this.elements.hue) return;
    
    const rect = this.elements.hue.getBoundingClientRect();
    let h = (e.clientX - rect.left) / rect.width;
    h = Math.max(0, Math.min(1, h));
    this.hsva.h = h;
    this.updateColor();
  }

  handleColorInput(e) {
    this.setColor(e.target.value);
  }

  async activateEyedropper() {
    if (!('EyeDropper' in window)) return;
    
    try {
      this.eyeDropperStatus = true;
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      this.setColor(result.sRGBHex);
    } catch (e) {
      console.error('EyeDropper error:', e);
    } finally {
      this.eyeDropperStatus = false;
    }
  }

  setColor(color) {
    if (color.startsWith('#')) {
      const rgba = hexToRgba(color);
      if (rgba) {
        this.hsva = rgbaToHsva(rgba);
        if (this.currentMode === 'gradient' && this.selectedStopIndex !== null) {
          this.gradientStops[this.selectedStopIndex].color = color;
          this.updateGradient();
        }
        this.updateColor();
      }
    }
  }

  updateColor() {
    const rgba = hsvaToRgba(this.hsva);
    this.currentColor = rgbaToHex(rgba);
    
    // 更新调色板背景色
    const hueColor = hsvaToRgba({ h: this.hsva.h, s: 1, v: 1, a: 1 });
    const hueHex = rgbaToHex(hueColor);
    
    if (this.elements.palette) {
      this.elements.palette.style.backgroundColor = hueHex;
    }
    
    // 更新光标位置
    if (this.elements.cursor && this.elements.hueCursor) {
      this.elements.cursor.style.left = `${this.hsva.s * 100}%`;
      this.elements.cursor.style.top = `${(1 - this.hsva.v) * 100}%`;
      this.elements.hueCursor.style.left = `${this.hsva.h * 100}%`;
    }
    
    // 更新颜色预览
    if (this.elements.colorView && this.elements.colorInput) {
      this.elements.colorView.style.backgroundColor = this.currentColor;
      this.elements.colorInput.value = this.currentColor;
    }
    
    // 更新渐变
    if (this.currentMode === 'gradient' && this.selectedStopIndex !== null && this.gradientStops) {
      this.gradientStops[this.selectedStopIndex].color = this.currentColor;
      this.updateGradient();
    }
    
    // 触发onChange回调
    if (this.options.onChange) {
      const currentValue = this.currentMode === 'gradient' ? this.getCurrentGradient() : this.currentColor;
      this.options.onChange(currentValue);

      // 更新最近使用的颜色
      if (this.currentMode === 'gradient') {
        if (!this.recentGradients.includes(currentValue)) {
          this.recentGradients.unshift(currentValue);
          if (this.recentGradients.length > 8) {
            this.recentGradients.pop();
          }
          this.createElements();
          this.attachEvents();
        }
      } else {
        if (!this.recentColors.includes(this.currentColor)) {
          this.recentColors.unshift(this.currentColor);
          if (this.recentColors.length > 8) {
            this.recentColors.pop();
          }
          this.createElements();
          this.attachEvents();
        }
      }
    }
  }

  setMode(mode) {
    if (mode === this.currentMode) return;
    
    this.currentMode = mode;
    if (mode === 'gradient' && (!this.gradientStops || !this.gradientStops.length)) {
      this.gradientStops = [
        { position: 0, color: this.currentColor },
        { position: 100, color: '#ffffff' }
      ];
      this.selectedStopIndex = 0;
      this.gradientAngle = 90;
    }
    this.init();
  }

  setGradient(gradientStr) {
    const gradient = parseGradient(gradientStr);
    if (gradient) {
      this.gradientAngle = gradient.angle;
      this.gradientStops = [...gradient.stops]; // 创建一个新的数组副本
      this.selectedStopIndex = 0;
      
      // 设置当前颜色为第一个停靠点的颜色
      const firstStopColor = this.gradientStops[0].color;
      const rgba = hexToRgba(firstStopColor);
      if (rgba) {
        this.hsva = rgbaToHsva(rgba);
        this.currentColor = firstStopColor;
      }

      // 重新创建元素以更新UI
      this.createElements();
      this.attachEvents();
      this.updateGradient();

      // 添加到最近使用的渐变中
      const currentGradient = this.getCurrentGradient();
      if (!this.recentGradients.includes(currentGradient)) {
        this.recentGradients.unshift(currentGradient);
        if (this.recentGradients.length > 8) {
          this.recentGradients.pop();
        }
      }
    }
  }

  addGradientStop(e) {
    if (!this.elements.gradientBar) return;
    
    const rect = this.elements.gradientBar.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    
    this.gradientStops.push({
      position: Math.max(0, Math.min(100, position)),
      color: this.currentColor
    });
    
    this.gradientStops.sort((a, b) => a.position - b.position);
    this.selectedStopIndex = this.gradientStops.findIndex(stop => 
      stop.position === Math.max(0, Math.min(100, position))
    );
    
    this.init();
  }

  startDraggingStop(index, e) {
    this.isDraggingStop = true;
    this.selectedStopIndex = index;
    this.updateGradientStopPosition(e);
  }

  selectStop(index) {
    this.selectedStopIndex = index;
    const color = this.gradientStops[index].color;
    const rgba = hexToRgba(color);
    if (rgba) {
      this.hsva = rgbaToHsva(rgba);
      this.updateColor();
    }
  }

  updateGradientStopPosition(e) {
    if (!this.isDraggingStop || this.selectedStopIndex === null || !this.elements.gradientBar) return;
    
    const rect = this.elements.gradientBar.getBoundingClientRect();
    let position = ((e.clientX - rect.left) / rect.width) * 100;
    position = Math.max(0, Math.min(100, position));
    
    this.gradientStops[this.selectedStopIndex].position = position;
    this.gradientStops.sort((a, b) => a.position - b.position);
    this.selectedStopIndex = this.gradientStops.findIndex(stop => stop.position === position);
    
    this.updateGradient();
  }

  handleGradientAngleChange(e) {
    this.gradientAngle = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
    this.updateGradient();
  }

  updateGradient() {
    if (this.currentMode !== 'gradient' || !this.elements.gradientBarBg) return;
    
    const gradient = this.getCurrentGradient();
    this.elements.gradientBarBg.style.background = gradient;
    
    if (this.elements.gradientStops) {
      this.elements.gradientStops.forEach((stop, index) => {
        stop.style.left = `${this.gradientStops[index].position}%`;
        stop.querySelector('.cp-gradient-stop-color').style.backgroundColor = this.gradientStops[index].color;
        stop.classList.toggle('active', index === this.selectedStopIndex);
      });
    }
    
    if (this.options.onChange) {
      this.options.onChange(gradient);
    }
  }

  getCurrentGradient() {
    return createGradient(this.gradientAngle, this.gradientStops);
  }

  getColor() {
    return this.currentMode === 'gradient' ? this.getCurrentGradient() : this.currentColor;
  }

  destroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.container.innerHTML = '';
  }
}

export default ColorPicker; 