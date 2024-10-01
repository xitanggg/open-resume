import { ResumePDFDefault } from "./default";
import { ResumePDFMinimal } from "./minimal";
import { ThemeComponent } from "./types";

export const THEMES: Record<string, ThemeComponent> = {
  "default": ResumePDFDefault,
  "minimal": ResumePDFMinimal
};
