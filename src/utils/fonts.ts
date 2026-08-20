/**
 * Font family names.
 *
 * The string values are the PostScript names of the bundled font files
 * (see assets/fonts). On iOS RN resolves a font by its PostScript name and on
 * Android by the file name — the bundled files are named identically to their
 * PostScript name, so the same value works on both platforms.
 *
 * Every weight bundled in assets/fonts (and linked on both platforms via
 * react-native.config.js / Info.plist / Android assets/fonts) has a matching
 * entry here. Weight suffix convention: 100 Thin, 300 Light, 400 Regular,
 * 500 Medium, 600 Semibold, 700 Bold, 900 Black.
 */
export const fonts = {
  Lato100: 'Lato-Thin',
  Lato100Italic: 'Lato-ThinItalic',
  Lato300: 'Lato-Light',
  Lato300Italic: 'Lato-LightItalic',
  Lato400: 'Lato-Regular',
  Lato400Italic: 'Lato-Italic',
  Lato500: 'Lato-Medium',
  Lato500Italic: 'Lato-MediumItalic',
  Lato600: 'Lato-Semibold',
  Lato600Italic: 'Lato-SemiboldItalic',
  Lato700: 'Lato-Bold',
  Lato700Italic: 'Lato-BoldItalic',
  Lato900: 'Lato-Black',
  Lato900Italic: 'Lato-BlackItalic',

  // Display serif used for the "Slottley" wordmark only.
  CormorantGaramondBold: 'CormorantGaramond-Bold',
} as const;

export type FontKey = keyof typeof fonts;
