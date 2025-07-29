# OpenResume JSON Schemas

This directory contains comprehensive JSON schemas for resume data extracted by the OpenResume parser, generated through complete reverse engineering of the parser implementation.

## Schema Organization

### Main Schema
- `resume-schema.yaml` - Complete JSON schema definition with all fields, validations, and constraints

### Supporting Files
- `patterns/validation-patterns.yaml` - All regex patterns for field validation
- `patterns/enums.yaml` - Predefined enumerated values (job titles, ratings, etc.)
- `patterns/defaults.yaml` - Default values and processing constants

## Schema Features

### Complete Type Coverage
- **6 top-level fields**: profile, workExperiences, educations, projects, skills, custom
- **23 total data fields**: All fields the parser can extract
- **65 job titles**: Complete predefined list for detection scoring (not validation constraint)
- **10 bullet types**: Unicode bullet point recognition

### Validation Rules
- **Regex patterns**: Email, phone, location, name formatting
- **Educational institutions**: 7 keyword patterns for school detection
- **Degree recognition**: 5 keyword patterns plus abbreviation matching
- **GPA validation**: 0.00-4.99 scale and percentage grades (≤110)

### Parser Behavior Matching
- **Required fields**: All fields required (parser guarantees structure)
- **Default values**: Empty strings, empty arrays, rating=4 for skills
- **Feature scoring**: -4 to +4 range matching parser algorithm
- **Constraints**: Max 6 featured skills, flexible date formats

## Usage Examples

### Basic Validation
```javascript
import Ajv from 'ajv';
import schema from './public/schemas/resume-schema.yaml';

const ajv = new Ajv();
const validate = ajv.compile(schema);

const resumeData = {
  profile: { name: "John Doe", email: "john@example.com", ... },
  workExperiences: [...],
  // ... other fields
};

const isValid = validate(resumeData);
if (!isValid) {
  console.log(validate.errors);
}
```

### TypeScript Generation
```bash
# Generate TypeScript interfaces from schema
json2ts public/schemas/resume-schema.yaml > types/resume.ts
```

### Documentation Generation
```bash
# Generate human-readable docs
jsonschema2md public/schemas/resume-schema.yaml
```

## Field Specifications

### Profile Fields
- `name`: Letters, spaces, periods only
- `email`: Simple but effective email validation
- `phone`: US phone formats with flexible separators
- `location`: "City, ST" format with proper capitalization
- `url`: Multiple URL format support (standard, http/https, www)
- `summary`: Professional summary or objective statement

### Work Experience Fields
- `company`: Company/organization name (extracted via feature scoring)
- `jobTitle`: Full job title text as extracted from resume (predefined 65 titles used for detection scoring only, not validation)
- `date`: Flexible date formats (MM/YYYY, Season YYYY, "Present", etc.)
- `descriptions`: Array of job responsibilities (from bullet point extraction)

### Education Fields
- `school`: Must contain educational institution keywords
- `degree`: Must match degree keywords or abbreviation patterns
- `date`: Same flexible date formats as work experience
- `gpa`: 0.00-4.99 format or percentage grades ≤110
- `descriptions`: Academic achievements and activities

### Project Fields
- `project`: Project name/title (bold text preference)
- `date`: Project timeline (same date patterns)
- `descriptions`: Project details and outcomes

### Skills Fields
- `featuredSkills`: Array of up to 6 skills with 1-5 ratings (default: 4)
- `descriptions`: Additional skills as string array

### Custom Fields
- `descriptions`: Currently always empty array (future extensibility)

## Parser Implementation Details

### Processing Pipeline
1. **PDF Text Extraction**: pdfjs-dist with font resolution
2. **Line Grouping**: Statistical character width analysis
3. **Section Detection**: Bold+uppercase primary, keyword fallback
4. **Data Extraction**: Feature scoring system (-4 to +4 range)

### Extraction Algorithms
- **Feature Scoring**: Boolean and regex patterns with positive/negative weights
- **Subsection Division**: Line gap analysis (1.4x threshold) with bold text fallback
- **Bullet Processing**: 10 Unicode bullet types with automatic detection
- **Statistical Analysis**: Typical character width and line gap calculation

### Robustness Features
- **Multiple fallbacks**: Every detection method has backup heuristics
- **Error recovery**: Graceful degradation to default values
- **Format tolerance**: Handles poorly formatted PDFs via adjacent text merging
- **Encoding normalization**: Soft hyphen fixes and space recovery

## Constraints and Limitations

### Parser Constraints
- **Single column PDFs only**: Multi-column layouts not supported
- **English language only**: Optimized for English text patterns
- **Font dependencies**: Bold detection requires proper PDF font metadata
- **Section ordering**: Assumes traditional resume section arrangement

### Validation Constraints
- **Job titles**: Limited to 65 predefined options
- **Phone format**: US format patterns only
- **Location format**: "City, State" format required
- **GPA range**: 0.00-4.99 or percentage ≤110

## Schema Versioning

- **Version 1.0.0**: Initial release based on complete parser reverse engineering
- **JSON Schema Draft**: 2020-12 specification
- **Compatibility**: Matches OpenResume parser output exactly

## Future Development

This schema provides the foundation for:
- **JSON parser development**: Complete data structure specification
- **Validation systems**: Comprehensive field validation rules
- **Type generation**: TypeScript interface generation
- **Documentation**: Automated schema documentation
- **Testing**: Parser output validation and testing

The schemas are designed for maximum utility in building alternative parsers while maintaining 100% compatibility with the existing OpenResume parser behavior and output structure.