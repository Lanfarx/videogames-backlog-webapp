/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primaryBg: 'rgb(var(--primary-bg))',
        secondaryBg: 'rgb(var(--secondary-bg))',
        tertiaryBg: 'rgb(var(--tertiary-bg))',
        accentPrimary: 'rgb(var(--accent-primary))',
        accentSecondary: 'rgb(var(--accent-secondary))',
        accentSuccess: 'rgb(var(--accent-success))',
        accentLightSuccess: 'rgb(var(--accent-light-success))',
        accentDanger: 'rgb(var(--accent-danger))',
        accentPlatinum: 'rgb(var(--accent-platinum))',
        textPrimary: 'rgb(var(--text-primary))',
        textSecondary: 'rgb(var(--text-secondary))',
        textDisabled: 'rgb(var(--text-disabled))',
        borderColor: 'rgb(var(--border-color))',
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        primaryBg: 'rgb(var(--primary-bg))',
        secondaryBg: 'rgb(var(--secondary-bg))',
        tertiaryBg: 'rgb(var(--tertiary-bg))',
      }),
      textColor: theme => ({
        ...theme('colors'),
        textPrimary: 'rgb(var(--text-primary))',
        textSecondary: 'rgb(var(--text-secondary))',
        textDisabled: 'rgb(var(--text-disabled))',
      }),
      borderColor: theme => ({
        ...theme('colors'),
        borderColor: 'rgb(var(--border-color))',
      }),
    },
  },
  plugins: [],
};
