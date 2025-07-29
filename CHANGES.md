# OpenResume Changelog

## 2025-07-29 - JSON Resume Format Support

### Major Features Added

#### Complete JSON Schema Implementation
- **Added comprehensive JSON schemas** for resume data validation and structure definition
  - `public/schemas/resume-schema.yaml` - Main schema with all field definitions and constraints
  - `public/schemas/resume-schema.json` - JSON version of the schema
  - `public/schemas/patterns/` - Validation patterns, enums, and defaults
  - `public/schemas/examples/` - Sample valid JSON resume data
  - Complete documentation with 153-line README explaining usage and features

#### JSON Resume Parsing & Validation
- **New JSON parsing library** (`src/app/lib/parse-resume-from-json/`)
  - JSON schema validation with comprehensive error reporting
  - Resume data parsing and transformation
  - Type-safe JSON processing with 95-line validator
  - Extensive test coverage (521 lines of tests)

#### Enhanced File Upload Support
- **Extended ResumeDropzone** to accept both PDF and JSON files
  - Added JSON file type detection and validation
  - Enhanced error handling with specific JSON parsing error messages
  - Improved user feedback for unsupported file types
  - Updated UI text to indicate dual format support

#### Redux State Management Updates
- **Enhanced Redux hooks** for JSON data synchronization
  - Added automatic custom section title syncing from JSON data
  - Improved state merging for JSON-imported resume data
  - Better integration between JSON structure and application state

#### Development & Debugging Enhancements
- **Added comprehensive parser output logging** to resume parser page
  - Detailed console logging of complete resume data structure
  - Section identification analysis and raw text processing metrics
  - Data structure validation and field counting

### Dependencies Added
- **ajv v8.17.1** - JSON schema validation library
- **ajv-formats v3.0.1** - Additional format validators for AJV

### Technical Improvements
- **Version bump** from 0.1.0 to 0.1.1
- **Enhanced type safety** with proper file handling in dropzone component
- **Improved error handling** throughout JSON processing pipeline
- **Better user experience** with clear error messages and validation feedback

### Schema Specifications
- **6 top-level resume sections** with complete field coverage
- **23 total data fields** matching parser extraction capabilities  
- **65 predefined job titles** for detection scoring
- **Comprehensive validation rules** for emails, phones, locations, GPAs
- **Flexible date format support** matching existing PDF parser behavior

### Future Extensibility
This implementation provides the foundation for:
- Alternative JSON-based resume parsers
- Enhanced validation systems
- TypeScript interface generation
- Automated documentation generation
- Comprehensive testing frameworks

### Files Modified
- `package.json` & `package-lock.json` - Added JSON validation dependencies
- `src/app/components/ResumeDropzone.tsx` - Enhanced for dual format support
- `src/app/components/ResumeForm/CustomForm.tsx` - Updated form handling
- `src/app/lib/redux/` - Enhanced state management and hooks
- `src/app/resume-parser/page.tsx` - Added comprehensive logging

### New Files Added
- Complete JSON schema ecosystem in `public/schemas/`
- Full JSON parsing library in `src/app/lib/parse-resume-from-json/`
- Task and PRD documentation in `tasks/`
