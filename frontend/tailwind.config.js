/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'tw-',
	important: false,
	content: [
		"./index.html",
		"./public/**/*.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Material Design 3 Primary Colors (Purple)
				'md-primary': {
					0: '#000000',
					10: '#21005D',
					20: '#371E71',
					25: '#4028A0',
					30: '#482BA0',
					35: '#533AA0',
					40: '#6750A4',
					50: '#7E3F93',
					60: '#935DB1',
					70: '#B59FCC',
					80: '#D9C8E8',
					90: '#F1E4F6',
					95: '#F9F1F8',
					99: '#FFFBFE',
					100: '#FFFFFF',
				},
				// Material Design 3 Secondary Colors (Teal)
				'md-secondary': {
					0: '#000000',
					10: '#0C3C47',
					20: '#204C54',
					25: '#2B5C67',
					30: '#366C7A',
					35: '#427C8D',
					40: '#4D8CA0',
					50: '#639CB8',
					60: '#7BADD1',
					70: '#95BFEA',
					80: '#AFD1FF',
					90: '#C9E0FF',
					95: '#E3F1FF',
					99: '#FBFCFF',
					100: '#FFFFFF',
				},
				// Material Design 3 Tertiary Colors (Green)
				'md-tertiary': {
					0: '#000000',
					10: '#1F411E',
					20: '#32512D',
					25: '#3D5D39',
					30: '#496945',
					35: '#557550',
					40: '#62805C',
					50: '#7A956D',
					60: '#94A980',
					70: '#ADBF94',
					80: '#C8D5AA',
					90: '#E3E9C4',
					95: '#F1F2E0',
					99: '#FBFCF5',
					100: '#FFFFFF',
				},
				// Material Design 3 Neutral Colors (Grey)
				'md-neutral': {
					0: '#000000',
					4: '#0A0A0A',
					10: '#1C1C1C',
					12: '#201F1F',
					17: '#2B2A2A',
					20: '#322F30',
					25: '#3F3C3D',
					30: '#49464A',
					35: '#534F53',
					40: '#5E595E',
					50: '#79747E',
					60: '#938F99',
					70: '#AEA9B4',
					80: '#CAC7CF',
					90: '#E6E1E6',
					92: '#ECE9EE',
					95: '#F5EFF7',
					99: '#FFFBFE',
					100: '#FFFFFF',
				},
				// Material Design 3 Error Colors (Red)
				'md-error': {
					0: '#000000',
					10: '#410E0B',
					20: '#601410',
					25: '#72211E',
					30: '#842B27',
					35: '#953530',
					40: '#B3261E',
					50: '#F9DEDC',
					60: '#F2B8B5',
					70: '#F9DEDC',
					80: '#F9DEDC',
					90: '#F9DEDC',
					95: '#FEF1EF',
					99: '#FFFBF9',
					100: '#FFFFFF',
				},
			},
			fontFamily: {
				poly: ['"poly"', "serif"],
			},
			boxShadow: {
				// Material Design 3 Elevation shadows
				'md-1': '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
				'md-2': '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
				'md-3': '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
				'md-4': '0px 15px 25px rgba(0, 0, 0, 0.15), 0px 10px 10px rgba(0, 0, 0, 0.05)',
				'md-6': '0px 20px 40px rgba(0, 0, 0, 0.2)',
			},
		},
	},
	plugins: [
		function({ addVariant }) {
			addVariant('firefox', ':-moz-any(&)')
		},
		// Add custom elevation utility classes
		function({ addUtilities }) {
			const elevations = {
				'.tw-elevation-1': {
					'@apply tw-bg-opacity-[0.05]': {},
				},
				'.tw-elevation-2': {
					'@apply tw-bg-opacity-[0.07]': {},
				},
				'.tw-elevation-3': {
					'@apply tw-bg-opacity-[0.08]': {},
				},
				'.tw-elevation-4': {
					'@apply tw-bg-opacity-[0.09]': {},
				},
				'.tw-elevation-6': {
					'@apply tw-bg-opacity-[0.11]': {},
				},
				'.tw-elevation-8': {
					'@apply tw-bg-opacity-[0.12]': {},
				},
				'.tw-elevation-12': {
					'@apply tw-bg-opacity-[0.14]': {},
				},
				'.tw-elevation-16': {
					'@apply tw-bg-opacity-[0.15]': {},
				},
				'.tw-elevation-24': {
					'@apply tw-bg-opacity-[0.16]': {},
				},
			}
			addUtilities(elevations)
		},
	],
}