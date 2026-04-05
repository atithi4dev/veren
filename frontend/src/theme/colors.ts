/**
 * Material Design 3 Color System
 * Professional, accessible color palette with proper contrast ratios
 * https://m3.material.io/
 */

// Material Design 3 Tonal Palettes
// Primary: Deep Purple - Professional and modern
export const PrimaryPalette = {
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
} as const

// Secondary: Teal - Complementary and calming
export const SecondaryPalette = {
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
} as const

// Tertiary: Green - Accent color for highlights
export const TertiaryPalette = {
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
} as const

// Neutral: Greyscale for surfaces
export const NeutralPalette = {
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
} as const

// Error: Red - For error states
export const ErrorPalette = {
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
} as const

// Neutral Variant: For secondary content
export const NeutralVariantPalette = {
  0: '#000000',
  10: '#1E192B',
  20: '#332D41',
  25: '#3F3751',
  30: '#4A4458',
  35: '#56505F',
  40: '#625B71',
  50: '#79747E',
  60: '#938F99',
  70: '#AEA9B4',
  80: '#CAC7CF',
  90: '#E6E1E6',
  95: '#F5EFF7',
  99: '#FFFBFE',
  100: '#FFFFFF',
} as const

// Material Design 3 Theme Colors
export const MD3ColorScheme = {
  // Light Theme
  light: {
    primary: '#6750a4',
    onPrimary: '#ffffff',
    primaryContainer: '#eaddff',
    onPrimaryContainer: '#21005d',

    secondary: '#625b71',
    onSecondary: '#ffffff',
    secondaryContainer: '#e8def8',
    onSecondaryContainer: '#1d192b',

    tertiary: '#7d5260',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffd8e4',
    onTertiaryContainer: '#31111d',

    error: '#b3261e',
    onError: '#ffffff',
    errorContainer: '#f9dedc',
    onErrorContainer: '#410e0b',

    background: '#fffbfe',
    onBackground: '#1c1b1f',

    surface: '#fffbfe',
    onSurface: '#1c1b1f',
    surfaceVariant: '#e7e0ec',
    onSurfaceVariant: '#49454e',

    outline: '#79747e',
    outlineVariant: '#cac7d0',

    scrim: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#f4eff4',
    inversePrimary: '#d0bcff',
  },

  // Dark Theme
  dark: {
    primary: '#d0bcff',
    onPrimary: '#371e71',
    primaryContainer: '#4f378b',
    onPrimaryContainer: '#eaddff',

    secondary: '#ccc7db',
    onSecondary: '#332d41',
    secondaryContainer: '#4a4458',
    onSecondaryContainer: '#e8def8',

    tertiary: '#f5b8d1',
    onTertiary: '#492532',
    tertiaryContainer: '#633b48',
    onTertiaryContainer: '#ffd8e4',

    error: '#f2b8b5',
    onError: '#601410',
    errorContainer: '#8c1d18',
    onErrorContainer: '#f9dedc',

    background: '#121212',
    onBackground: '#e6e1e6',

    surface: '#121212',
    onSurface: '#e6e1e6',
    surfaceVariant: '#49454e',
    onSurfaceVariant: '#cac7d0',

    outline: '#938f99',
    outlineVariant: '#49454e',

    scrim: '#000000',
    inverseSurface: '#e6e1e6',
    inverseOnSurface: '#1c1b1f',
    inversePrimary: '#6750a4',
  },
} as const

// Elevation overlay transparency (percentage)
// Higher elevation = lighter surface
export const ElevationOverlays = {
  0: 0,
  1: 0.05,
  2: 0.07,
  3: 0.08,
  4: 0.09,
  6: 0.11,
  8: 0.12,
  12: 0.14,
  16: 0.15,
  24: 0.16,
} as const

// Helper function to apply elevation overlay to dark theme
export const applyElevationOverlay = (
  baseColor: string,
  elevationLevel: keyof typeof ElevationOverlays
): string => {
  const opacity = ElevationOverlays[elevationLevel]
  // This is a simplified implementation
  // In production, you'd want to use a proper color manipulation library
  // For now, we'll return a comment and handle it in Tailwind
  return baseColor
}

// Tailwind color utility for Material Design 3
export const tailwindMD3Colors = {
  primary: {
    0: PrimaryPalette[0],
    10: PrimaryPalette[10],
    20: PrimaryPalette[20],
    30: PrimaryPalette[30],
    40: PrimaryPalette[40],
    50: PrimaryPalette[50],
    60: PrimaryPalette[60],
    70: PrimaryPalette[70],
    80: PrimaryPalette[80],
    90: PrimaryPalette[90],
    95: PrimaryPalette[95],
    99: PrimaryPalette[99],
    100: PrimaryPalette[100],
  },
  secondary: {
    0: SecondaryPalette[0],
    10: SecondaryPalette[10],
    20: SecondaryPalette[20],
    30: SecondaryPalette[30],
    40: SecondaryPalette[40],
    50: SecondaryPalette[50],
    60: SecondaryPalette[60],
    70: SecondaryPalette[70],
    80: SecondaryPalette[80],
    90: SecondaryPalette[90],
    95: SecondaryPalette[95],
    99: SecondaryPalette[99],
    100: SecondaryPalette[100],
  },
  tertiary: {
    0: TertiaryPalette[0],
    10: TertiaryPalette[10],
    20: TertiaryPalette[20],
    30: TertiaryPalette[30],
    40: TertiaryPalette[40],
    50: TertiaryPalette[50],
    60: TertiaryPalette[60],
    70: TertiaryPalette[70],
    80: TertiaryPalette[80],
    90: TertiaryPalette[90],
    95: TertiaryPalette[95],
    99: TertiaryPalette[99],
    100: TertiaryPalette[100],
  },
  neutral: {
    0: NeutralPalette[0],
    10: NeutralPalette[10],
    20: NeutralPalette[20],
    25: NeutralPalette[25],
    30: NeutralPalette[30],
    40: NeutralPalette[40],
    50: NeutralPalette[50],
    60: NeutralPalette[60],
    70: NeutralPalette[70],
    80: NeutralPalette[80],
    90: NeutralPalette[90],
    95: NeutralPalette[95],
    99: NeutralPalette[99],
    100: NeutralPalette[100],
  },
  error: {
    0: ErrorPalette[0],
    10: ErrorPalette[10],
    20: ErrorPalette[20],
    30: ErrorPalette[30],
    40: ErrorPalette[40],
    50: ErrorPalette[50],
    60: ErrorPalette[60],
    70: ErrorPalette[70],
    80: ErrorPalette[80],
    90: ErrorPalette[90],
    95: ErrorPalette[95],
    99: ErrorPalette[99],
    100: ErrorPalette[100],
  },
}

export type Theme = 'light' | 'dark'

export const getThemeColors = (theme: Theme) => {
  return MD3ColorScheme[theme]
}
