import { isBold } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import {
  Badge,
  Heading,
  Link,
  Paragraph,
  Table,
} from "components/documentation";
import type {
  Line,
  Lines,
  ResumeSectionToLines,
  TextItem,
  TextItems,
  TextScores,
} from "lib/parse-resume-from-pdf/types";
import { extractProfile } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile";

export const ResumeParserAlgorithmArticle = ({
  textItems,
  lines,
  sections,
}: {
  textItems: TextItems;
  lines: Lines;
  sections: ResumeSectionToLines;
}) => {
  const getBadgeContent = (item: TextItem) => {
    const X1 = Math.round(item.x);
    const X2 = Math.round(item.x + item.width);
    const Y = Math.round(item.y);
    let content = `X₁=${X1} X₂=${X2} Y=${Y}`;
    if (X1 === X2) {
      content = `X=${X2} Y=${Y}`;
    }
    if (isBold(item)) {
      content = `${content} Bold`;
    }
    if (item.hasEOL) {
      content = `${content} NewLine`;
    }
    return content;
  };
  const step1TextItemsTable = [
    ["#", "Text Content", "Metadata"],
    ...textItems.map((item, idx) => [
      idx + 1,
      item.text,
      <Badge key={idx}>{getBadgeContent(item)}</Badge>,
    ]),
  ];

  const step2LinesTable = [
    ["Lines", "Line Content"],
    ...lines.map((line, idx) => [
      idx + 1,
      line.map((item, idx) => (
        <span key={idx}>
          {item.text}
          {idx !== line.length - 1 && (
            <span className="select-none font-extrabold text-sky-400">
              &nbsp;&nbsp;{"|"}&nbsp;&nbsp;
            </span>
          )}
        </span>
      )),
    ]),
  ];

  const { profile, profileScores } = extractProfile(sections);
  const Scores = ({ scores }: { scores: TextScores }) => {
    return (
      <>
        {scores
          .sort((a, b) => b.score - a.score)
          .map((item, idx) => (
            <span key={idx} className="break-all">
              <Badge>{item.score}</Badge> {item.text}
              <br />
            </span>
          ))}
      </>
    );
  };
  const step4ProfileFeatureScoresTable = [
    [
      "Resume Attribute",
      "Text (Highest Feature Score)",
      "Feature Scores of Other Texts",
    ],
    ["Name", profile.name, <Scores key={"Name"} scores={profileScores.name} />],
    [
      "Email",
      profile.email,
      <Scores key={"Email"} scores={profileScores.email} />,
    ],
    [
      "Phone",
      profile.phone,
      <Scores key={"Phone"} scores={profileScores.phone} />,
    ],
  ];

  return (
    <article className="mt-10">
      <Heading className="text-primary !mt-0 border-t-2 pt-8">
        Resume Parser Algorithm Deep Dive
      </Heading>
      <Paragraph smallMarginTop={true}>
        For the technical curious, this section will dive into the OpenResume
        parser algorithm and walks through the 4 steps on how it works. (Note
        that the algorithm is designed to parse single column resume in English
        language)
      </Paragraph>
      {/* Step 1. Read the text items from a PDF file */}
      <Heading level={2}>Step 1. Read the text items from a PDF file</Heading>
      <Paragraph smallMarginTop={true}>
        A PDF file is a standardized file format defined by the{" "}
        <Link href="https://www.iso.org/standard/51502.html">
          ISO 32000 specification
        </Link>
        . When you open up a PDF file using a text editor, you'll notice that
        the raw content looks encoded and is difficult to read. To display it in
        a readable format, you would need a PDF reader to decode and view the
        file. Similarly, the resume parser first needs to decode the PDF file in
        order to extract its text content.
      </Paragraph>
      <Paragraph>
        While it is possible to write a custom PDF reader function following the
        ISO 32000 specification, it is much simpler to leverage an existing
        library. In this case, the resume parser uses Mozilla's open source{" "}
        <Link href="https://github.com/mozilla/pdf.js">pdf.js</Link> library to
        first extract all the text items in the file.
      </Paragraph>
      <Paragraph>
        The table below lists {textItems.length} text items that are extracted
        from the resume PDF added. A text item contains the text content and
        also some metadata about the content, e.g. its x, y positions in the
        document, whether the font is bolded, or whether it starts a new line.
        (Note that x,y position is relative to the bottom left corner of the
        page, which is the origin 0,0)
      </Paragraph>
      <div className="mt-4 max-h-72 overflow-y-scroll border scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-200 scrollbar-w-3">
        <Table
          table={step1TextItemsTable}
          className="!border-none"
          tdClassNames={["", "", "md:whitespace-nowrap"]}
        />
      </div>
      {/* Step 2. Group text items into lines */}
      <Heading level={2}>Step 2. Group text items into lines</Heading>
      <Paragraph smallMarginTop={true}>
        The extracted text items aren't ready to use yet and have 2 main issues:
      </Paragraph>
      <Paragraph>
        <span className="mt-3 block font-semibold">
          Issue 1: They have some unwanted noises.
        </span>
        Some single text items can get broken into multiple ones, as you might
        observe on the table above, e.g. a phone number "(123) 456-7890" might
        be broken into 3 text items "(123) 456", "-" and "7890".
      </Paragraph>
      <Paragraph smallMarginTop={true}>
        <span className="font-semibold">Solution:</span> To tackle this issue,
        the resume parser connects adjacent text items into one text item if
        their distance is smaller than the average typical character width,
        where
        <span
          dangerouslySetInnerHTML={{
            __html: `<math display="block">
                        <mrow>
                            <mn>Distance </mn>
                            <mo>=</mo>
                            <mn>RightTextItemX₁</mn>
                            <mo>-</mo>
                            <mn>LeftTextItemX₂</mn>
                        </mrow>
                    </math>`,
          }}
          className="my-2 block text-left text-base"
        />
        The average typical character width is calculated by dividing the sum of
        all text items' widths by the total number characters of the text items
        (Bolded texts and new line elements are excluded to not skew the
        results).
      </Paragraph>
      <Paragraph>
        <span className="mt-3 block font-semibold">
          Issue 2: They lack contexts and associations.
        </span>
        When we read a resume, we scan a resume line by line. Our brains can
        process each section via visual cues such as texts' boldness and
        proximity, where we can quickly associate texts closer together to be a
        related group. The extracted text items however currently don't have
        those contexts/associations and are just disjointed elements.
      </Paragraph>
      <Paragraph smallMarginTop={true}>
        <span className="font-semibold">Solution:</span> To tackle this issue,
        the resume parser reconstructs those contexts and associations similar
        to how our brain would read and process the resume. It first groups text
        items into lines since we read text line by line. It then groups lines
        into sections, which will be discussed in the next step.
      </Paragraph>
      <Paragraph>
        At the end of step 2, the resume parser extracts {lines.length} lines
        from the resume PDF added, as shown in the table below. The result is
        much more readable when displayed in lines. (Some lines might have
        multiple text items, which are separated by a blue vertical divider{" "}
        <span className="select-none font-extrabold text-sky-400">
          &nbsp;{"|"}&nbsp;
        </span>
        )
      </Paragraph>
      <div className="mt-4 max-h-96 overflow-y-scroll border scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-200 scrollbar-w-3">
        <Table table={step2LinesTable} className="!border-none" />
      </div>
      {/* Step 3. Group lines into sections */}
      <Heading level={2}>Step 3. Group lines into sections</Heading>
      <Paragraph smallMarginTop={true}>
        At step 2, the resume parser starts building contexts and associations
        to text items by first grouping them into lines. Step 3 continues the
        process to build additional associations by grouping lines into
        sections.
      </Paragraph>
      <Paragraph>
        Note that every section (except the profile section) starts with a
        section title that takes up the entire line. This is a common pattern
        not just in resumes but also in books and blogs. The resume parser uses
        this pattern to group lines into the closest section title above these
        lines.
      </Paragraph>
      <Paragraph>
        The resume parser applies some heuristics to detect a section title. The
        main heuristic to determine a section title is to check if it fulfills
        all 3 following conditions: <br />
        1. It is the only text item in the line <br />
        2. It is <span className="font-bold">bolded</span> <br />
        3. Its letters are all UPPERCASE
        <br />
      </Paragraph>
      <Paragraph>
        In simple words, if a text item is double emphasized to be both bolded
        and uppercase, it is most likely a section title in a resume. This is
        generally true for a well formatted resume. There can be exceptions, but
        it is likely not a good use of bolded and uppercase in those cases.
      </Paragraph>
      <Paragraph>
        The resume parser also has a fallback heuristic if the main heuristic
        doesn't apply. The fallback heuristic mainly performs a keyword matching
        against a list of common resume section title keywords.
      </Paragraph>
      <Paragraph>
        At the end of step 3, the resume parser identifies the sections from the
        resume and groups those lines with the associated section title, as
        shown in the table below. Note that{" "}
        <span className="font-bold">the section titles are bolded</span> and{" "}
        <span className="bg-teal-50">
          the lines associated with the section are highlighted with the same
          colors
        </span>
        .
      </Paragraph>
      <Step3SectionsTable sections={sections} />
      {/* Step 4. Extract resume from sections */}
      <Heading level={2}>Step 4. Extract resume from sections</Heading>
      <Paragraph smallMarginTop={true}>
        Step 4 is the last step of the resume parsing process and is also the
        core of the resume parser, where it extracts resume information from the
        sections.
      </Paragraph>
      <Heading level={3}>Feature Scoring System</Heading>
      <Paragraph smallMarginTop={true}>
        The gist of the extraction engine is a feature scoring system. Each
        resume attribute to be extracted has a custom feature sets, where each
        feature set consists of a feature matching function and a feature
        matching score if matched (feature matching score can be a positive or
        negative number). To compute the final feature score of a text item for
        a particular resume attribute, it would run the text item through all
        its feature sets and sum up the matching feature scores. This process is
        carried out for all text items within the section, and the text item
        with the highest computed feature score is identified as the extracted
        resume attribute.
      </Paragraph>
      <Paragraph>
        As a demonstration, the table below shows 3 resume attributes in the
        profile section of the resume PDF added.
      </Paragraph>
      <Table table={step4ProfileFeatureScoresTable} className="mt-4" />
      {(profileScores.name.find((item) => item.text === profile.name)?.score ||
        0) > 0 && (
        <Paragraph smallMarginTop={true}>
          In the resume PDF added, the resume attribute name is likely to be "
          {profile.name}" since its feature score is{" "}
          {profileScores.name.find((item) => item.text === profile.name)?.score}
          , which is the highest feature score out of all text items in the
          profile section. (Some text items' feature scores can be negative,
          indicating they are very unlikely to be the targeted attribute)
        </Paragraph>
      )}
      <Heading level={3}>Feature Sets</Heading>
      <Paragraph smallMarginTop={true}>
        Having explained the feature scoring system, we can dive more into how
        feature sets are constructed for a resume attribute. It follows 2
        principles: <br />
        1. A resume attribute's feature sets are designed relative to all other
        resume attributes within the same section. <br />
        2. A resume attribute's feature sets are manually crafted based on its
        characteristics and likelihood of each characteristic.
      </Paragraph>
      <Paragraph>
        The table below lists some of the feature sets for the resume attribute
        name. It contains feature function that matches the name attribute with
        positive feature score and also feature function that only matches other
        resume attributes in the section with negative feature score.
      </Paragraph>
      <Table
        table={step4NameFeatureSetsTable}
        title="Name Feature Sets"
        className="mt-4"
      />
      <Heading level={3}>Core Feature Function</Heading>
      <Paragraph smallMarginTop={true}>
        Each resume attribute has multiple feature sets. They can be found in
        the source code under the extract-resume-from-sections folder and we
        won't list them all out here. Each resume attribute usually has a core
        feature function that greatly identifies them, so we will list out the
        core feature function below.
      </Paragraph>
      <Table table={step4CoreFeatureFunctionTable} className="mt-4" />
      <Heading level={3}>Special Case: Subsections</Heading>
      <Paragraph smallMarginTop={true}>
        The last thing that is worth mentioning is subsections. For profile
        section, we can directly pass all the text items to the feature scoring
        systems. But for other sections, such as education and work experience,
        we have to first divide the section into subsections since there can be
        multiple schools or work experiences in the section. The feature scoring
        system then process each subsection to retrieve each's resume attributes
        and append the results.
      </Paragraph>
      <Paragraph smallMarginTop={true}>
        The resume parser applies some heuristics to detect a subsection. The
        main heuristic to determine a subsection is to check if the vertical
        line gap between 2 lines is larger than the typical line gap * 1.4,
        since a well formatted resume usually creates a new empty line break
        before adding the next subsection. There is also a fallback heuristic if
        the main heuristic doesn't apply to check if the text item is bolded.
      </Paragraph>
      <Paragraph>
        And that is everything about the OpenResume parser algorithm :)
      </Paragraph>
      <Paragraph>
        Written by <Link href="https://github.com/xitanggg">Xitang</Link> on
        June 2023
      </Paragraph>
    </article>
  );
};

const step4NameFeatureSetsTable = [
  ["Feature Function", "Feature Matching Score"],
  ["Contains only letters, spaces or periods", "+3"],
  ["Is bolded", "+2"],
  ["Contains all uppercase letters", "+2"],
  ["Contains @", "-4 (match email)"],
  ["Contains number", "-4 (match phone)"],
  ["Contains ,", "-4 (match address)"],
  ["Contains /", "-4 (match url)"],
];

const step4CoreFeatureFunctionTable = [
  ["Resume Attribute", "Core Feature Function", "Regex"],
  ["Name", "Contains only letters, spaces or periods", "/^[a-zA-Z\\s\\.]+$/"],
  [
    "Email",
    <>
      Match email format xxx@xxx.xxx
      <br />
      xxx can be anything not space
    </>,
    "/\\S+@\\S+\\.\\S+/",
  ],
  [
    "Phone",
    <>
      Match phone format (xxx)-xxx-xxxx <br /> () and - are optional
    </>,
    "/\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}/",
  ],
  [
    "Location",
    <>Match city and state format {"City, ST"}</>,
    "/[A-Z][a-zA-Z\\s]+, [A-Z]{2}/",
  ],
  ["Url", "Match url format xxx.xxx/xxx", "/\\S+\\.[a-z]+\\/\\S+/"],
  ["School", "Contains a school keyword, e.g. College, University, School", ""],
  ["Degree", "Contains a degree keyword, e.g. Associate, Bachelor, Master", ""],
  ["GPA", "Match GPA format x.xx", "/[0-4]\\.\\d{1,2}/"],
  [
    "Date",
    "Contains date keyword related to year, month, seasons or the word Present",
    "Year: /(?:19|20)\\d{2}/",
  ],
  [
    "Job Title",
    "Contains a job title keyword, e.g. Analyst, Engineer, Intern",
    "",
  ],
  ["Company", "Is bolded or doesn't match job title & date", ""],
  ["Project", "Is bolded or doesn't match date", ""],
];

const Step3SectionsTable = ({
  sections,
}: {
  sections: ResumeSectionToLines;
}) => {
  const table: React.ReactNode[][] = [["Lines", "Line Content"]];
  const trClassNames = [];
  let lineCounter = 0;
  const BACKGROUND_COLORS = [
    "bg-red-50",
    "bg-yellow-50",
    "bg-orange-50",
    "bg-green-50",
    "bg-blue-50",
    "bg-purple-50",
  ] as const;
  const sectionsEntries = Object.entries(sections);

  const Line = ({ line }: { line: Line }) => {
    return (
      <>
        {line.map((item, idx) => (
          <span key={idx}>
            {item.text}
            {idx !== line.length - 1 && (
              <span className="select-none font-extrabold text-sky-400">
                &nbsp;&nbsp;{"|"}&nbsp;&nbsp;
              </span>
            )}
          </span>
        ))}
      </>
    );
  };

  for (let i = 0; i < sectionsEntries.length; i++) {
    const sectionBackgroundColor = BACKGROUND_COLORS[i % 6];
    const [sectionTitle, lines] = sectionsEntries[i];
    table.push([
      sectionTitle === "profile" ? "" : lineCounter,
      sectionTitle === "profile" ? "PROFILE" : sectionTitle,
    ]);
    trClassNames.push(`${sectionBackgroundColor} font-bold`);
    lineCounter += 1;
    for (let j = 0; j < lines.length; j++) {
      table.push([lineCounter, <Line key={lineCounter} line={lines[j]} />]);
      trClassNames.push(sectionBackgroundColor);
      lineCounter += 1;
    }
  }

  return (
    <div className="mt-4 max-h-96 overflow-y-scroll border scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-200 scrollbar-w-3">
      <Table
        table={table}
        className="!border-none"
        trClassNames={trClassNames}
      />
    </div>
  );
};
