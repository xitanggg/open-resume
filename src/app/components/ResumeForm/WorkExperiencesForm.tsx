import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  Textarea,
} from "components/ResumeForm/Form/InputGroup";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeWorkExperiences,
  selectWorkExperiences,
} from "lib/redux/resumeSlice";
import type { ResumeWorkExperience } from "lib/redux/types";

export const WorkExperiencesForm = () => {
  const workExperiences = useAppSelector(selectWorkExperiences);
  const dispatch = useAppDispatch();

  const showDelete = workExperiences.length > 1;

  return (
    <Form form="workExperiences" addButtonText="Add Job">
      {workExperiences.map(({ company, jobTitle, date, descriptions }, idx) => {
        const handleWorkExperienceChange = (
          field: keyof ResumeWorkExperience,
          value: string | string[]
        ) => {
          dispatch(changeWorkExperiences({ idx, field, value } as any));
        };

        const handleDescriptionChange = (name: string, value: string) => {
          // Split by newline to convert to string array
          const descriptionsArray = value.split('\n');
          handleWorkExperienceChange('descriptions', descriptionsArray);
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== workExperiences.length - 1;

        // Join descriptions array back to string for textarea
        const descriptionText = descriptions.join('\n');

        return (
          <FormSection
            key={idx}
            form="workExperiences"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText="Delete job"
          >
            <Input
              label="Company"
              labelClassName="col-span-full"
              name="company"
              placeholder="Khan Academy"
              value={company}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label="Job Title"
              labelClassName="col-span-4"
              name="jobTitle"
              placeholder="Software Engineer"
              value={jobTitle}
              onChange={handleWorkExperienceChange}
            />
            <Input
              label="Date"
              labelClassName="col-span-2"
              name="date"
              placeholder="Jun 2022 - Present"
              value={date}
              onChange={handleWorkExperienceChange}
            />
            <Textarea
              label="Description"
              labelClassName="col-span-full"
              name="descriptions"
              placeholder="[Project Name]&#10;- Main achievement&#10;  - Sub detail"
              value={descriptionText}
              onChange={handleDescriptionChange}
            />
          </FormSection>
        );
      })}
    </Form>
  );
};
