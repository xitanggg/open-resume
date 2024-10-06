import { Paragraph, TextRun, AlignmentType } from "docx";

// Define the props type for the ResumeDocxProjects
export interface ResumeProject {
  project: string;
  date: string;
  descriptions: string[];
}

export interface ResumeDocxProjectsProps {
  projects: ResumeProject[];
}

const ResumeDocxProjects = ({ projects }: ResumeDocxProjectsProps) => {
  const projectElements: (Paragraph | undefined)[] = [];

  // Add a line break before the projects section
  projectElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Add heading for Projects
  projectElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Projects:",
          bold: true,
          color: "000000",
          size: 24, // Size for the heading
        }),
      ],
      alignment: AlignmentType.START, // Align heading to the start
    })
  );

  // Add a line break after the heading
  projectElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Loop through project entries and create paragraphs for each
  projects.forEach((proj) => {
    // Project Title
    projectElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: proj.project,
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
    projectElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: proj.date, // Date for the project
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
    projectElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );

    // Descriptions (details about the project)
    proj.descriptions.forEach((desc) => {
      projectElements.push(
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
    projectElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );
  });

  // Return the elements as an array of Paragraphs
  return projectElements.filter(Boolean) as Paragraph[];
};

export default ResumeDocxProjects;
