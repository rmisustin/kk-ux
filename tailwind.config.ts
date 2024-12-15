import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import svelteUx from 'svelte-ux/plugins/tailwind.cjs';


export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/svelte-ux/**/*.{svelte,js}'
	],

	theme: {
		extend: {}
	},

	// See customization docs: https://svelte-ux.techniq.dev/customization
	ux: {
		themes: {
			"light": {
				"color-scheme": "light",
				"primary": "hsl(141.1765 50% 60%)",
				"secondary": "hsl(218.8776 96.0784% 60%)",
				"accent": "hsl(10.4895 88.8199% 68.4314%)",
				"neutral": "hsl(219.2308 20.3125% 25.098%)",
				"surface-100": "hsl(180 100% 100%)"
			},
			"dark": {
				"color-scheme": "dark",
				"primary": "hsl(141.039 71.9626% 41.9608%)",
				"secondary": "hsl(163.7419 72.77% 41.7647%)",
				"accent": "hsl(174.9677 72.77% 41.7647%)",
				"neutral": "hsl(161.3793 36.7089% 15.4902%)",
				"surface-100": "hsl(0 12.1951% 8.0392%)"
			},
			oldlight: {
				primary: colors['orange']['500'],
				'primary-content': 'white',
				secondary: colors['blue']['500'],
				'surface-100': 'white',
				'surface-200': colors['gray']['100'],
				'surface-300': colors['gray']['300'],
				'surface-content': colors['gray']['900'],
				'color-scheme': 'light'
			},
			olddark: {
				primary: colors['orange']['500'],
				'primary-content': 'white',
				secondary: colors['blue']['500'],
				'surface-100': colors['zinc']['800'],
				'surface-200': colors['zinc']['900'],
				'surface-300': colors['zinc']['950'],
				'surface-content': colors['zinc']['100'],
				'color-scheme': 'dark'
			},
		},
	},
	

	plugins: [
		typography,
		svelteUx	 // uses hsl() color space by default. To use oklch(), use: svelteUx({ colorSpace: 'oklch' }),
	]
} satisfies Config;
