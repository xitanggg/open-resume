import { Form, FormSection } from "components/ResumeForm/Form";
import {
  Input,
  BulletListTextarea,
} from "components/ResumeForm/Form/InputGroup";
import type { CreateHandleChangeArgsWithDescriptions } from "components/ResumeForm/types";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { selectAwards, changeAwards } from "lib/redux/resumeSlice";
import type { ResumeAward } from "lib/redux/types";

export const AwardsForm = () => {
  const awards = useAppSelector(selectAwards);
  const dispatch = useAppDispatch();
  const showDelete = awards.length > 1;

  return (
    <Form form="awards" addButtonText="Add Awards">
      {awards.map(({ award, date, descriptions }, idx) => {
        const handleAwardChange = (
          ...[
            field,
            value,
          ]: CreateHandleChangeArgsWithDescriptions<ResumeAward>
        ) => {
          dispatch(changeAwards({ idx, field, value } as any));
        };
        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== awards.length - 1;

        return (
          <FormSection
            key={idx}
            form="awards"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText={"Delete awards"}
          >
            <Input
              name="award"
              label="Award Name"
              placeholder="OpenResume"
              value={award}
              onChange={handleAwardChange}
              labelClassName="col-span-4"
            />
            <Input
              name="date"
              label="Date"
              placeholder="Winter 2022"
              value={date}
              onChange={handleAwardChange}
              labelClassName="col-span-2"
            />
            <BulletListTextarea
              name="descriptions"
              label="Description"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleAwardChange}
              labelClassName="col-span-full"
            />
          </FormSection>
        );
      })}
    </Form>
  );
};
