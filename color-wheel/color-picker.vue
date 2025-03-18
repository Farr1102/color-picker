<template>
  <div class="color-picker">
    <div class="cp-tabs" v-if="modes.length > 1">
      <div
        v-for="tab in modes"
        :key="tab"
        :class="['cp-tab', { active: currentMode === tab }]"
        @click="currentMode = tab"
      >
        {{ tab }}
      </div>
    </div>

    <!-- 颜色值显示和吸色器 -->
    <div class="cp-color-input" v-if="currentMode === '纯色'">
      <div
        class="cp-color-view"
        :style="{
          background:
            currentMode === '纯色'
              ? currentColor
              : selectedStopIndex !== null
              ? gradientStops[selectedStopIndex].color
              : '',
        }"
      ></div>
      <div class="cp-color-text">HEX</div>
      <div class="cp-color-value">
        <input
          type="text"
          :value="
            currentMode === '纯色'
              ? currentColor
              : selectedStopIndex !== null
              ? gradientStops[selectedStopIndex].color
              : ''
          "
          @input="handleColorInput"
          placeholder="#RRGGBB"
        />
      </div>
      <button class="cp-eyedropper" @click="activateEyedropper">
        <img
          v-if="!eyeDropperStatus"
          class="cp-eyedropper-icon"
          src="https://static1.bitautoimg.com/yc-arkweb/cheyi/eyedropper.png"
          alt=""
        />
        <img
          v-else
          class="cp-eyedropper-icon"
          src="https://static1.bitautoimg.com/yc-arkweb/cheyi/eyedropper-active.png"
          alt=""
        />
      </button>
    </div>

    <!-- 纯色模式 -->
    <div v-show="currentMode === '纯色'" class="cp-solid">
      <div class="cp-palette" ref="palette" @mousedown="handlePaletteMouseDown">
        <div class="cp-saturation"></div>
        <div class="cp-value"></div>
        <div class="cp-cursor" :style="cursorStyle"></div>
      </div>
      <div class="cp-hue" ref="hue" @mousedown="handleHueMouseDown">
        <div class="cp-hue-cursor" :style="{ left: hue * 100 + '%', background: currentColor }">
          <div class="circle"></div>
        </div>
      </div>

      <!-- 预设颜色 -->
      <div class="cp-presets">
        <div class="cp-preset-label">预设颜色:</div>
        <div class="cp-preset-colors">
          <div
            v-for="(color, index) in solidPresets"
            :key="'solid-' + index"
            class="cp-preset-color"
            :style="{ backgroundColor: color }"
            @click="selectSolidPreset(color)"
          ></div>
        </div>
      </div>

      <!-- 最近使用 -->
      <div class="cp-recent" v-if="recentColors.length">
        <div class="cp-preset-label">最近使用:</div>
        <div class="cp-preset-colors">
          <div
            v-for="(color, index) in recentColors"
            :key="'recent-' + index"
            class="cp-preset-color"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>
    </div>

    <!-- 渐变模式 -->
    <div v-show="currentMode === '渐变'" class="cp-gradient">
      <!-- 渐变类型和角度控制 -->
      <div class="cp-gradient-type-controls">
        <div class="cp-gradient-angle">
          <span>渐变方向:</span>
          <div>
            <template v-if="!showAngleInput">
              <input
                type="number"
                v-model.number="gradientAngle"
                class="cp-angle-input"
                min="0"
                max="360"
              />
              <span>°</span>
            </template>
            <template v-else>
              <div class="cp-angle-buttons">
                <button
                  class="cp-angle-btn"
                  :class="{ active: gradientAngle === 90 }"
                  @click="gradientAngle = 90"
                >
                  左右
                </button>
                <button
                  class="cp-angle-btn"
                  :class="{ active: gradientAngle === 180 }"
                  @click="gradientAngle = 180"
                >
                  上下
                </button>
              </div>
            </template>
          </div>

          <!-- <button class="cp-angle-toggle" @click="showAngleInput = !showAngleInput">
            {{ showAngleInput ? "简单" : "高级" }}
          </button> -->
        </div>
      </div>
      <!-- 颜色值显示和吸色器 -->
      <div class="cp-color-input">
        <div
          class="cp-color-view"
          :style="{
            background:
              currentMode === '纯色'
                ? currentColor
                : selectedStopIndex !== null
                ? gradientStops[selectedStopIndex].color
                : '',
          }"
        ></div>
        <div class="cp-color-text">HEX</div>
        <div class="cp-color-value">
          <input
            type="text"
            :value="
              currentMode === '纯色'
                ? currentColor
                : selectedStopIndex !== null
                ? gradientStops[selectedStopIndex].color
                : ''
            "
            @input="handleColorInput"
            placeholder="#RRGGBB"
          />
        </div>
        <button class="cp-eyedropper" @click="activateEyedropper">
          <img
            v-if="!eyeDropperStatus"
            class="cp-eyedropper-icon"
            src="https://static1.bitautoimg.com/yc-arkweb/cheyi/eyedropper.png"
            alt=""
          />
          <img
            v-else
            class="cp-eyedropper-icon"
            src="https://static1.bitautoimg.com/yc-arkweb/cheyi/eyedropper-active.png"
            alt=""
          />
        </button>
      </div>

      <!-- 渐变停靠点控制器 -->
      <div class="cp-gradient-bar" @click="addGradientStop">
        <div
          v-for="(stop, index) in gradientStops"
          :key="index"
          class="cp-gradient-stop"
          :class="{ active: selectedStopIndex === index }"
          :style="{ left: stop.position + '%' }"
          @mousedown.stop="startDraggingStop(index, $event)"
          @click.stop="selectStop(index)"
        >
          <div class="cp-gradient-stop-color" :style="{ backgroundColor: stop.color }"></div>
        </div>
        <div class="cp-gradient-bar-bg" :style="{ background: currentGradient }"></div>
      </div>
      <!-- 停靠点控制面板 -->
      <div class="cp-gradient-controls">
        <div class="cp-gradient-stop-panel">
          <div class="cp-palette" ref="gradientPalette" @mousedown="handleGradientPaletteMouseDown">
            <div class="cp-saturation"></div>
            <div class="cp-value"></div>
            <div class="cp-cursor" :style="selectedStopCursorStyle"></div>
          </div>
          <div class="cp-hue" ref="gradientHue" @mousedown="handleGradientHueMouseDown">
            <div
              class="cp-hue-cursor"
              :style="{
                left: selectedStopHue * 100 + '%',
                background: gradientStops[selectedStopIndex].color,
              }"
            >
              <div class="circle"></div>
            </div>
          </div>
          <!-- <div class="cp-stop-position">
            <span>位置:</span>
            <input
              type="number"
              v-model.number="gradientStops[selectedStopIndex].position"
              min="0"
              max="100"
              @input="updateGradient"
              @change="finishGradientEdit"
            />
            <span>%</span>
            <button
              class="cp-delete-stop"
              @click="deleteSelectedStop"
              v-if="gradientStops.length > 2"
            >
              删除
            </button>
          </div> -->
        </div>
      </div>

      <!-- 渐变预设 -->
      <div class="cp-presets">
        <div class="cp-preset-label">渐变预设:</div>
        <div class="cp-preset-gradients">
          <div
            v-for="(gradient, index) in gradientPresets"
            :key="'gradient-' + index"
            class="cp-preset-gradient"
            :style="{ background: gradient }"
            @click="selectGradientPreset(gradient)"
          ></div>
        </div>
      </div>

      <!-- 最近使用的渐变 -->
      <div class="cp-recent" v-if="recentGradients.length">
        <div class="cp-preset-label">最近使用:</div>
        <div class="cp-preset-gradients">
          <div
            v-for="(gradient, index) in recentGradients"
            :key="'recent-gradient-' + index"
            class="cp-preset-gradient"
            :style="{ background: gradient }"
            @click="selectGradient(gradient)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ColorPicker",

  props: {
    value: {
      type: String,
      default: "#FF0000",
    },
    modes: {
      type: Array,
      default: () => ["纯色", "渐变"],
    },
  },

  data() {
    return {
      currentMode: this.modes[0] || "纯色",
      internalValue: this.value,
      hue: 0,
      eyeDropperStatus: false,
      saturation: 1,
      brightness: 1,
      gradientAngle: 90,

      // 纯色预设
      solidPresets: [
        "#FF0000",
        "#FF4500",
        "#FF8C00",
        "#FFD700",
        "#FFFF00",
        "#32CD32",
        "#00FF00",
        "#00FA9A",
        "#00FFFF",
        "#0000FF",
        "#4B0082",
        "#8A2BE2",
        "#FF00FF",
        "#FF69B4",
        "#FFC0CB",
        "#A52A2A",
        "#DEB887",
        "#F5F5DC",
      ],

      // 渐变预设
      gradientPresets: [
        "linear-gradient(90deg, #FF0000 0%, #FFFF00 50%, #00FF00 100%)",
        "linear-gradient(90deg, #0000FF 0%, #00FFFF 50%, #FFFFFF 100%)",
        "linear-gradient(90deg, #FF00FF 0%, #FF0000 100%)",
        "linear-gradient(90deg, #00FFFF 0%, #0000FF 100%)",
        "linear-gradient(90deg, #FF0000 0%, #FFA500 25%, #FFFF00 50%, #00FF00 75%, #0000FF 100%)",
        "linear-gradient(90deg, #FF0000 0%, #FF00FF 50%, #0000FF 100%)",
        "linear-gradient(180deg, #000000 0%, #808080 50%, #FFFFFF 100%)",
        "linear-gradient(90deg, #FF0000 0%, #000000 100%)",
      ],

      // 最近使用的颜色
      recentColors: [],
      recentGradients: [],

      // 当前渐变
      gradientStopsData: [
        { position: 0, color: "#FF0000" },
        { position: 100, color: "#00FF00" },
      ],
      selectedStopIndex: 0,
      selectedStopHue: 0,
      selectedStopSaturation: 1,
      selectedStopValue: 1,
      showAngleInput: true,
      currentGradient: "linear-gradient(90deg, #FF0000 0%, #FFFF00 50%, #00FF00 100%)", // 添加到 data 中而不是作为计算属性
    };
  },

  computed: {
    cursorStyle() {
      return {
        left: this.saturation * 100 + "%",
        top: (1 - this.brightness) * 100 + "%",
      };
    },

    selectedStopCursorStyle() {
      return {
        left: this.selectedStopSaturation * 100 + "%",
        top: (1 - this.selectedStopValue) * 100 + "%",
      };
    },

    gradientStops() {
      return this.gradientStopsData;
    },

    currentColor() {
      const rgb = this.hsv2rgb(this.hue * 360, this.saturation, this.brightness);
      return this.rgb2hex(...rgb);
    },
  },

  methods: {
    // HSV 转 RGB
    hsv2rgb(h, s, v) {
      let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
      return [f(5), f(3), f(1)].map((x) => Math.round(x * 255));
    },

    // RGB 转 Hex
    rgb2hex(r, g, b) {
      return (
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("")
      );
    },

    // 处理调色板鼠标事件
    handlePaletteMouseDown(e) {
      const handleMouseMove = (e) => {
        const rect = this.$refs.palette.getBoundingClientRect();
        this.saturation = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        this.brightness = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
        this.updateColor();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      handleMouseMove(e);
    },

    // 处理色相条鼠标事件
    handleHueMouseDown(e) {
      const handleMouseMove = (e) => {
        const rect = this.$refs.hue.getBoundingClientRect();
        this.hue = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        this.updateColor();
        // 更新调色板背景色
        this.updatePaletteBackground();
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      handleMouseMove(e);
    },

    // 更新调色板背景色
    updatePaletteBackground() {
      const rgb = this.hsv2rgb(this.hue * 360, 1, 1);
      const color = this.rgb2hex(...rgb);
      if (this.$refs.palette) {
        this.$refs.palette.style.background = color;
      }
    },

    // 更新颜色
    updateColor() {
      const rgb = this.hsv2rgb(this.hue * 360, this.saturation, this.brightness);
      const color = this.rgb2hex(...rgb);
      this.internalValue = color;
      this.$emit("input", color);
      this.addToRecent(color);
    },

    // 选择纯色预设
    selectSolidPreset(color) {
      const rgb = this.hex2rgb(color);
      const hsv = this.rgb2hsv(...rgb);
      this.hue = hsv.h / 360;
      this.saturation = hsv.s;
      this.brightness = hsv.v;
      this.updatePaletteBackground();
      this.internalValue = color;
      this.$emit("input", color);
      this.addToRecent(color);
    },

    // 选择渐变预设
    selectGradientPreset(gradient) {
      this.currentGradient = gradient;
      this.$emit("input", gradient);
      this.addToRecentGradient(gradient);

      // 解析渐变字符串，更新停靠点
      this.parseGradientToStops(gradient);
    },

    // 解析渐变字符串为停靠点数组
    parseGradientToStops(gradient) {
      // 提取角度
      const angleMatch = gradient.match(/(\d+)deg/);
      if (angleMatch && angleMatch[1]) {
        this.gradientAngle = parseInt(angleMatch[1]);
      }

      // 提取颜色停靠点
      const colorStopsMatch = gradient.match(/,(.*)\)/);
      if (colorStopsMatch && colorStopsMatch[1]) {
        const colorStopsStr = colorStopsMatch[1].trim();
        const colorStopRegex = /(#[0-9A-Fa-f]{6}|rgba?\([^)]+\)) (\d+)%/g;

        const newStops = [];
        let match;

        while ((match = colorStopRegex.exec(colorStopsStr)) !== null) {
          newStops.push({
            color: match[1],
            position: parseInt(match[2]),
          });
        }

        if (newStops.length >= 2) {
          this.gradientStopsData = newStops;
          // 选中第一个停靠点并更新面板
          this.selectStop(0);
        }
      }
    },

    // 选择渐变
    selectGradient(gradient) {
      this.currentGradient = gradient;
      this.$emit("input", gradient);

      // 解析渐变字符串，更新停靠点
      this.parseGradientToStops(gradient);
      this.addToRecentGradient(gradient);
    },

    // 添加到最近使用的颜色
    addToRecent(color) {
      if (!this.recentColors.includes(color)) {
        this.recentColors.unshift(color);
        if (this.recentColors.length > 18) {
          this.recentColors.pop();
        }
      }
    },

    // 添加到最近使用的渐变
    addToRecentGradient(gradient) {
      if (!this.recentGradients.includes(gradient)) {
        this.recentGradients.unshift(gradient);
        if (this.recentGradients.length > 8) {
          this.recentGradients.pop();
        }
      }
    },

    // 选择颜色
    selectColor(color) {
      this.$emit("input", color);
    },

    // 渐变停靠点相关方法
    selectStop(index) {
      this.selectedStopIndex = index;
      const color = this.gradientStops[index].color;
      // 解析颜色获取 HSV 值
      const rgb = this.hex2rgb(color);
      const hsv = this.rgb2hsv(...rgb);
      this.selectedStopHue = hsv.h / 360;
      this.selectedStopSaturation = hsv.s;
      this.selectedStopValue = hsv.v;

      // 更新调色板背景色
      const paletteRgb = this.hsv2rgb(hsv.h, 1, 1);
      const paletteColor = this.rgb2hex(...paletteRgb);
      if (this.$refs.gradientPalette) {
        this.$refs.gradientPalette.style.background = paletteColor;
      }
    },

    startDraggingStop(index, event) {
      this.selectStop(index);
      const bar = this.$el.querySelector(".cp-gradient-bar");
      const rect = bar.getBoundingClientRect();

      const handleMouseMove = (e) => {
        let position = ((e.clientX - rect.left) / rect.width) * 100;
        position = Math.max(0, Math.min(100, position));
        this.gradientStopsData[index].position = Math.round(position);
        this.updateGradient();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        // 拖拽结束后添加到最近使用
        this.finishGradientEdit();
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },

    addGradientStop(event) {
      const bar = event.currentTarget;
      const rect = bar.getBoundingClientRect();
      const position = ((event.clientX - rect.left) / rect.width) * 100;

      // 找到最近的两个停靠点
      let insertIndex = 0;
      for (let i = 0; i < this.gradientStopsData.length; i++) {
        if (position < this.gradientStopsData[i].position) {
          insertIndex = i;
          break;
        }
      }

      // 计算新停靠点的颜色
      const prevStop = this.gradientStopsData[insertIndex - 1] || this.gradientStopsData[0];
      const nextStop =
        this.gradientStopsData[insertIndex] ||
        this.gradientStopsData[this.gradientStopsData.length - 1];
      const ratio = (position - prevStop.position) / (nextStop.position - prevStop.position);

      const newStop = {
        position: Math.round(position),
        color: this.interpolateColor(prevStop.color, nextStop.color, ratio),
      };

      this.gradientStopsData.splice(insertIndex, 0, newStop);
      this.selectStop(insertIndex);
      this.updateGradient();
      this.finishGradientEdit();
    },

    deleteSelectedStop() {
      if (this.selectedStopIndex !== null && this.gradientStopsData.length > 2) {
        this.gradientStopsData.splice(this.selectedStopIndex, 1);
        this.selectedStopIndex = null;
        this.updateGradient();
        // 删除停靠点后添加到最近使用
        this.finishGradientEdit();
      }
    },

    handleGradientPaletteMouseDown(e) {
      if (this.selectedStopIndex === null) return;

      const handleMouseMove = (e) => {
        const rect = this.$refs.gradientPalette.getBoundingClientRect();
        this.selectedStopSaturation = Math.min(
          1,
          Math.max(0, (e.clientX - rect.left) / rect.width)
        );
        this.selectedStopValue = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));

        // 更新调色板背景色
        const rgb = this.hsv2rgb(this.selectedStopHue * 360, 1, 1);
        const color = this.rgb2hex(...rgb);
        if (this.$refs.gradientPalette) {
          this.$refs.gradientPalette.style.background = color;
        }

        // 更新停靠点颜色
        const stopRgb = this.hsv2rgb(
          this.selectedStopHue * 360,
          this.selectedStopSaturation,
          this.selectedStopValue
        );
        const stopColor = this.rgb2hex(...stopRgb);
        this.gradientStopsData[this.selectedStopIndex].color = stopColor;
        this.updateGradient();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        this.finishGradientEdit();
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      handleMouseMove(e);
    },

    handleGradientHueMouseDown(e) {
      if (this.selectedStopIndex === null) return;

      const handleMouseMove = (e) => {
        const rect = this.$refs.gradientHue.getBoundingClientRect();
        this.selectedStopHue = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));

        // 更新调色板背景色
        const rgb = this.hsv2rgb(this.selectedStopHue * 360, 1, 1);
        const color = this.rgb2hex(...rgb);
        if (this.$refs.gradientPalette) {
          this.$refs.gradientPalette.style.background = color;
        }

        // 更新停靠点颜色
        const stopRgb = this.hsv2rgb(
          this.selectedStopHue * 360,
          this.selectedStopSaturation,
          this.selectedStopValue
        );
        const stopColor = this.rgb2hex(...stopRgb);
        this.gradientStopsData[this.selectedStopIndex].color = stopColor;
        this.updateGradient();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        this.finishGradientEdit();
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      handleMouseMove(e);
    },

    updateSelectedStopColor() {
      if (this.selectedStopIndex === null) return;
      const rgb = this.hsv2rgb(
        this.selectedStopHue * 360,
        this.selectedStopSaturation,
        this.selectedStopValue
      );
      const color = this.rgb2hex(...rgb);
      this.gradientStopsData[this.selectedStopIndex].color = color;
      this.updateGradient();

      // 更新调色板背景色
      if (this.$refs.gradientPalette) {
        this.$refs.gradientPalette.style.background = color;
      }
    },

    updateGradient() {
      // 排序渐变停靠点
      this.gradientStopsData.sort((a, b) => a.position - b.position);

      // 更新当前渐变
      const stops = this.gradientStopsData
        .map((stop) => `${stop.color} ${stop.position}%`)
        .join(", ");
      const newGradient = `linear-gradient(${this.gradientAngle}deg, ${stops})`;

      // 更新值并触发事件
      this.currentGradient = newGradient;
      this.$emit("input", newGradient);

      // 更新渐变条背景
      const barBg = this.$el.querySelector(".cp-gradient-bar-bg");
      if (barBg) {
        barBg.style.background = newGradient;
      }
    },

    // 完成渐变编辑时添加到最近使用
    finishGradientEdit() {
      this.addToRecentGradient(this.currentGradient);
    },

    // 颜色转换工具方法
    hex2rgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
    },

    rgb2hsv(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      let h = 0;
      const s = max === 0 ? 0 : d / max;
      const v = max;

      if (max !== min) {
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

      return { h: h * 360, s, v };
    },

    interpolateColor(color1, color2, ratio) {
      const rgb1 = this.hex2rgb(color1);
      const rgb2 = this.hex2rgb(color2);
      const rgb = rgb1.map((c1, i) => {
        const c2 = rgb2[i];
        return Math.round(c1 + (c2 - c1) * ratio);
      });
      return this.rgb2hex(...rgb);
    },

    handleColorInput(event) {
      const color = event.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        if (this.currentMode === "纯色") {
          const rgb = this.hex2rgb(color);
          const hsv = this.rgb2hsv(...rgb);
          this.hue = hsv.h / 360;
          this.saturation = hsv.s;
          this.brightness = hsv.v;
          this.updatePaletteBackground();
          this.internalValue = color;
          this.$emit("input", color);
          this.addToRecent(color);
        } else if (this.selectedStopIndex !== null) {
          this.gradientStopsData[this.selectedStopIndex].color = color;
          const rgb = this.hex2rgb(color);
          const hsv = this.rgb2hsv(...rgb);
          this.selectedStopHue = hsv.h / 360;
          this.selectedStopSaturation = hsv.s;
          this.selectedStopValue = hsv.v;
          this.updateGradient();
          this.finishGradientEdit();
        }
      }
    },

    activateEyedropper() {
      if (!window.EyeDropper) {
        alert("您的浏览器不支持吸色器功能");
        return;
      }
      this.eyeDropperStatus = true;

      const eyeDropper = new window.EyeDropper();
      eyeDropper
        .open()
        .then((result) => {
          const color = result.sRGBHex;
          if (this.currentMode === "纯色") {
            // 纯色模式下直接更新颜色
            const rgb = this.hex2rgb(color);
            const hsv = this.rgb2hsv(...rgb);
            this.hue = hsv.h / 360;
            this.saturation = hsv.s;
            this.brightness = hsv.v;
            this.updatePaletteBackground();
            this.internalValue = color;
            this.$emit("input", color);
            this.addToRecent(color);
          } else if (this.selectedStopIndex !== null) {
            // 渐变模式下更新当前停靠点颜色
            this.gradientStopsData[this.selectedStopIndex].color = color;
            const rgb = this.hex2rgb(color);
            const hsv = this.rgb2hsv(...rgb);
            this.selectedStopHue = hsv.h / 360;
            this.selectedStopSaturation = hsv.s;
            this.selectedStopValue = hsv.v;
            this.updateGradient();
            this.finishGradientEdit();
          }
          this.eyeDropperStatus = false;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },

  watch: {
    value: {
      handler(newValue) {
        if (newValue !== this.internalValue) {
          this.internalValue = newValue;
          if (this.currentMode === "纯色") {
            const rgb = this.hex2rgb(newValue);
            const hsv = this.rgb2hsv(...rgb);
            this.hue = hsv.h / 360;
            this.saturation = hsv.s;
            this.brightness = hsv.v;
            this.updatePaletteBackground();
          }
        }
      },
      immediate: true,
    },

    gradientAngle(newAngle) {
      // 更新渐变角度
      this.currentGradient = this.currentGradient.replace(/\d+deg/, newAngle + "deg");
      this.$emit("input", this.currentGradient);
    },
    currentMode: {
      handler(newMode) {
        if (newMode === "渐变") {
          // 切换到渐变模式时，确保选中第一个停靠点
          this.selectStop(0);
        }
      },
      immediate: true,
    },
  },

  mounted() {
    // 初始化调色板背景色
    this.updatePaletteBackground();
    // 如果是渐变模式，初始化第一个停靠点的颜色和渐变
    if (this.currentMode === "渐变") {
      this.selectStop(0);
      this.updateGradient(); // 初始化渐变
    }
  },
};
</script>

<style scoped lang="less">
.color-picker {
  width: 291px;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 4px;
  background: #ffffff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.22);
}

.cp-tabs {
  display: flex;
  height: 34px;
  align-items: center;
  background: #f3f4f7;
  border-radius: 4px;
  padding: 2px;
  box-sizing: border-box;
  cursor: pointer;
}

.cp-tab {
  flex: 1;
  text-align: center;
  cursor: pointer;
  color: #222222;
  height: 30px;
  line-height: 30px;
}

.cp-tab.active {
  background: #ffffff;
  background: #ffffff;
  box-shadow: 0px 2px 3px 0px rgba(170, 177, 197, 0.3);
  border-radius: 3px;
}

.cp-palette {
  position: relative;
  width: 100%;
  height: 173px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #ff0000;
}

.cp-saturation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, #fff, transparent);
}

.cp-value {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, #000, transparent);
  border-radius: 4px;
}

.cp-cursor {
  position: absolute;
  width: 12px;
  height: 12px;
  margin: -6px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.cp-hue {
  position: relative;
  width: 100%;
  height: 10px;
  margin-bottom: 12px;
  border-radius: 5px;
  background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
  cursor: pointer;
}

.cp-hue-cursor {
  position: absolute;
  box-sizing: border-box;
  margin: -2px -6px;
  border-radius: 7px;
  pointer-events: none;
  width: 14px;
  height: 14px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.22);
  border: 1px solid #bababa;
  .circle {
    width: 10px;
    height: 10px;
    margin: -1px;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
}

.cp-gradient-type-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 21px;
}

.cp-gradient-angle {
  margin-top: 19px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cp-gradient-bar {
  position: relative;
  width: 100%;
  height: 10px;
  margin: 20px 0;
  border-radius: 5px;
  cursor: pointer;
}

.cp-gradient-bar-bg {
  border-radius: 5px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.cp-gradient-stop {
  position: absolute;
  width: 12px;
  height: 12px;
  margin: -8px;
  top: 50%;
  cursor: move;
  z-index: 1;
}

.cp-gradient-stop-color {
  width: 100%;
  height: 100%;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.cp-gradient-stop.active .cp-gradient-stop-color {
  border-color: #409eff;
  transform: scale(1.2);
}

.cp-gradient-preview {
  width: 100%;
  height: 50px;
  margin-bottom: 15px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.cp-gradient-stop-panel {
  margin: 0;
  padding: 0;
  width: 100%;
  background: none;
  border-radius: 0;
}

.cp-stop-position {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.cp-stop-position input {
  width: 60px;
  margin: 0 5px;
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
}

.cp-delete-stop {
  margin-left: auto;
  padding: 6px 12px;
  color: #f56c6c;
  background: none;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.cp-delete-stop:hover {
  color: #fff;
  background: #f56c6c;
}

.cp-gradient-controls {
  display: flex;
  align-items: center;
}

.cp-angle-input {
  width: 60px;
  margin: 0 5px;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
}

.cp-preset-colors {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
}

.cp-preset-gradients {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.cp-preset-color {
  aspect-ratio: 1;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #eee;
  transition: transform 0.2s;
}

.cp-preset-gradient {
  aspect-ratio: 3/1;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #eee;
  transition: transform 0.2s;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.cp-preset-color:hover {
  transform: scale(1.1);
}

.cp-preset-gradient:hover {
  transform: scale(1.05);
}

.cp-presets {
  margin-bottom: 12px;
}

.cp-preset-label {
  margin-bottom: 8px;
  font-size: 12px;
  color: #606266;
}

.cp-recent {
  margin-top: 15px;
}

.cp-color-input {
  display: flex;
  align-items: center;
  margin: 10px 0 11px;
  gap: 8px;

  .cp-color-view {
    box-sizing: border-box;
    width: 30px;
    height: 30px;
    border-radius: 3px;
    border: 1px solid #e1e6f0;
  }
  .cp-color-text {
    font-weight: 500;
    font-size: 12px;
    color: #1d2129;
    margin-left: 30px;
  }
}

.cp-color-value {
  flex: 1;
  input {
    display: block;
    box-sizing: border-box;
    outline: none;
    width: 101px !important;
    height: 30px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e1e6f0;
    padding: 5px 11px 5px 16px !important;
    font-weight: 500;
    font-size: 14px;
    color: #1d2129;
  }
}

.cp-color-value input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-family: monospace;
  text-transform: uppercase;
}

.cp-eyedropper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  border: 0;
  background: #fff;
}

.cp-eyedropper-icon {
  font-style: normal;
  font-size: 16px;
  height: 30px;
  width: 30px;
}

.cp-angle-buttons {
  display: flex;
  gap: 8px;

  .cp-angle-btn {
    padding: 4px 8px;
    border: 1px solid #d1d6e7;
    cursor: pointer;
    background: #fff;
    width: 52px;
    height: 28px;
    border-radius: 2px;
  }

  .cp-angle-btn.active {
    color: #fff;
    border-color: #3366ff;
    background: #3366ff;
  }
}

.cp-angle-toggle {
  margin-left: 8px;
  padding: 4px 8px;
  background: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.cp-angle-toggle:hover {
  color: #409eff;
  border-color: #409eff;
}
</style>
