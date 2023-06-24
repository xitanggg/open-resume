/**
 * Adding a new font family needs to keep "public\fonts\fonts.css" in sync
 *
 * The followings are handled automatically once the font family name is added to the variable arrays
 * 1. It would register font family for React PDF at "components\Resume\ResumePDF\styles.ts"
 * 2. It would load font family for React PDF Iframe at "components\Resume\ResumeIFrame.tsx"
 * 3. It would add font family selection to Resume Settings at "components\ResumeForm\ThemeForm.tsx"
 *
 * One caveat while adding a new google font is that sometimes the font doesn't work with React PDF:
 * https://github.com/diegomura/react-pdf/issues/915. The solution is to re-export the font with fontforge.
 * ./fontforge -lang=ff -c 'Open($1); Generate($2); Close();' old_font.ttf new_font.ttf
 * (Note that some fonts might still not work after export.)
 */
export const SANS_SERI_FONT_FAMILIES = [
  "Roboto",
  "Lato",
  "Montserrat",
  "OpenSans",
  "Raleway",
] as const;

export const SERI_FONT_FAMILIES = [
  "Caladea",
  "Lora",
  "RobotoSlab",
  "PlayfairDisplay",
  "Merriweather",
] as const;

export const FONT_FAMILIES = [
  ...SANS_SERI_FONT_FAMILIES,
  ...SERI_FONT_FAMILIES,
];

export type FontFamily = (typeof FONT_FAMILIES)[number];

export const FONT_FAMILY_TO_STANDARD_SIZE_IN_PT: Record<FontFamily, number> = {
  Roboto: 11,
  Lato: 11,
  Montserrat: 10,
  OpenSans: 10,
  Raleway: 10,
  Caladea: 11,
  Lora: 11,
  RobotoSlab: 10,
  PlayfairDisplay: 10,
  Merriweather: 10,
};
