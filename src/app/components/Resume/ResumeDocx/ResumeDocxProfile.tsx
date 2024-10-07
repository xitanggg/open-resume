import { Paragraph, TextRun, AlignmentType } from "docx";

// Define the props type for the ResumeDocxProfile
export interface ResumeDocxProfileProps {
  profile: {
    name: string;
    email: string;
    phone: string;
    url: string;
    summary: string;
    location: string;
  };
}

const ResumeDocxProfile = ({ profile }: ResumeDocxProfileProps) => {
  // Destructure the profile object to get the properties directly
  const {
    name,
    email,
    phone,
    url,
    summary,
    location,
  } = profile;

  const profileElements: (Paragraph | undefined)[] = [];

  // Name
  profileElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: name,
          bold: true,
          color: "000000",
          size: 42,
        }),
      ],
      alignment: AlignmentType.CENTER, // Center the name
    })
  );

  // Contact Information (Email and Phone on one line)
  const contactInfoLine1 = `${email} | ${phone}`;

  profileElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactInfoLine1,
          color: "000000",
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER, // Center the email and phone
    })
  );

  // Contact Information (URL and Location on next line)
  const contactInfoLine2 = `${url} | ${location}`;

  profileElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactInfoLine2,
          color: "000000",
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER, // Center the URL and location
    })
  );

  // Add a line break after the contact info
  profileElements.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

  // Objective Heading
  profileElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Objective:",
          bold: true,
          color: "000000",
          size: 24, // Size for the heading
        }),
      ],
      alignment: AlignmentType.START, // Center the heading
    })
  );

  // Objective Summary
  if (summary) {
    profileElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: summary,
            size: 25,
            color: "000000",
          }),
        ],
        alignment: AlignmentType.START, // Center the objective
      })
    );
  }

  // Add profile elements to return
  return profileElements.filter(Boolean) as Paragraph[];
};

export default ResumeDocxProfile;
