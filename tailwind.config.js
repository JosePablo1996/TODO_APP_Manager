/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ✅ AÑADIR ESTA LÍNEA - habilita el modo oscuro basado en clase
  theme: {
    extend: {},
  },
  plugins: [],
}