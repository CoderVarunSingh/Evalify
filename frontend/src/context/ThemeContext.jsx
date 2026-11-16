import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dim',
  setThemeName: () => {},
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dim';
  });

  useEffect(() => {
    // Determine actual DaisyUI theme name to apply
    let daisyTheme = theme;
    if (theme === 'dark') daisyTheme = 'dim';
    if (theme === 'light') daisyTheme = 'corporate';

    document.documentElement.setAttribute('data-theme', daisyTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light' || prev === 'corporate') return 'dim';
      return 'light';
    });
  };

  const setThemeName = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
