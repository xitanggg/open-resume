import { store, type RootState } from "lib/redux/store";
import { resetResume } from "./resumeSlice";

// Reference: https://dev.to/igorovic/simplest-way-to-persist-redux-state-to-localstorage-e67

const LOCAL_STORAGE_KEY = "open-resume-state";

export const loadStateFromLocalStorage = () => {
  try {
    const stringifiedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stringifiedState) return undefined;
    return JSON.parse(stringifiedState);
  } catch (e) {
    return undefined;
  }
};

export const saveStateToLocalStorage = (state: RootState) => {
  try {
    const stringifiedState = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, stringifiedState);
  } catch (e) {
    // Ignore
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.log(localStorage.getItem(LOCAL_STORAGE_KEY),"sss");

    store.dispatch(resetResume());
    
  } catch (e) {
    // Ignore
  }
};

export const getHasUsedAppBefore = () => Boolean(loadStateFromLocalStorage());
