import { THEMES } from "./constants";

export const getAllThemesAvailable = () => {
  return Object.keys(THEMES);
};

export const getTheme = (theme: string) => {
  return THEMES[theme];
};
