# Product Requirements Document: Fix Job Title Schema Constraint

## Introduction/Overview

The current resume schema incorrectly constrains the `jobTitle` field in work experience to an enum of 65 predefined values. This creates a mismatch between the PDF parser logic (which stores full job titles) and the JSON schema validation (which only accepts single-word titles). The schema should allow full, descriptive job titles while maintaining compatibility with the existing PDF parser.

## Goals

1. **Fix Schema Constraint**: Remove the enum restriction on `jobTitle` to allow full descriptive job titles
2. **Maintain PDF Parser Compatibility**: Ensure the schema accepts the same data format that the PDF parser produces
3. **Preserve Detection Logic**: Keep the 65 predefined titles as detection keywords without constraining the stored value
4. **Enable Rich Job Titles**: Allow storage of complete job titles like "Senior Software Engineer, Machine Learning" instead of just "Engineer"

## User Stories

1. **As a resume parser**, I want to store the complete job title text extracted from PDFs so that no information is lost during parsing
2. **As a JSON importer**, I want to import resumes with full descriptive job titles so that the data matches real-world job descriptions  
3. **As a resume builder user**, I want my complete job title to be preserved so that my resume accurately reflects my role
4. **As a developer**, I want the schema to match the actual parser behavior so that validation doesn't reject valid data

## Functional Requirements

### Schema Changes
1. **FR-1**: Replace the `jobTitle` enum constraint with a string type that accepts any text
2. **FR-2**: Maintain the same validation rules used by the PDF parser for job title extraction
3. **FR-3**: Keep the 65 predefined job titles available for reference/detection but not as constraints
4. **FR-4**: Ensure the schema change is backward compatible with existing valid data

### Validation Rules  
5. **FR-5**: Apply the same text length and formatting validation that the PDF parser uses:
   - Should not penalize titles with more than 5 words (current parser gives -2 score)
   - Should not penalize titles containing numbers (current parser gives -4 score)
   - Should accept any string that would pass the PDF parser's feature scoring system
6. **FR-6**: Maintain consistency with other fields that use string types (company, descriptions)

### Data Compatibility
7. **FR-7**: Ensure that job titles extracted by the PDF parser validate successfully against the updated schema
8. **FR-8**: Verify that existing JSON resume data continues to validate after schema changes
9. **FR-9**: Maintain the same data structure format (string field) used by the Redux types

## Non-Goals (Out of Scope)

1. **Parser Logic Changes**: No modifications to the PDF parser's job title extraction algorithm
2. **Detection Keywords**: No changes to the 65 predefined job titles used for detection scoring
3. **Feature Scoring System**: No alterations to the existing feature scoring mechanism
4. **UI Changes**: No changes to resume builder interface for job title input
5. **Other Field Constraints**: Focus only on job title; other enum constraints are out of scope for this fix

## Technical Considerations

### Current PDF Parser Logic
- Uses 65 job titles as detection keywords in `hasJobTitle` function
- Applies feature scoring to identify which text contains job title
- Stores the **complete text** of the highest-scoring item in `jobTitle` field
- Does not truncate or modify the extracted text to match enum values

### Schema Architecture
- Current schema uses YAML format with JSON Schema specification
- Enum constraint is defined in the `ResumeWorkExperience` definition
- Pattern-based validation exists for other fields (phone, email, location)
- Schema references are maintained in `public/schemas/` directory

### Validation Requirements
- Must pass JSON Schema validation for draft/2020-12 specification  
- Should maintain type safety for TypeScript integration
- Need to update any dependent validation in JSON parser module

## Design Considerations

### Schema Pattern Options
1. **Option A**: Pure string type with no pattern constraint (recommended)
2. **Option B**: String type with minimum/maximum length constraints
3. **Option C**: String type with pattern validation for common job title formats

**Recommendation**: Option A provides maximum flexibility and matches PDF parser behavior exactly.

### Documentation Updates
- Update schema examples to show realistic job titles
- Maintain the predefined job titles list for reference only
- Update any validation documentation to reflect changes

## Success Metrics

1. **Validation Success**: 100% of PDF-extracted job titles pass schema validation
2. **Data Preservation**: No loss of job title information during import/export cycles
3. **Backward Compatibility**: All existing valid JSON resumes continue to validate
4. **Parser Alignment**: Schema accepts identical data format to PDF parser output

## Open Questions

1. **Length Limits**: Should there be any reasonable maximum length constraint on job titles?
2. **Character Restrictions**: Should certain special characters be prohibited in job titles?
3. **Migration Strategy**: How should existing systems handle the schema version change?
4. **Testing Coverage**: What additional test cases are needed to verify the fix?

## Implementation Notes

### Files to Modify
- `public/schemas/resume-schema.yaml` - Primary schema definition
- `public/schemas/resume-schema.json` - JSON version of schema  
- Update any examples that show restricted job titles

### Validation Testing
- Test with realistic job titles from actual resumes
- Verify PDF parser output validates against updated schema
- Ensure existing JSON test data continues to pass validation

### Reference Preservation
- Keep the predefined job titles list available for documentation
- Maintain the detection logic in PDF parser unchanged
- Update schema documentation to clarify the distinction between detection keywords and storage format 