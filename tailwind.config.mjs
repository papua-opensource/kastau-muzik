/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', 'node_modules/preline/dist/*.js',],
	theme: {
		extend: {
			fontFamily: {
				onest: ["Onest"]
			}
		},
	},
	darkMode: "class",
	plugins: [require('preline/plugin'),],
}