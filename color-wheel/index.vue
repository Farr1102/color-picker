<template>
  <div class="popover-color-picker">
    <el-popover
      placement="bottom"
      trigger="click"
      popper-class="color-picker-popover"
      :width="291"
      :placement="'bottom-start'"
    >
      <ColorPicker :value="currentColor" @input="handleColorChange" :modes="modes" />
      <template #reference>
        <div class="color-preview">
          <div
            class="color-block"
            :style="{ background: currentColor }"
            :class="{ 'color-block-gradient': isGradient }"
          ></div>
          <img src="https://static1.bitautoimg.com/yc-arkweb/cheyi/colorwheel.png" alt="" />
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script>
import ColorPicker from "./color-picker.vue";

export default {
  name: "PopoverColorPicker",

  components: {
    ColorPicker,
  },

  props: {
    value: {
      type: String,
      default: "#000000",
    },
    modes: {
      type: Array,
      default: () => ["纯色", "渐变"],
    },
  },

  data() {
    return {
      currentColor: this.value,
    };
  },

  computed: {
    isGradient() {
      return this.currentColor && this.currentColor.includes("gradient");
    },
  },

  watch: {
    value: {
      handler(newVal) {
        if (newVal !== this.currentColor) {
          this.currentColor = newVal;
        }
      },
      immediate: true,
    },
  },

  methods: {
    handleColorChange(color) {
      this.currentColor = color;
      this.$emit("input", color);
      this.$emit("change", color);
    },
  },
};
</script>

<style scoped lang="less">
.popover-color-picker {
  display: inline-block;
}

.color-preview {
  cursor: pointer;
  height: 20px;
  background-color: #fff;
  box-sizing: border-box;
  width: 131px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid rgba(163, 174, 208, 0.5);
  padding: 6px;
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    width: 21px;
    height: 21px;
  }

  .color-block {
    display: inline-block;
    width: 84px;
    height: 28px;
    border-radius: 3px;
  }
}

.color-block-gradient {
  background-size: cover !important;
}
</style>

<style>
.color-picker-popover {
  padding: 0 !important;
  border: none !important;
}
</style>
