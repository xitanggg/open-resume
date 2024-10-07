import { Paragraph, TextRun, AlignmentType } from "docx";

// Define the props type for the ResumeDocxWorkExperience
export interface ResumeWorkExperience {
  company: string;
  jobTitle: string;
  date: string;
  descriptions: string[];
}

export interface ResumeDocxWorkExperienceProps {
  experiences: ResumeWorkExperience[];
}

const ResumeDocxWorkExperience = ({
  experiences,
}: ResumeDocxWorkExperienceProps) => {
  const experienceElements: (Paragraph | undefined)[] = [];

  // Add a line break after each experience entry
  experienceElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Add heading for Work Experience
  experienceElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Work Experience:",
          bold: true,
          color: "000000",
          size: 24, // Size for the heading
        }),
      ],
      alignment: AlignmentType.START, // Align heading to the start
    })
  );

  // Add a line break after the heading
  experienceElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Loop through experiences and create paragraphs for each
  experiences.forEach((exp) => {
    // Company Name
    experienceElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: exp.company,
            bold: true,
            color: "000000",
            italics:true,
            size: 22, // Size for company name
          }),
        ],
        alignment: AlignmentType.LEFT, // Align company name to the left
      })
    );

    // Job Title and Date in the next line
    experienceElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${exp.jobTitle} | `, // Job Title
            color: "000000", // Black color for job title
            italics:true,
            size: 22,
          }),
          new TextRun({
            text: exp.date, // Date
            color: "000000", // Black color for date
            italics:true,
            size: 22,
          }),
        ],
        alignment: AlignmentType.LEFT, // Align job title and date to the left
      })
    );

    // Add a line break after the heading
    experienceElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );

    // Descriptions
    exp.descriptions.forEach((desc) => {
      experienceElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${desc}`, // Bullet point for each description
              size: 22,
              color: "000000",
            }),
          ],
          alignment: AlignmentType.LEFT, // Left-align the description
        })
      );
    });

    // Add a line break after each experience entry
    experienceElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );
  });

  // Return the elements as an array of Paragraphs
  return experienceElements.filter(Boolean) as Paragraph[];
};

export default ResumeDocxWorkExperience;
