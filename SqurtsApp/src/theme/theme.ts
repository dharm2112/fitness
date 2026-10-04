export const colors = {
  primary: '#ab3500',
  primaryContainer: '#ff6b35',
  onPrimary: '#ffffff',
  secondary: '#006a62',
  secondaryContainer: '#70f8e8',
  onSecondaryContainer: '#007168',
  background: '#fff8f6',
  surface: '#fff8f6',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#fff1ed',
  surfaceContainer: '#ffe9e3',
  surfaceContainerHigh: '#fde3db',
  surfaceVariant: '#f7ddd5',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  textMain: '#1D1E2C',
  textMuted: '#6E7284',
  outline: '#8d7168',
  outlineVariant: '#e1bfb5',
  inverseSurface: '#3c2d28',
};

export const typography = {
  headlineLg: { fontSize: 36, fontWeight: '700' as const, lineHeight: 44, letterSpacing: -0.5 },
  headlineMd: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  headlineSm: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  bodyLg: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodyMd: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  labelLg: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  labelMd: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelSm: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.5 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export const rounded = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};
