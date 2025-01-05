import { Settings, ShowForm } from "lib/redux/settingsSlice";
import { Resume } from "lib/redux/types";

export interface ResumePDFProps {
  resume: Resume;
  settings: Settings;
  themeColor: string;
  showFormsOrder: ShowForm[];
  isPDF?: boolean;
}

export type ThemeComponent = React.ComponentType<ResumePDFProps>;
