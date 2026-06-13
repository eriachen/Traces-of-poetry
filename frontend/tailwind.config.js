/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 诗迹主色系 - 七层渐变
        paper: '#FAF5EA',        // 纸白 - 页面底色
        rice: '#EDE3D0',         // 米棠 - 凹陷区/输入框背景
        xuan: '#D6C4A0',         // 旧宣 - 边框线
        gold: '#C4A067',         // 金墨 - 高光/active
        brown: '#8C5E38',        // 褐朱 - 主强调色
        ink: '#4A3728',          // 墨栗 - 标题文字
        deepInk: '#2A1E14',      // 沉墨 - 正文
        
        // 功能色
        moss: '#4A7C6A',         // 青苔绿
        wave: '#6B8FA8',         // 烟波蓝
        cinnabar: '#B04040',     // 朱砂
        violet: '#7A6B9A',       // 紫烟
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'poetry': '0.04em',
        'poetry-wide': '0.08em',
      },
      lineHeight: {
        'poetry': '1.9',
      },
      boxShadow: {
        'ink': '0 2px 8px rgba(74, 55, 40, 0.15)',
        'paper': '0 4px 20px rgba(74, 55, 40, 0.1)',
      }
    },
  },
  plugins: [],
}
