/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit', // 确保启用 JIT 模式
  prefix: 'tw-',
  content: [
    "./index.html",
    // 只扫描源码，排除打包好的 dll / 静态 JS，避免 Tailwind 对超大文件做正则匹配导致栈溢出
    "./src/**/*.{js,ts,jsx,tsx,ejs}",
    "!./src/static/js/**",
    "!./src/static/fonts/**",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false // 关闭默认样式
  },
  plugins: [],
}


