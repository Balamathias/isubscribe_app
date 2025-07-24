// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { colorScheme } from 'nativewind';
// import React, { createContext, useContext, useEffect, useState } from 'react';

// type ThemeMode = 'auto' | 'light' | 'dark';

// interface ThemeContextType {
//   themeMode: ThemeMode;
//   currentTheme: 'light' | 'dark';
//   setThemeMode: (mode: ThemeMode) => void;
// }

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// const THEME_STORAGE_KEY = '@isubscribe_theme_mode';

// export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const systemColorScheme = colorScheme;
//   const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  
//   const currentTheme: 'light' | 'dark' = 
//     themeMode === 'auto' 
//       ? (systemColorScheme.get() || 'light') 
//       : themeMode === 'dark' 
//         ? 'dark' 
//         : 'light';

//   useEffect(() => {
//     const loadThemeMode = async () => {
//       try {
//         const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
//         if (savedMode && ['auto', 'light', 'dark'].includes(savedMode)) {
//           setThemeModeState(savedMode as ThemeMode);
//         }
//       } catch (error) {
//         console.error('Error loading theme mode:', error);
//       }
//     };
    
//     loadThemeMode();
//   }, []);

//   const setThemeMode = async (mode: ThemeMode) => {
//     try {
//       setThemeModeState(mode);
//       await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
//     } catch (error) {
//       console.error('Error saving theme mode:', error);
//     }
//   };

//   return (
//     <ThemeContext.Provider value={{ themeMode, currentTheme, setThemeMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (context === undefined) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };
