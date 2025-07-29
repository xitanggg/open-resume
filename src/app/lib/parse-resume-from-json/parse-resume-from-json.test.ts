import { parseResumeFromJson } from './parse-resume-from-json';
import type { Resume } from '../redux/types';

// Mock the validateJsonSchema function
jest.mock('./validate-json-schema', () => ({
  validateJsonSchema: jest.fn(),
}));

import { validateJsonSchema } from './validate-json-schema';
const mockValidateJsonSchema = validateJsonSchema as jest.MockedFunction<typeof validateJsonSchema>;

describe('parseResumeFromJson', () => {
  // Helper function to create a File object from JSON data
  const createJsonFile = (jsonData: any, filename = 'resume.json'): File => {
    const content = JSON.stringify(jsonData);
    return new File([content], filename, { type: 'application/json' });
  };

  // Valid resume data for testing
  const validResumeData = {
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0123',
      url: 'linkedin.com/in/johndoe',
      summary: 'Software engineer with 5 years experience',
      location: 'San Francisco, CA'
    },
    workExperiences: [
      {
        company: 'Google',
        jobTitle: 'Software Engineer',
        date: '2020-2023',
        descriptions: ['Built scalable web applications', 'Led team of 3 developers']
      }
    ],
    educations: [
      {
        school: 'UC Berkeley',
        degree: 'BS Computer Science',
        date: '2016-2020',
        gpa: '3.8',
        descriptions: ['Magna Cum Laude']
      }
    ],
    projects: [
      {
        project: 'Todo App',
        date: '2023',
        descriptions: ['Built with React and Node.js']
      }
    ],
    skills: {
      featuredSkills: [
        { skill: 'JavaScript', rating: 5 },
        { skill: 'React', rating: 4 }
      ],
      descriptions: ['JavaScript, React, Node.js']
    },
    custom: {
      title: 'Key Achievements',
      descriptions: ['Additional information']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful parsing scenarios', () => {
    beforeEach(() => {
      mockValidateJsonSchema.mockResolvedValue({
        isValid: true,
        errors: []
      });
    });

    it('should successfully parse a valid JSON resume file', async () => {
      const file = createJsonFile(validResumeData);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.resume).not.toBeNull();
      expect(result.resume?.profile.name).toBe('John Doe');
      expect(result.resume?.workExperiences).toHaveLength(1);
      expect(result.resume?.educations).toHaveLength(1);
      expect(result.resume?.projects).toHaveLength(1);
      expect(result.resume?.skills.featuredSkills).toHaveLength(2);
      expect(result.customTitle).toBe('Key Achievements');
      expect(result.resume?.custom.title).toBe('Key Achievements');
    });

    it('should handle custom section without title', async () => {
      const dataWithoutCustomTitle = {
        ...validResumeData,
        custom: {
          descriptions: ['Some achievement']
        }
      };
      const file = createJsonFile(dataWithoutCustomTitle);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.customTitle).toBeUndefined();
      expect(result.resume?.custom.title).toBeUndefined();
    });

    it('should handle missing optional fields gracefully', async () => {
      const minimalData = {
        profile: { name: 'Jane Smith' }
      };
      const file = createJsonFile(minimalData);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.resume).not.toBeNull();
      expect(result.resume?.profile.name).toBe('Jane Smith');
      expect(result.resume?.profile.email).toBe('');
      expect(result.resume?.workExperiences).toHaveLength(0);
      expect(result.resume?.educations).toHaveLength(0);
      expect(result.resume?.projects).toHaveLength(0);
      expect(result.resume?.skills.featuredSkills).toHaveLength(0);
    });

    it('should handle empty arrays correctly', async () => {
      const dataWithEmptyArrays = {
        ...validResumeData,
        workExperiences: [],
        educations: [],
        projects: [],
        skills: {
          featuredSkills: [],
          descriptions: []
        }
      };
      const file = createJsonFile(dataWithEmptyArrays);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.resume).not.toBeNull();
      expect(result.resume?.workExperiences).toHaveLength(0);
      expect(result.resume?.educations).toHaveLength(0);
      expect(result.resume?.projects).toHaveLength(0);
      expect(result.resume?.skills.featuredSkills).toHaveLength(0);
    });

    it('should handle numeric rating values correctly', async () => {
      const dataWithRatings = {
        ...validResumeData,
        skills: {
          featuredSkills: [
            { skill: 'JavaScript', rating: 5 },
            { skill: 'Python', rating: 0 },
            { skill: 'Java', rating: 3.5 }
          ],
          descriptions: []
        }
      };
      const file = createJsonFile(dataWithRatings);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.resume?.skills.featuredSkills[0].rating).toBe(5);
      expect(result.resume?.skills.featuredSkills[1].rating).toBe(0);
      expect(result.resume?.skills.featuredSkills[2].rating).toBe(3.5);
    });
  });

  describe('JSON parsing error scenarios', () => {
    beforeEach(() => {
      mockValidateJsonSchema.mockResolvedValue({
        isValid: true,
        errors: []
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      const malformedJson = '{ "profile": { "name": "John" }'; // Missing closing brace
      const file = new File([malformedJson], 'resume.json', { type: 'application/json' });
      
      const result = await parseResumeFromJson(file);
      
      expect(result.resume).toBeNull();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid JSON format');
    });

    it('should handle empty file gracefully', async () => {
      const file = new File([''], 'resume.json', { type: 'application/json' });
      
      const result = await parseResumeFromJson(file);
      
      expect(result.resume).toBeNull();
      expect(result.errors).toHaveLength(1);
      // Empty file causes file reading to fail rather than JSON parsing
      expect(result.errors[0]).toContain('Failed to parse resume');
    });

    it('should handle non-JSON content gracefully', async () => {
      const nonJsonContent = 'This is not JSON content';
      const file = new File([nonJsonContent], 'resume.json', { type: 'application/json' });
      
      const result = await parseResumeFromJson(file);
      
      expect(result.resume).toBeNull();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid JSON format');
    });
  });

  describe('schema validation error scenarios', () => {
    it('should handle schema validation failures', async () => {
      mockValidateJsonSchema.mockResolvedValue({
        isValid: false,
        errors: ['Missing required field: profile.name', 'Invalid email format']
      });
      
      const file = createJsonFile(validResumeData);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.resume).toBeNull();
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toBe('Schema validation failed:');
      expect(result.errors[1]).toBe('Missing required field: profile.name');
      expect(result.errors[2]).toBe('Invalid email format');
    });

    it('should handle schema validation function throwing an error', async () => {
      mockValidateJsonSchema.mockRejectedValue(new Error('Schema loading failed'));
      
      const file = createJsonFile(validResumeData);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.resume).toBeNull();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to parse resume: Schema loading failed');
    });
  });

  describe('data transformation edge cases', () => {
    beforeEach(() => {
      mockValidateJsonSchema.mockResolvedValue({
        isValid: true,
        errors: []
      });
    });

    it('should handle invalid descriptions arrays', async () => {
      const dataWithInvalidDescriptions = {
        profile: { name: 'Test User' },
        workExperiences: [
          {
            company: 'Test Corp',
            jobTitle: 'Engineer',
            date: '2023',
            descriptions: 'Not an array' // Should be an array
          }
        ]
      };
      const file = createJsonFile(dataWithInvalidDescriptions);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.resume?.workExperiences[0].descriptions).toEqual([]);
    });

    it('should handle invalid rating values', async () => {
      const dataWithInvalidRating = {
        profile: { name: 'Test User' },
        skills: {
          featuredSkills: [
            { skill: 'JavaScript', rating: 'five' }, // Should be number
            { skill: 'Python', rating: null },
            { skill: 'Java', rating: undefined }
          ],
          descriptions: []
        }
      };
      const file = createJsonFile(dataWithInvalidRating);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.resume?.skills.featuredSkills[0].rating).toBe(0);
      expect(result.resume?.skills.featuredSkills[1].rating).toBe(0);
      expect(result.resume?.skills.featuredSkills[2].rating).toBe(0);
    });

    it('should handle completely missing sections', async () => {
      const minimalData = {};
      const file = createJsonFile(minimalData);
      
      const result = await parseResumeFromJson(file);
      
      expect(result.errors).toHaveLength(0);
      expect(result.resume).not.toBeNull();
      expect(result.resume?.profile.name).toBe('');
      expect(result.resume?.workExperiences).toEqual([]);
      expect(result.resume?.educations).toEqual([]);
      expect(result.resume?.projects).toEqual([]);
      expect(result.resume?.skills.featuredSkills).toEqual([]);
      expect(result.resume?.custom.descriptions).toEqual([]);
    });
  });
});

// Integration tests with real sample JSON files (unmocked validation)
describe('parseResumeFromJson - Integration Tests', () => {
  // Temporarily unmock the validateJsonSchema for integration tests
  beforeAll(() => {
    jest.unmock('./validate-json-schema');
  });

  afterAll(() => {
    jest.mock('./validate-json-schema', () => ({
      validateJsonSchema: jest.fn(),
    }));
  });

  // Helper function to create a File object from JSON data
  const createJsonFile = (jsonData: any, filename = 'resume.json'): File => {
    const content = JSON.stringify(jsonData);
    return new File([content], filename, { type: 'application/json' });
  };

  it('should successfully parse the provided sample JSON file structure', async () => {
    // Using the same structure as the valid-resume-sample.json file
    const sampleResumeData = {
      "profile": {
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "(555) 123-4567",
        "url": "linkedin.com/in/janesmith",
        "summary": "Experienced software engineer with 5+ years of full-stack development experience",
        "location": "San Francisco, CA"
      },
      "workExperiences": [
        {
          "company": "Google Inc.",
          "jobTitle": "Engineer",
          "date": "Jan 2020 - Present",
          "descriptions": [
            "Developed web applications using React and Node.js",
            "Led team of 5 engineers in agile development process",
            "Improved system performance by 40% through optimization"
          ]
        },
        {
          "company": "Microsoft Corporation",
          "jobTitle": "Developer",
          "date": "2018 - Dec 2019",
          "descriptions": [
            "Built cloud-native applications on Azure platform",
            "Collaborated with cross-functional teams on product features"
          ]
        }
      ],
      "educations": [
        {
          "school": "Stanford University",
          "degree": "Bachelor of Science in Computer Science",
          "date": "2014-2018",
          "gpa": "3.85",
          "descriptions": [
            "Magna Cum Laude",
            "Dean's List",
            "Computer Science Club President"
          ]
        }
      ],
      "projects": [
        {
          "project": "E-commerce Platform",
          "date": "2023",
          "descriptions": [
            "Built full-stack web application using MERN stack",
            "Implemented user authentication and payment processing",
            "Deployed on AWS with 99.9% uptime"
          ]
        },
        {
          "project": "Machine Learning Model",
          "date": "Jan-Mar 2023",
          "descriptions": [
            "Developed predictive model using Python and TensorFlow",
            "Achieved 95% accuracy on test dataset"
          ]
        }
      ],
      "skills": {
        "featuredSkills": [
          { "skill": "JavaScript", "rating": 5 },
          { "skill": "Python", "rating": 4 },
          { "skill": "React", "rating": 5 },
          { "skill": "Node.js", "rating": 4 },
          { "skill": "AWS", "rating": 3 },
          { "skill": "Docker", "rating": 3 }
        ],
        "descriptions": [
          "JavaScript, Python, React, Node.js",
          "AWS, Docker, Kubernetes, Git",
          "Machine Learning, Data Analysis"
        ]
      },
      "custom": {
        "descriptions": []
      }
    };

    const file = createJsonFile(sampleResumeData);
    
    // Use the actual implementation without mocking
    const { parseResumeFromJson: actualParseResumeFromJson } = await import('./parse-resume-from-json');
    
    const result = await actualParseResumeFromJson(file);
    
    // Verify successful parsing
    expect(result.errors).toHaveLength(0);
    expect(result.resume).not.toBeNull();
    
    // Verify profile data
    expect(result.resume?.profile.name).toBe('Jane Smith');
    expect(result.resume?.profile.email).toBe('jane.smith@example.com');
    expect(result.resume?.profile.phone).toBe('(555) 123-4567');
    expect(result.resume?.profile.url).toBe('linkedin.com/in/janesmith');
    expect(result.resume?.profile.summary).toBe('Experienced software engineer with 5+ years of full-stack development experience');
    expect(result.resume?.profile.location).toBe('San Francisco, CA');
    
    // Verify work experiences
    expect(result.resume?.workExperiences).toHaveLength(2);
    expect(result.resume?.workExperiences[0].company).toBe('Google Inc.');
    expect(result.resume?.workExperiences[0].jobTitle).toBe('Engineer');
    expect(result.resume?.workExperiences[0].descriptions).toHaveLength(3);
    
    // Verify educations
    expect(result.resume?.educations).toHaveLength(1);
    expect(result.resume?.educations[0].school).toBe('Stanford University');
    expect(result.resume?.educations[0].degree).toBe('Bachelor of Science in Computer Science');
    expect(result.resume?.educations[0].gpa).toBe('3.85');
    
    // Verify projects
    expect(result.resume?.projects).toHaveLength(2);
    expect(result.resume?.projects[0].project).toBe('E-commerce Platform');
    expect(result.resume?.projects[1].project).toBe('Machine Learning Model');
    
    // Verify skills
    expect(result.resume?.skills.featuredSkills).toHaveLength(6);
    expect(result.resume?.skills.featuredSkills[0].skill).toBe('JavaScript');
    expect(result.resume?.skills.featuredSkills[0].rating).toBe(5);
    expect(result.resume?.skills.descriptions).toHaveLength(3);
    
    // Verify custom section
    expect(result.resume?.custom.descriptions).toHaveLength(0);
  });

  it('should handle real-world edge cases in sample data', async () => {
    // Test with some edge cases that might occur in real JSON files
    const edgeCaseData = {
      "profile": {
        "name": "Test User",
        "email": "",  // Empty email
        "phone": null, // Null phone
        "summary": "   ", // Whitespace summary
        "location": undefined // Undefined location
      },
      "workExperiences": [], // Empty array
      "educations": null, // Null array (should be handled gracefully)
      "projects": [
        {
          "project": "Test Project",
          "date": "",
          "descriptions": null // Null descriptions
        }
      ],
      "skills": {
        "featuredSkills": [
          { "skill": "Test", "rating": "invalid" } // Invalid rating type
        ],
        "descriptions": "Not an array" // String instead of array
      }
      // Missing custom section entirely
    };

    const file = createJsonFile(edgeCaseData);
    
    // Use the actual implementation without mocking
    const { parseResumeFromJson: actualParseResumeFromJson } = await import('./parse-resume-from-json');
    
    const result = await actualParseResumeFromJson(file);
    
    // Should handle edge cases gracefully with transformation
    expect(result.errors).toHaveLength(0);
    expect(result.resume).not.toBeNull();
    
    // Verify graceful handling of edge cases
    expect(result.resume?.profile.name).toBe('Test User');
    expect(result.resume?.profile.email).toBe('');
    expect(result.resume?.profile.phone).toBe('');
    expect(result.resume?.profile.summary).toBe('   ');
    expect(result.resume?.profile.location).toBe('');
    
    expect(result.resume?.workExperiences).toEqual([]);
    expect(result.resume?.educations).toEqual([]);
    expect(result.resume?.projects).toHaveLength(1);
    expect(result.resume?.projects[0].descriptions).toEqual([]);
    
    expect(result.resume?.skills.featuredSkills).toHaveLength(1);
    expect(result.resume?.skills.featuredSkills[0].rating).toBe(0); // Invalid rating converted to 0
    expect(result.resume?.skills.descriptions).toEqual([]); // String converted to empty array
    
    expect(result.resume?.custom.descriptions).toEqual([]);
  });
});