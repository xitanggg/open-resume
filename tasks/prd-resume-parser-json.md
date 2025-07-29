# Product Requirements Document: JSON Resume Parser

## Introduction/Overview

This feature will add JSON resume import functionality to the OpenResume application, allowing users to upload resume data in JSON format alongside the existing PDF import capability. The JSON parser will validate uploaded files against the established resume schema and import the data into the same Redux store used by PDF imports, maintaining consistency with the existing user workflow.

**Problem Statement:** Currently, users can only import resume data from PDF files. This limits users who have structured resume data in JSON format or who want to programmatically generate resume imports.

**Goal:** Enable users to import resume data from JSON files that conform to the OpenResume schema, providing an alternative input method while maintaining the same user experience and data integrity as PDF imports.

## Goals

1. **Primary Goal:** Allow users to drag and drop JSON files for resume import using the same interface as PDF imports
2. **Validation Goal:** Ensure all imported JSON data strictly adheres to the established resume schema with comprehensive error reporting
3. **Consistency Goal:** Maintain identical user workflow and data storage patterns as existing PDF import functionality
4. **User Experience Goal:** Provide clear, actionable error messages when JSON files don't meet schema requirements

## User Stories

1. **As a user with structured resume data**, I want to upload a JSON file containing my resume information so that I can quickly import my data without manual entry.

2. **As a user**, I want to drag and drop either PDF or JSON files into the same upload area so that I have flexibility in my import format without learning different interfaces.

3. **As a user who uploads an invalid JSON file**, I want to see clear error messages explaining what's wrong with my file so that I can fix the issues and successfully import my data.

4. **As a user**, I want my JSON-imported resume data to work identically to PDF-imported data so that I can edit, export, and manage my resume using all existing features.

5. **As a user**, I want the JSON import to take me to the resume builder after successful import so that I can immediately review and customize my imported data.

## Functional Requirements

1. **FR-1:** The system must accept JSON files through the existing ResumeDropzone component alongside PDF files
2. **FR-2:** The system must validate uploaded JSON files against the resume schema located at `public/schemas/resume-schema.json`
3. **FR-3:** The system must use Ajv library for JSON schema validation
4. **FR-4:** The system must store validated JSON data in the Redux store using the same `setResume` action used by PDF imports
5. **FR-5:** The system must save imported JSON data to localStorage using the existing `saveStateToLocalStorage` function
6. **FR-6:** The system must redirect users to `/resume-builder` after successful JSON import
7. **FR-7:** The system must display validation errors in plain English when JSON files don't meet schema requirements
8. **FR-8:** The system must update the dropzone UI text to indicate acceptance of both PDF and JSON file formats
9. **FR-9:** The system must handle JSON files of any reasonable size (no additional size restrictions beyond existing PDF limits)
10. **FR-10:** The system must reject non-JSON files with appropriate error messaging
11. **FR-11:** The system must implement the JSON parser in a new directory: `src/app/lib/parse-resume-from-json/`
12. **FR-12:** The system must validate all required fields as specified in the resume schema
13. **FR-13:** The system must validate all field patterns (email, phone, location formats) as defined in the schema
14. **FR-14:** The system must configure form visibility settings based on imported JSON data (same logic as PDF imports)

## Non-Goals (Out of Scope)

1. **Schema Modifications:** No changes to the existing resume schema structure or validation patterns
2. **PDF Import Changes:** No modifications to existing PDF parsing logic or workflow
3. **Partial Imports:** No support for importing incomplete JSON objects or individual resume sections
4. **Schema Versioning:** No support for multiple schema versions or migration logic
5. **Custom Validation:** No custom validation rules beyond what's defined in the existing schema
6. **File Format Conversion:** No conversion between PDF and JSON formats
7. **Bulk Import:** No support for importing multiple JSON files simultaneously
8. **Advanced Error Recovery:** No automatic correction of invalid JSON data

## Design Considerations

### User Interface Changes
- **ResumeDropzone Component:** Update display text from "Browse a pdf file or drop it here" to "Browse a PDF or JSON file or drop it here"
- **File Type Validation:** Extend existing file type checking to accept both `.pdf` and `.json` extensions
- **Error Display:** Utilize existing error display mechanisms for consistency

### File Processing Flow
- **File Detection:** Implement file type detection based on file extension
- **Routing Logic:** Route PDF files to existing `parseResumeFromPdf` and JSON files to new `parseResumeFromJson`
- **Data Integration:** Both parsers output to the same Redux store structure

## Technical Considerations

### Dependencies
- **Ajv:** Add `ajv` package for JSON schema validation
- **Schema Loading:** Load resume schema from `public/schemas/resume-schema.json` for validation

### File Structure
```
src/app/lib/parse-resume-from-json/
├── index.ts (main export)
├── parse-resume-from-json.ts (core parsing logic)
└── validate-json-schema.ts (Ajv validation logic)
```

### Integration Points
- **ResumeDropzone:** Modify `onDrop` and `onInputChange` handlers to detect JSON files
- **Import Flow:** Add JSON parsing branch in import logic while maintaining existing PDF flow
- **Redux Store:** Use existing `setResume` action for data storage
- **LocalStorage:** Use existing `saveStateToLocalStorage` function
- **Navigation:** Use existing router.push('/resume-builder') pattern

### Error Handling
- **File Type Errors:** "Only PDF and JSON files are supported"
- **Invalid JSON:** "Invalid JSON file format"
- **Schema Validation:** Specific field-level errors based on Ajv validation results
- **Missing Required Fields:** Clear messaging about which required fields are missing

## Success Metrics

1. **Functional Success:** JSON files that conform to the schema are successfully imported and stored identically to PDF imports
2. **User Experience:** Clear error messages allow users to successfully fix and re-import invalid JSON files
3. **Technical Success:** No regressions in existing PDF import functionality
4. **Validation Success:** 100% of schema validation rules are enforced for JSON imports
5. **Integration Success:** JSON-imported data works seamlessly with all existing resume builder features

## Open Questions

1. Should we add any JSON file size validation beyond browser limitations?
2. Do we need to log JSON import attempts and validation failures for analytics?
3. Should we provide example JSON files or documentation for users unfamiliar with the schema format?
4. Do we need any specific performance considerations for large JSON files?
5. Should we add any JSON formatting validation (pretty-printed vs minified) requirements?

## Implementation Dependencies

- Resume schema file at `public/schemas/resume-schema.json` (✅ exists)
- Existing ResumeDropzone component (✅ exists)
- Existing Redux store and actions (✅ exists)
- Existing localStorage integration (✅ exists)
- Existing error display mechanisms (✅ exists)