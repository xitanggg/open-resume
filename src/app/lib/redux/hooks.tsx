import { useEffect } from "react";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { store, type RootState, type AppDispatch } from "lib/redux/store";
import {
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import { initialResumeState, setResume } from "lib/redux/resumeSlice";
import {
  initialSettings,
  setSettings,
  type Settings,
} from "lib/redux/settingsSlice";
import { deepMerge } from "lib/deep-merge";
import type { Resume } from "lib/redux/types";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook to save store to local storage on store change
 */
export const useSaveStateToLocalStorageOnChange = () => {
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      saveStateToLocalStorage(store.getState());
    });
    return unsubscribe;
  }, []);
};

export const useSetInitialStore = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const state = loadStateFromLocalStorage();
    if (!state) return;
    if (state.resume) {
      const mergedResumeState = deepMerge(
        initialResumeState,
        state.resume
      ) as Resume;
      dispatch(setResume(mergedResumeState));

      if (state.settings) {
        const mergedSettingsState = deepMerge(
          initialSettings,
          state.settings
        ) as Settings;

        // Ensure customSections from resume are present in settings
        if (mergedResumeState.customSections && mergedResumeState.customSections.length > 0) {
          for (const section of mergedResumeState.customSections) {
            if (!mergedSettingsState.formToShow[section.id]) {
              mergedSettingsState.formToShow[section.id] = true;
            }
            if (!mergedSettingsState.formToHeading[section.id]) {
              mergedSettingsState.formToHeading[section.id] = (section as any).heading || "CUSTOM SECTION";
            }
            if (!mergedSettingsState.formsOrder.includes(section.id)) {
              mergedSettingsState.formsOrder.push(section.id);
            }
          }
        }

        dispatch(setSettings(mergedSettingsState));
      }
    } else if (state.settings) {
      const mergedSettingsState = deepMerge(
        initialSettings,
        state.settings
      ) as Settings;
      dispatch(setSettings(mergedSettingsState));
    }
  }, []);
};
