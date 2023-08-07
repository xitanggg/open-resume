/**
 * Adding a new font family involves 4 steps:
 * Step 1. Add it to one of the below FONT_FAMILIES variable array:
 *         English fonts -> SANS_SERIF_ENGLISH_FONT_FAMILIES or SERIF_ENGLISH_FONT_FAMILIES
 *         Non-English fonts -> NON_ENGLISH_FONT_FAMILIES
 *         Once the font is added, it would take care of
 *         a. Registering font family for React PDF at "components/fonts/hooks.tsx"
 *         b. Loading font family for React PDF iframe at "components/Resume/ResumeIFrame.tsx"
 *         c. Adding font family selection to Resume Settings at "components/ResumeForm/ThemeForm/Selection.tsx"
 * Step 2. To load css correctly for the Resume Form:
 *         English fonts -> add it to the "public\fonts\fonts.css" file
 *         Non-English fonts -> create/update "public\fonts\fonts-<language>.css" and update "components/fonts/NonEnglishFontsCSSLazyLoader.tsx"
 * Step 3. Update FONT_FAMILY_TO_STANDARD_SIZE_IN_PT and FONT_FAMILY_TO_DISPLAY_NAME accordingly
 * Step 4. Update "public/fonts/OFL.txt" to include the new font family and credit the font creator
 *
 * IMPORTANT NOTE:
 * One major problem with adding a new font family is that most font family doesn't work with
 * React PDF out of box. The texts would appear fine in the PDF, but copying and pasting them
 * would result in different texts. See issues: https://github.com/diegomura/react-pdf/issues/915
 * and https://github.com/diegomura/react-pdf/issues/629
 *
 * A solution to this problem is to import and re-export the font with a font editor, e.g. fontforge or birdfont.
 *
 * If using fontforge, the following command can be used to export the font:
 * ./fontforge -lang=ff -c 'Open($1); Generate($2); Close();' old_font.ttf new_font.ttf
 * Note that fontforge doesn't work on non-english fonts: https://github.com/fontforge/fontforge/issues/1534
 * Also, some fonts might still not work after re-export.
 */

const SANS_SERIF_ENGLISH_FONT_FAMILIES = [
  "Roboto",
  "Lato",
  "Montserrat",
  "OpenSans",
  "Raleway",
] as const;

const SERIF_ENGLISH_FONT_FAMILIES = [
  "Caladea",
  "Lora",
  "RobotoSlab",
  "PlayfairDisplay",
  "Merriweather",
] as const;

export const ENGLISH_FONT_FAMILIES = [
  ...SANS_SERIF_ENGLISH_FONT_FAMILIES,
  ...SERIF_ENGLISH_FONT_FAMILIES,
];
type EnglishFontFamily = (typeof ENGLISH_FONT_FAMILIES)[number];

export const NON_ENGLISH_FONT_FAMILIES = ["NotoSansSC"] as const;
type NonEnglishFontFamily = (typeof NON_ENGLISH_FONT_FAMILIES)[number];

export const NON_ENGLISH_FONT_FAMILY_TO_LANGUAGE: Record<
  NonEnglishFontFamily,
  string[]
> = {
  NotoSansSC: ["zh", "zh-CN", "zh-TW"],
};

export type FontFamily = EnglishFontFamily | NonEnglishFontFamily;
export const FONT_FAMILY_TO_STANDARD_SIZE_IN_PT: Record<FontFamily, number> = {
  // Sans Serif Fonts
  Roboto: 11,
  Lato: 11,
  Montserrat: 10,
  OpenSans: 10,
  Raleway: 10,
  // Serif Fonts
  Caladea: 11,
  Lora: 11,
  RobotoSlab: 10,
  PlayfairDisplay: 10,
  Merriweather: 10,
  // Non-English Fonts
  NotoSansSC: 11,
};

export const FONT_FAMILY_TO_DISPLAY_NAME: Record<FontFamily, string> = {
  // Sans Serif Fonts
  Roboto: "Roboto",
  Lato: "Lato",
  Montserrat: "Montserrat",
  OpenSans: "Open Sans",
  Raleway: "Raleway",
  // Serif Fonts
  Caladea: "Caladea",
  Lora: "Lora",
  RobotoSlab: "Roboto Slab",
  PlayfairDisplay: "Playfair Display",
  Merriweather: "Merriweather",
  // Non-English Fonts
  NotoSansSC: "思源黑体(简体)",
};
