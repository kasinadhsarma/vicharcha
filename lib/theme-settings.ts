export interface ThemeColor {
  id: string;
  name: string;
  isCustom?: boolean;
  colors: Record<string, string>;
}

export type ColorTheme = {
  id: string;
  name: string;
  colors: Record<string, string>;
  isCustom?: boolean;
};

function generateColors(baseHue: number): Record<string, string> {
  return {
    background: `hsl(${baseHue}, 20%, 98%)`,
    text: `hsl(${baseHue}, 15%, 15%)`,
    primary: `hsl(${baseHue}, 65%, 50%)`,
    secondary: `hsl(${baseHue}, 40%, 65%)`
  };
}

export function createCustomTheme(name: string, colors: Record<string, string>): ColorTheme;
export function createCustomTheme(id: string, name: string, baseHue: number): ColorTheme;
export function createCustomTheme(
  idOrName: string,
  nameOrColors: string | Record<string, string>,
  baseHue?: number
): ColorTheme {
  if (baseHue !== undefined && typeof nameOrColors === 'string') {
    return {
      id: idOrName,
      name: nameOrColors,
      colors: generateColors(baseHue),
      isCustom: true
    };
  }
  
  return {
    id: `custom-${Date.now()}`,
    name: idOrName,
    colors: nameOrColors as Record<string, string>,
    isCustom: true
  };
}

export const defaultThemes: ColorTheme[] = [
  {
    id: "light",
    name: "Light",
    colors: {
      background: "#ffffff",
      text: "#000000",
      primary: "#007bff",
      secondary: "#6c757d"
    }
  },
  {
    id: "dark",
    name: "Dark",
    colors: {
      background: "#1a1a1a",
      text: "#ffffff", 
      primary: "#0d6efd",
      secondary: "#6c757d"
    }
  }
];

export type ThemeSettings = {
  colorTheme: string;
};
