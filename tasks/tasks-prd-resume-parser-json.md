## Relevant Files

- `src/app/lib/parse-resume-from-json/index.ts` - Main export file for JSON resume parsing functionality
- `src/app/lib/parse-resume-from-json/parse-resume-from-json.ts` - Core JSON parsing logic and file processing
- `src/app/lib/parse-resume-from-json/validate-json-schema.ts` - Ajv-based JSON schema validation logic
- `src/app/lib/parse-resume-from-json/parse-resume-from-json.test.ts` - Unit tests for JSON parsing functionality with integration tests
- `src/app/lib/parse-resume-from-json/validate-json-schema.test.ts` - Unit tests for schema validation
- `src/app/components/ResumeDropzone.tsx` - Updated dropzone component to handle both PDF and JSON files with complete integration
- `package.json` - Added Ajv dependency for JSON schema validation

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `parse-resume-from-json.ts` and `parse-resume-from-json.test.ts` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Set up JSON parsing infrastructure and dependencies
  - [x] 1.1 Install Ajv package for JSON schema validation (`npm install ajv`)
  - [x] 1.2 Create directory structure `src/app/lib/parse-resume-from-json/`
  - [x] 1.3 Create main export file `index.ts` with proper TypeScript exports
  - [x] 1.4 Set up Jest test configuration for the new parsing module

- [x] 2.0 Implement JSON schema validation using Ajv
  - [x] 2.1 Create `validate-json-schema.ts` with Ajv instance configuration
  - [x] 2.2 Implement function to load resume schema from `public/schemas/resume-schema.json`
  - [x] 2.3 Create validation function that returns detailed error messages in plain English
  - [x] 2.4 Handle Ajv validation errors and convert them to user-friendly messages
  - [x] 2.5 Write comprehensive unit tests for schema validation functionality
  - [x] 2.6 Test validation against valid and invalid JSON samples

- [x] 3.0 Create core JSON resume parsing logic
  - [x] 3.1 Create `parse-resume-from-json.ts` with main parsing function
  - [x] 3.2 Implement file reading logic to extract JSON content from File object
  - [x] 3.3 Add JSON parsing with proper error handling for malformed JSON
  - [x] 3.4 Integrate schema validation into the parsing pipeline
  - [x] 3.5 Transform validated JSON data to match Redux store Resume type
  - [x] 3.6 Implement error handling with specific messages for different failure types
  - [x] 3.7 Write unit tests covering successful parsing and various error scenarios
  - [x] 3.8 Test with sample JSON files that match the resume schema

- [x] 4.0 Update ResumeDropzone component to handle JSON files
  - [x] 4.1 Modify file type validation in `onDrop` to accept both `.pdf` and `.json` extensions
  - [x] 4.2 Update `onInputChange` to handle JSON file selection
  - [x] 4.3 Add file type detection logic to route files to appropriate parsers
  - [x] 4.4 Update UI text from "Browse a pdf file" to "Browse a PDF or JSON file"
  - [x] 4.5 Update file input `accept` attribute to include `.json` files
  - [x] 4.6 Modify error state handling for JSON-specific validation errors
  - [x] 4.7 Update `hasNonPdfFile` state logic to `hasUnsupportedFile` for both PDF and JSON
  - [x] 4.8 Write unit tests for updated dropzone functionality with both file types

- [x] 5.0 Integrate JSON parser with existing import workflow
  - [x] 5.1 Import `parseResumeFromJson` function in ResumeDropzone component
  - [x] 5.2 Modify `onImportClick` to detect file type and call appropriate parser
  - [x] 5.3 Ensure JSON parsing uses same Redux `setResume` action as PDF parsing
  - [x] 5.4 Maintain identical form visibility settings logic for JSON imports
  - [x] 5.5 Preserve same localStorage saving functionality using `saveStateToLocalStorage`
  - [x] 5.6 Ensure same navigation flow to `/resume-builder` after successful import
  - [x] 5.7 Test end-to-end JSON import workflow matches PDF import behavior
  - [x] 5.8 Verify no regressions in existing PDF import functionality