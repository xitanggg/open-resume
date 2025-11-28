import {
  matchOnlyLetterSpaceOrPeriod,
  matchEmail,
  matchPhone,
  matchUrl,
  matchGithub,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile";
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

  it("Github", () => {
    expect(matchGithub(makeTextItem("  github.com/open-resume  "))![0]).toBe(
      "github.com/open-resume"
    );
  });
});
