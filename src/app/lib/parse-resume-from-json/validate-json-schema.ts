import Ajv from "ajv";
import addFormats from "ajv-formats";

// Initialize Ajv instance with configuration for draft 2020-12 support
const ajv = new Ajv({
  allErrors: true, // Collect all validation errors, not just the first one
  verbose: true,   // Include schema and data in error messages
  strict: false,   // Allow additional properties not defined in schema
  validateSchema: false, // Disable meta-schema validation to avoid the error
});

// Add format validation support (email, date, etc.)
addFormats(ajv);

let resumeSchema: any = null;

/**
 * Load the resume schema from the public schemas directory
 * @returns Promise that resolves to the loaded schema object
 */
export async function loadResumeSchema(): Promise<any> {
  if (resumeSchema) {
    return resumeSchema;
  }

  try {
    const response = await fetch('/schemas/resume-schema.json');
    if (!response.ok) {
      throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
    }
    resumeSchema = await response.json();
    return resumeSchema;
  } catch (error) {
    throw new Error(`Error loading resume schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate JSON data against the resume schema
 * @param data - The JSON data to validate
 * @returns Validation result with user-friendly error messages
 */
export async function validateJsonSchema(data: any): Promise<ValidationResult> {
  try {
    const schema = await loadResumeSchema();
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    
    if (isValid) {
      return { isValid: true, errors: [] };
    }
    
    // Convert Ajv errors to user-friendly messages
    const errors = validate.errors?.map(error => {
      const path = error.instancePath || 'root';
      const field = path.replace(/^\//, '').replace(/\//g, '.');
      
      switch (error.keyword) {
        case 'required':
          return `Missing required field: ${error.params.missingProperty}`;
        case 'type':
          return `Field "${field}" should be of type ${error.params.type}`;
        case 'format':
          return `Field "${field}" has invalid format. Expected: ${error.params.format}`;
        case 'minLength':
          return `Field "${field}" is too short. Minimum length: ${error.params.limit}`;
        case 'maxLength':
          return `Field "${field}" is too long. Maximum length: ${error.params.limit}`;
        case 'pattern':
          return `Field "${field}" does not match the required pattern`;
        case 'enum':
          return `Field "${field}" must be one of: ${error.params.allowedValues?.join(', ')}`;
        default:
          return `Field "${field}": ${error.message}`;
      }
    }) || [];
    
    return { isValid: false, errors };
  } catch (error) {
    return { 
      isValid: false, 
      errors: [`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}

export { ajv };