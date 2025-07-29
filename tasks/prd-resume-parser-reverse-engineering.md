# Product Requirements Document: Resume Parser Reverse Engineering & Schema Documentation

## Introduction/Overview

This project involves reverse engineering the existing PDF resume parsing logic in the OpenResume application to create comprehensive documentation of all supported fields, properties, and data structures. The primary deliverable will be JSON schema files (in YAML format) that fully document the intermediate data format used by the current parser. This documentation will serve as the foundation for future development of alternative parsers (JSON, Markdown) that can produce equivalent intermediate data.

## Goals

1. **Analyze Current PDF Parsing Logic**: Understand how the existing parser processes PDF resumes and extracts data
2. **Document Data Structures**: Create complete documentation of all fields, properties, and validation rules used by the current parser
3. **Create JSON Schemas**: Develop comprehensive JSON schema files in YAML format that mirror the current parser's data structure requirements
4. **Establish Schema Foundation**: Provide the technical foundation needed for future JSON/Markdown parser development

## User Stories

1. **As a developer**, I want to understand how the current PDF parser works so that I can create equivalent parsers for other input formats
2. **As a developer**, I want comprehensive schema documentation so that I can ensure new parsers produce compatible intermediate data
3. **As a developer**, I want modular schema files so that I can easily understand and work with specific resume sections
4. **As a project maintainer**, I want documented parsing logic so that I can maintain consistency across different input formats

## Functional Requirements

### Phase 1: Current Parser Analysis
1. **The system must analyze** the two example PDF resumes in `public/resume-example/` to understand structural differences
2. **The system must document** all parsing logic found in `src/app/lib/parse-resume-from-pdf/`
3. **The system must identify** all data extraction methods and their corresponding output formats
4. **The system must catalog** all resume sections currently supported (profile, work experience, education, skills, projects, etc.)
5. **The system must document** any validation rules, field requirements, or data transformations applied during parsing

### Phase 2: Data Structure Documentation
6. **The system must map** the complete data flow from PDF input to intermediate data structure
7. **The system must identify** all possible field types, required vs optional fields, and data validation rules
8. **The system must document** nested data structures (arrays, objects) and their relationships
9. **The system must catalog** any edge cases or special handling logic in the current parser

### Phase 3: Schema Creation
10. **The system must create** JSON schema files in YAML format using the latest JSON Schema specification
11. **The system must organize** schemas into logical sections (one file per major resume section if beneficial for processing)
12. **The system must include** all validation rules (regex patterns, min/max lengths, etc.) that mirror current parser behavior
13. **The system must place** all schema files in a new `public/schemas/` directory
14. **The system must ensure** schemas accurately represent the intermediate data format used by the current parser

## Non-Goals (Out of Scope)

- **Implementation of new parsers** (JSON, Markdown) - this is for future development
- **Modification of existing parsing logic** - only documentation and analysis
- **User interface changes** - this is purely backend/data structure work
- **Performance optimization** of existing parser
- **Additional documentation** beyond schema files
- **Testing of parsing logic** - focus is on understanding and documenting existing behavior

## Design Considerations

- **Modular Schema Structure**: Consider splitting schemas by resume section (profile.yaml, experience.yaml, education.yaml, etc.) for easier AI processing and maintenance
- **Directory Structure**: Create `public/schemas/` directory to house all schema files
- **File Naming Convention**: Use descriptive names that clearly indicate the resume section or data type being documented
- **Schema Organization**: Structure schemas to mirror the actual data flow and relationships in the current parser

## Technical Considerations

- **JSON Schema Version**: Use the latest JSON Schema specification (currently Draft 2020-12)
- **YAML Format**: All schemas must be written in YAML format for better readability and maintenance
- **Validation Compatibility**: Ensure validation rules in schemas match exactly what the current parser enforces
- **Data Type Accuracy**: Document exact data types (string, number, boolean, array, object) used by current parser
- **Integration Points**: Consider how schemas will be used by future parser implementations

## Success Metrics

1. **Complete Field Coverage**: All fields and properties used by the current parser are documented in the schemas
2. **Validation Accuracy**: Schema validation rules match the current parser's requirements exactly
3. **Structural Fidelity**: Schemas accurately represent the intermediate data format produced by existing parser
4. **Future-Ready Foundation**: Schemas provide sufficient detail for implementing equivalent JSON/Markdown parsers
5. **Modular Organization**: Schema files are organized in a way that facilitates easy understanding and maintenance

## Open Questions

1. Are there any undocumented features or edge cases in the current parser that need special attention?
2. Should we include examples in the schema files to illustrate expected data formats?
3. Are there any specific schema validation tools we should test against to ensure compatibility?
4. Should we create a master schema file that references all section schemas, or keep them completely separate?

## Deliverables

- **Analysis Documentation**: Understanding of current PDF parsing logic and data flow
- **Schema Files**: Complete JSON schemas in YAML format covering all resume sections and data types
- **Directory Structure**: `public/schemas/` directory containing all schema files
- **Validation Rules**: Comprehensive documentation of all field requirements and constraints used by current parser