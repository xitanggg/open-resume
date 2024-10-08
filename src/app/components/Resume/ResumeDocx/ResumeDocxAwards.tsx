import { Paragraph, TextRun, AlignmentType } from "docx";

// Define the props type for the ResumeDocxProjects
export interface ResumeAward {
  award: string;
  date: string;
  descriptions: string[];
}

export interface ResumeDocxAwardsProps {
  awards: ResumeAward[];
}

const ResumeDocxAwards = ({ awards }: ResumeDocxAwardsProps) => {
  const awardElements: (Paragraph | undefined)[] = [];

  // Add a line break before the projects section
  awardElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Add heading for Projects
  awardElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Awards:",
          bold: true,
          color: "000000",
          size: 24, // Size for the heading
        }),
      ],
      alignment: AlignmentType.START, // Align heading to the start
    })
  );

  // Add a line break after the heading
  awardElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Loop through project entries and create paragraphs for each
  awards.forEach((awar) => {
    // Project Title
    awardElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: awar.award,
            bold: true,
            color: "000000",
            size: 22,
            italics: true,
          }),
        ],
        alignment: AlignmentType.START, // Align project title to the start
      })
    );

    // Date on the right
    awardElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: awar.date, // Date for the project
            color: "000000", // Color for the date
            size: 20,
            italics: true,
            bold: true,
          }),
        ],
        alignment: AlignmentType.START, // Align the date to the end
      })
    );

    // Add a line break
    awardElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );

    // Descriptions (details about the project)
    awar.descriptions.forEach((desc) => {
      awardElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${desc}`, // Bullet point for each description
              size: 20,
              color: "000000",
            }),
          ],
          alignment: AlignmentType.LEFT, // Left-align the descriptions
        })
      );
    });

    // Add a line break after each project entry
    awardElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );
  });

  // Return the elements as an array of Paragraphs
  return awardElements.filter(Boolean) as Paragraph[];
};

export default ResumeDocxAwards;
