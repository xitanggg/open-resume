import { validateJsonSchema } from './validate-json-schema';

// Mock fetch globally for tests
global.fetch = jest.fn();

describe('validate-json-schema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle schema validation with valid data', async () => {
    const mockSchema = {
      type: 'object',
      required: ['profile'],
      properties: {
        profile: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' }
          }
        }
      }
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSchema),
    } as Response);

    const validData = {
      profile: { name: 'John Doe' }
    };

    const result = await validateJsonSchema(validData);
    expect(result.isValid).toBe(true);
  });

  it('should handle schema validation with invalid data', async () => {
    const mockSchema = {
      type: 'object',
      required: ['profile'],
      properties: {
        profile: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' }
          }
        }
      }
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSchema),
    } as Response);

    const invalidData = {}; // missing required profile

    const result = await validateJsonSchema(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle fetch errors gracefully', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

    const result = await validateJsonSchema({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Schema validation failed: Error loading resume schema: Network error');
  });

  describe('jobTitle validation (v1.1.0 schema changes)', () => {
    const createMockSchemaWithJobTitle = () => ({
      type: 'object',
      required: ['workExperiences'],
      properties: {
        workExperiences: {
          type: 'array',
          items: {
            type: 'object',
            required: ['jobTitle'],
            properties: {
              jobTitle: {
                type: 'string',
                description: 'Job title as extracted from resume (full text, not constrained to predefined list)'
              }
            }
          }
        }
      }
    });

    beforeEach(() => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockSchemaWithJobTitle()),
      } as Response);
    });

    it('should accept realistic full job titles', async () => {
      const dataWithRealisticTitles = {
        workExperiences: [
          { jobTitle: 'Senior Software Engineer' },
          { jobTitle: 'Machine Learning Engineer II' },
          { jobTitle: 'Principal Data Scientist' },
          { jobTitle: 'Technical Product Manager' }
        ]
      };

      const result = await validateJsonSchema(dataWithRealisticTitles);
      expect(result.isValid).toBe(true);
    });

    it('should accept job titles with numbers and special characters', async () => {
      const dataWithSpecialCharacters = {
        workExperiences: [
          { jobTitle: 'Software Engineer 2 (Level II)' },
          { jobTitle: 'ML Engineer III - NLP/CV Specialist' },
          { jobTitle: 'VP of Engineering & Co-Founder' },
          { jobTitle: 'Senior Consultant (C++ & Python Dev) - Contract @Fortune500' }
        ]
      };

      const result = await validateJsonSchema(dataWithSpecialCharacters);
      expect(result.isValid).toBe(true);
    });

    it('should accept very long job titles (>5 words)', async () => {
      const dataWithLongTitles = {
        workExperiences: [
          { jobTitle: 'L6 Software Engineer - Distributed Systems & Platform Infrastructure' },
          { jobTitle: 'Full-Stack Dev (React.js + Node.js + AWS) - Client: Nike/Adidas' },
          { jobTitle: 'Staff Software Engineer, Machine Learning Infrastructure' }
        ]
      };

      const result = await validateJsonSchema(dataWithLongTitles);
      expect(result.isValid).toBe(true);
    });

    it('should accept traditional simple job titles', async () => {
      const dataWithSimpleTitles = {
        workExperiences: [
          { jobTitle: 'Engineer' },
          { jobTitle: 'Developer' },
          { jobTitle: 'Manager' },
          { jobTitle: 'Analyst' }
        ]
      };

      const result = await validateJsonSchema(dataWithSimpleTitles);
      expect(result.isValid).toBe(true);
    });

    it('should handle edge cases properly', async () => {
      const dataWithEdgeCases = {
        workExperiences: [
          { jobTitle: 'A' }, // Very short
          { jobTitle: 'Graduate TA/RA - CS224N: NLP w/ Deep Learning (Remote 100%)' }, // Very long with many special chars
          { jobTitle: 'CEO/CTO/Co-Founder' }, // Multiple slashes
          { jobTitle: 'Software Engineer @ Google (2018-2023)' } // With dates and symbols
        ]
      };

      const result = await validateJsonSchema(dataWithEdgeCases);
      expect(result.isValid).toBe(true);
    });
  });
});