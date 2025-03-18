import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'modules', // 详情参考官方文档：https://cn.vitejs.dev/config/build-options.html#build-target
    minify: true, // 是否开启代码压缩
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'ColorPicker',
      fileName: 'color-picker'
    },
    rollupOptions: {
      external: [],
      output: [
        {
          format: 'es', // 指定模块化类型 https://cn.rollupjs.org/configuration-options/#output-format
          entryFileNames: '[name].js', // 入口文件名，默认 https://cn.rollupjs.org/configuration-options/#output-entryfilenames
          preserveModules: true, // 该选项将使用原始模块名作为文件名
          dir: 'es', // 输出的目录
          preserveModulesRoot: 'src' // 确保输出的目录和输入时的一致
        },
        {
          format: 'cjs', // 指定模块化类型
          entryFileNames: '[name].js',
          preserveModules: true,
          dir: 'lib',
          preserveModulesRoot: 'src'
        }
      ]
    }
  },
  server: {
    open: '/example/index.html'
  }
});
