/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        'primaryBg': 'rgb(var(--primary-bg))',
        'secondaryBg': 'rgb(var(--secondary-bg))',
        'tertiaryBg': 'rgb(var(--tertiary-bg))',
        
        // Accent colors
        'accent-primary': 'rgb(var(--accent-primary))',
        'accent-secondary': 'rgb(var(--accent-secondary))',
        'accent-success': 'rgb(var(--accent-success))',
        'accent-light-success': 'rgb(var(--accent-light-success))',
        'accent-danger': 'rgb(var(--accent-danger))',
        'accent-platinum': 'rgb(var(--accent-platinum))',
        
        // Text colors
        'text-primary': 'rgb(var(--text-primary))',
        'text-secondary': 'rgb(var(--text-secondary))',
        'text-disabled': 'rgb(var(--text-disabled))',
        
        // Other
        'border-color': 'rgb(var(--border-color))',
      },
      fontFamily: {
        'primary': 'var(--font-primary)',
        'secondary': 'var(--font-secondary)',
      },
      backgroundColor: {
        // Ensure we have access to all the colors defined above
      },
      textColor: {
        // Ensure we have access to all the colors defined above
      },
      borderColor: {
        // Ensure we have access to all the colors defined above
      },
    },
  },
  plugins: [],
};
