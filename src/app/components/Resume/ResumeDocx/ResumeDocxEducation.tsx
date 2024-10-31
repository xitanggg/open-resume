import { Paragraph, TextRun, AlignmentType } from "docx";

// Define the props type for the ResumeDocxEducation
export interface ResumeEducation {
  school: string;
  degree: string;
  date: string;
  gpa: string;
  descriptions: string[];
}

export interface ResumeDocxEducationProps {
  education: ResumeEducation[];
}

const ResumeDocxEducation = ({ education }: ResumeDocxEducationProps) => {
  const educationElements: (Paragraph | undefined)[] = [];

  // Add a line break after each education entry
  educationElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Add heading for Education
  educationElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Education:",
          bold: true,
          color: "000000",
          size: 24, // Size for the heading
        }),
      ],
      alignment: AlignmentType.START, // Align heading to the start
    })
  );

  // Add a line break after the heading
  educationElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Loop through education entries and create paragraphs for each
  education.forEach((edu) => {
    // School Name
    educationElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: edu.school,
            bold: true,
            color: "000000",
            size: 22,
            italics: true,
          }),
        ],
        alignment: AlignmentType.START, // Align school name to the start
      })
    );

    // Degree and GPA on the left, Date on the right
    educationElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${edu.degree} | GPA: ${edu.gpa} | `, // Degree and GPA on the left
            color: "000000",
            size: 20,
            italics: true,
            bold: true,
          }),
          new TextRun({
            text: edu.date, // Date on the right
            color: "000000", // Color for the date
            size: 20,
            italics: true,
            bold: true,
          }),
        ],
        alignment: AlignmentType.LEFT, // Align to the left overall
      })
    );

    educationElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );

    // Descriptions (achievements or coursework)
    edu.descriptions.forEach((desc) => {
      educationElements.push(
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

    // Add a line break after each education entry
    educationElements.push(
      new Paragraph({ children: [new TextRun({ text: "" })] })
    );
  });

  // Return the elements as an array of Paragraphs
  return educationElements.filter(Boolean) as Paragraph[];
};

export default ResumeDocxEducation;
