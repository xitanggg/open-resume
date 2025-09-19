import { useCallback } from "react";
import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  BulletListTextarea,
} from "components/ResumeForm/Form/InputGroup";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { selectProjects, changeProjects } from "lib/redux/resumeSlice";
import type { ResumeProject } from "lib/redux/types";

export const ProjectsForm = () => {
  const projects = useAppSelector(selectProjects);
  const dispatch = useAppDispatch();
  const showDelete = projects.length > 1;

  return (
    <Form form="projects" addButtonText="Add Project">
      {projects.map((project, idx) => (
        <ProjectFormSection
          key={idx}
          project={project}
          idx={idx}
          showDelete={showDelete}
          showMoveUp={idx !== 0}
          showMoveDown={idx !== projects.length - 1}
        />
      ))}
    </Form>
  );
};

const ProjectFormSection = ({
  project,
  idx,
  showDelete,
  showMoveUp,
  showMoveDown,
}: {
  project: ResumeProject;
  idx: number;
  showDelete: boolean;
  showMoveUp: boolean;
  showMoveDown: boolean;
}) => {
  const {
    project: projectName,
    date,
    descriptions,
    github,
    demo,
  } = project;
  const dispatch = useAppDispatch();

  const handleProjectChange = useCallback(
    (...[field, value]: CreateHandleChangeArgsWithDescriptions<ResumeProject>) => {
      dispatch(changeProjects({ idx, field, value } as any));
    },
    [dispatch, idx]
  );

  return (
    <FormSection
      form="projects"
      idx={idx}
      showMoveUp={showMoveUp}
      showMoveDown={showMoveDown}
      showDelete={showDelete}
      deleteButtonTooltipText="Delete project"
    >
      <Input
        name="project"
        label="Project Name"
        placeholder="OpenResume"
        value={projectName}
        onChange={handleProjectChange}
        labelClassName="col-span-4"
      />
      <Input
        name="date"
        label="Date"
        placeholder="Winter 2022"
        value={date}
        onChange={handleProjectChange}
        labelClassName="col-span-2"
      />
      <Input
        name="github"
        label="GitHub"
        placeholder="github.com/user/repo"
        value={github}
        onChange={handleProjectChange}
        labelClassName="col-span-3"
      />
      <Input
        name="demo"
        label="Demo"
        placeholder="user.github.io/repo"
        value={demo}
        onChange={handleProjectChange}
        labelClassName="col-span-3"
      />
      <BulletListTextarea
        name="descriptions"
        label="Description"
        placeholder="Bullet points"
        value={descriptions}
        onChange={handleProjectChange}
        labelClassName="col-span-full"
      />
    </FormSection>
  );
};