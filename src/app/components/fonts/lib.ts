"use client";
import {
  ENGLISH_FONT_FAMILIES,
  NON_ENGLISH_FONT_FAMILIES,
  NON_ENGLISH_FONT_FAMILY_TO_LANGUAGE,
} from "components/fonts/constants";

/**
 * getPreferredNonEnglishFontFamilies returns non-english font families that are included in
 * user's preferred languages. This is to avoid loading fonts/languages that users won't use.
 */
const getPreferredNonEnglishFontFamilies = () => {
  return NON_ENGLISH_FONT_FAMILIES.filter((fontFamily) => {
    const fontLanguages = NON_ENGLISH_FONT_FAMILY_TO_LANGUAGE[fontFamily];
    const userPreferredLanguages = navigator.languages ?? [navigator.language];
    return userPreferredLanguages.some((preferredLanguage) =>
      fontLanguages.includes(preferredLanguage)
    );
  });
};

export const getAllFontFamiliesToLoad = () => {
  return [...ENGLISH_FONT_FAMILIES, ...getPreferredNonEnglishFontFamilies()];
};
