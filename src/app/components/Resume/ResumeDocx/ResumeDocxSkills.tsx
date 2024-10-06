import { Paragraph, TextRun, AlignmentType } from "docx";

// Define the interface for FeaturedSkill
export interface FeaturedSkill {
  skill: string;
  rating: number; // Numeric rating, e.g., out of 5
}

// Define the props type for the ResumeSkills
export interface ResumeSkills {
  featuredSkills: FeaturedSkill[];
  descriptions: string[];
}

export interface ResumeDocxSkillsProps {
  skills: ResumeSkills;
}

const ResumeDocxSkills = ({ skills }: ResumeDocxSkillsProps) => {
  const skillElements: (Paragraph | undefined)[] = [];

  // Add a line break before the skills section
  skillElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Add heading for Skills
  skillElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Skills:",
          bold: true,
          color: "000000",
          size: 24, // Size for the heading
        }),
      ],
      alignment: AlignmentType.LEFT, // Align heading to the left
    })
  );

  // Add a line break after the heading
  skillElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Create a string to hold the skills and their ratings
  const skillsWithRatings: string[] = skills.featuredSkills.map((skill) => {
    const adjustedRating = Math.min(skill.rating + 1, 6); // Adjust rating to be 1 more, capped at 6
    const ratingStars = "⭐".repeat(adjustedRating); // Generate star rating based on the adjusted rating
    return `${skill.skill} (${ratingStars})`;
  });

  // Create a single paragraph for all skills, separated by '|'
  skillElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: skillsWithRatings.join(" | "), // Join skills with '|'
          color: "000000", // Ensure the text color is black
          size: 20, // Adjust size for better visibility
        }),
      ],
      alignment: AlignmentType.LEFT, // Align skills to the left
    })
  );

  // Add a line break after the skills
  skillElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Descriptions (details about skills)
  skills.descriptions.forEach((desc) => {
    skillElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `• ${desc}`, // Bullet point for each description
            size: 20,
            color: "000000", // Ensure the text color is black
          }),
        ],
        alignment: AlignmentType.LEFT, // Left-align the descriptions
      })
    );
  });

  // Add a line break after the descriptions
  skillElements.push(
    new Paragraph({ children: [new TextRun({ text: "" })] })
  );

  // Return the elements as an array of Paragraphs
  return skillElements.filter(Boolean) as Paragraph[];
};

export default ResumeDocxSkills;
