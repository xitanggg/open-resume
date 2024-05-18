interface ParsedData {
  lastName: string;
  yearOfBirth: string;
  profession: string;
  languages: Array<{ name: string; level: string; certification: string }>;
  expertise: string[];
  CAD_FEA_IT: string[];
  various: string[];
  industries: string[];
  experience: Array<{
    startDate: string;
    endDate: string;
    companyName: string;
    location: string;
    function: string;
    responsibilities: string[];
    achievements: string[];
    technologiesUsed: string[];
  }>;
  diplomas: Array<{
    startYear: string;
    endYear: string;
    school: string;
    city: string;
    diploma: string;
  }>;
  training: Array<{
    year: string;
    duration: string;
    description: string;
    company: string;
    city: string;
  }>;
  projects: Array<{
    year: string;
    name: string;
    description: string;
  }>;
  drivingLicense: string[];
  skills: string[];
}

const formatCompetencyFile = (parsedData: ParsedData) => {
  return {
    personal_information: {
      initial_last_name: parsedData.lastName[0],
      year_of_birth: parsedData.yearOfBirth,
    },
    profession_function: parsedData.profession,
    language_skills: parsedData.languages.map((language) => ({
      language: language.name,
      level: language.level,
      certification: language.certification,
    })),
    expertise: parsedData.expertise,
    technical_knowledge: {
      CAD_FEA_IT: parsedData.CAD_FEA_IT,
      Various: parsedData.various,
    },
    industries: parsedData.industries,
    experience: parsedData.experience.map((exp) => ({
      start_date: exp.startDate,
      end_date: exp.endDate,
      company_name: exp.companyName,
      location: exp.location,
      function: exp.function,
      responsibilities: exp.responsibilities,
      achievements: exp.achievements,
      technologies_used: exp.technologiesUsed,
    })),
    education_and_trainings: {
      diplomas: parsedData.diplomas.map((diploma) => ({
        start_year: diploma.startYear,
        end_year: diploma.endYear,
        school: diploma.school,
        city: diploma.city,
        diploma: diploma.diploma,
      })),
      training: parsedData.training.map((training) => ({
        year: training.year,
        duration: training.duration,
        description: training.description,
        company: training.company,
        city: training.city,
      })),
    },
    projects: parsedData.projects.map((project) => ({
      year: project.year,
      name: project.name,
      description: project.description,
    })),
    driving_license: {
      categories: parsedData.drivingLicense,
    },
    skills: parsedData.skills,
  };
};

export default formatCompetencyFile;
