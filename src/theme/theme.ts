export const colors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  primary: '#2F7A54',
  primaryDark: '#22593D',
  primarySoft: '#E4F1E9',
  text: '#2A2A28',
  textMuted: '#7A776E',
  border: '#EDE8DE',
  chipBackground: '#F3EEE3',
  chipSelectedBackground: '#2F7A54',
  chipSelectedText: '#FFFFFF',
  danger: '#C24E4E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 30,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: colors.textMuted,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
};
