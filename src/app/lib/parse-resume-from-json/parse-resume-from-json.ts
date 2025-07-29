import { validateJsonSchema, ValidationResult } from './validate-json-schema';
import type { Resume } from '../redux/types';

/**
 * Result of parsing a resume from JSON
 */
export interface ParseResumeFromJsonResult {
  resume: Resume | null;
  errors: string[];
  customTitle?: string;
}

/**
 * Read file content as text
 * @param file - The file to read
 * @returns Promise containing the file content as string
 */
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse JSON string with proper error handling
 * @param jsonString - The JSON string to parse
 * @returns Parsed JSON object or throws descriptive error
 */
function parseJsonString(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw new Error('Failed to parse JSON content');
  }
}

/**
 * Transform validated JSON data to Resume type
 * @param jsonData - The validated JSON data
 * @returns Resume object
 */
function transformJsonToResume(jsonData: any): Resume {
  // The JSON structure should already match the Resume type after validation
  // but we'll be explicit about the transformation for clarity and type safety
  const resume: Resume = {
    profile: {
      name: jsonData.profile?.name || '',
      email: jsonData.profile?.email || '',
      phone: jsonData.profile?.phone || '',
      url: jsonData.profile?.url || '',
      summary: jsonData.profile?.summary || '',
      location: jsonData.profile?.location || '',
    },
    workExperiences: (jsonData.workExperiences || []).map((exp: any) => ({
      company: exp.company || '',
      jobTitle: exp.jobTitle || '',
      date: exp.date || '',
      descriptions: Array.isArray(exp.descriptions) ? exp.descriptions : [],
    })),
    educations: (jsonData.educations || []).map((edu: any) => ({
      school: edu.school || '',
      degree: edu.degree || '',
      date: edu.date || '',
      gpa: edu.gpa || '',
      descriptions: Array.isArray(edu.descriptions) ? edu.descriptions : [],
    })),
    projects: (jsonData.projects || []).map((proj: any) => ({
      project: proj.project || '',
      date: proj.date || '',
      descriptions: Array.isArray(proj.descriptions) ? proj.descriptions : [],
    })),
    skills: {
      featuredSkills: (jsonData.skills?.featuredSkills || []).map((skill: any) => ({
        skill: skill.skill || '',
        rating: typeof skill.rating === 'number' ? skill.rating : 0,
      })),
      descriptions: Array.isArray(jsonData.skills?.descriptions) ? jsonData.skills.descriptions : [],
    },
    custom: {
      title: jsonData.custom?.title,
      descriptions: Array.isArray(jsonData.custom?.descriptions) ? jsonData.custom.descriptions : [],
    },
  };

  return resume;
}

/**
 * Parse a resume from a JSON file
 * @param file - The JSON file to parse
 * @returns Promise containing the parsed resume or errors
 */
export async function parseResumeFromJson(file: File): Promise<ParseResumeFromJsonResult> {
  try {
    // Step 1: Read file content
    const fileContent = await readFileAsText(file);
    
    // Step 2: Parse JSON with error handling
    let jsonData: any;
    try {
      jsonData = parseJsonString(fileContent);
    } catch (parseError) {
      return {
        resume: null,
        errors: [parseError instanceof Error ? parseError.message : 'Failed to parse JSON']
      };
    }
    
    // Step 3: Validate against schema
    const validation: ValidationResult = await validateJsonSchema(jsonData);
    if (!validation.isValid) {
      return {
        resume: null,
        errors: [`Schema validation failed:`, ...validation.errors]
      };
    }
    
    // Step 4: Transform validated data to Resume type
    const resume = transformJsonToResume(jsonData);
    
    return {
      resume,
      errors: [],
      customTitle: resume.custom?.title,
    };
  } catch (error) {
    return {
      resume: null,
      errors: [`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}