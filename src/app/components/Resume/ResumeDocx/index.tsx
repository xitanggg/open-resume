import { Document, Packer } from "docx";
import ResumeDocxProfile from "./ResumeDocxProfile"; // Import the Profile component
import type { Resume } from "lib/redux/types"; // Ensure this type is correct
import ResumeDocxWorkExperience from "./ResumeDocxWorkExperience";
import ResumeDocxEducation from "./ResumeDocxEducation";
import ResumeDocxProjects from "./ResumeDocxProjects";
import ResumeDocxSkills from "./ResumeDocxSkills";

// Function to create and download the resume document
const createDocx = async (resume: Resume | null) => {
  try {
    console.log("Creating DOCX for resume", resume);

    // Check if resume profile exists
    if (!resume || !resume.profile) {
      console.error("No profile data available in the resume");
      return;
    }

    // Extract profile and work experience data
    const profileData = ResumeDocxProfile(resume);
    const workExperienceData = ResumeDocxWorkExperience({
      experiences: resume.workExperiences,
    });
    const educationData = ResumeDocxEducation({ education: resume.educations });
    const projectsData = ResumeDocxProjects({ projects: resume.projects });
    const skillsData = ResumeDocxSkills({skills:resume.skills})

    // Create a new document with sections for profile and work experience ..etc
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 12240,
                height: 15840,
              },
              margin: {
                top: 700,
                right: 600,
                bottom: 720,
                left: 600,
              },
            },
          },
          children: [
            ...profileData,
            ...workExperienceData,
            ...educationData,
            ...projectsData,
            ...skillsData
          ],
        },
      ],
    });

    console.log("DOCX created", doc);

    // Generate the document as a Blob
    const blob = await Packer.toBlob(doc);
    console.log("Blob created", blob);

    // Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume.docx";
    document.body.appendChild(link); // Append to body to make it work in some browsers
    link.click();
    document.body.removeChild(link); // Clean up after download
    console.log("Download triggered");
  } catch (error) {
    console.error("Error creating or downloading the DOCX", error);
  }
};

export default createDocx; // Export the createDocx function for external use
