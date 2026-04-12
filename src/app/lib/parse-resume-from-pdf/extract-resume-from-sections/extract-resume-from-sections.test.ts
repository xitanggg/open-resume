import {
  matchOnlyLetterSpaceOrPeriod,
  matchEmail,
  matchPhone,
  matchLocation,
  matchUrl,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile";
import { matchGPA } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-education";
import { sanitizeProjectName } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-project";
import type { TextItem } from "lib/parse-resume-from-pdf/types";

const makeTextItem = (text: string) =>
  ({
    text,
  } as TextItem);

describe("extract-profile tests - ", () => {
  it("Name", () => {
    expect(
      matchOnlyLetterSpaceOrPeriod(makeTextItem("Leonardo W. DiCaprio"))![0]
    ).toBe("Leonardo W. DiCaprio");
  });

  it("Email", () => {
    expect(matchEmail(makeTextItem("  hello@open-resume.org  "))![0]).toBe(
      "hello@open-resume.org"
    );
  });

  it("Phone", () => {
    expect(matchPhone(makeTextItem("  (123)456-7890  "))![0]).toBe(
      "(123)456-7890"
    );
  });

  it("Url", () => {
    expect(matchUrl(makeTextItem("  linkedin.com/in/open-resume  "))![0]).toBe(
      "linkedin.com/in/open-resume"
    );
    expect(matchUrl(makeTextItem("hello@open-resume.org"))).toBeFalsy();
  });

  it("Location in mixed contact line", () => {
    expect(
      matchLocation(
        makeTextItem("Bengaluru, India | +91 9876543210 | linkedin.com/in/open")
      )?.[0]
    ).toBe("Bengaluru, India");
    expect(
      matchLocation(makeTextItem("San Francisco, CA \u2022 (123) 456-7890"))?.[0]
    ).toBe("San Francisco, CA");
  });

  it("GPA labeled and scaled formats", () => {
    expect(matchGPA(makeTextItem("GPA: 3.86/4.00"))?.[0]).toBe("3.86/4.00");
    expect(matchGPA(makeTextItem("CGPA - 8.7/10"))?.[0]).toBe("8.7/10");
  });

  it("Project name strips embedded link", () => {
    expect(
      sanitizeProjectName("OpenResume https://open-resume.com", "")
    ).toBe("OpenResume");
  });

  it("Project name strips description text", () => {
    expect(
      sanitizeProjectName(
        "OpenResume - Built an ATS-aware resume builder used by students",
        ""
      )
    ).toBe("OpenResume");
    expect(
      sanitizeProjectName(
        "OpenResume | Built an ATS-aware resume builder used by students",
        ""
      )
    ).toBe("OpenResume");
  });
});
