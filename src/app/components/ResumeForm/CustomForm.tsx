import { Form } from "components/ResumeForm/Form";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import { BulletListTextarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import {
  changeCustomSection,
  selectCustomSectionById,
} from "lib/redux/resumeSlice";
import {
  selectShowBulletPoints,
  changeShowBulletPoints,
} from "lib/redux/settingsSlice";

export const CustomForm = ({ sectionId }: { sectionId: string }) => {
  const section = useAppSelector(selectCustomSectionById(sectionId));
  const dispatch = useAppDispatch();
  const descriptions = section?.descriptions ?? [];
  const showBulletPoints = useAppSelector(selectShowBulletPoints(sectionId));

  const handleCustomChange = (field: "descriptions", value: string[]) => {
    dispatch(changeCustomSection({ sectionId, field, value }));
  };

  const handleShowBulletPoints = (value: boolean) => {
    dispatch(changeShowBulletPoints({ field: sectionId, value }));
  };

  return (
    <Form form={sectionId}>
      <div className="col-span-full grid grid-cols-6 gap-3">
        <div className="relative col-span-full">
          <BulletListTextarea
            label="Custom Textbox"
            labelClassName="col-span-full"
            name="descriptions"
            placeholder="Bullet points"
            value={descriptions}
            onChange={handleCustomChange}
            showBulletPoints={showBulletPoints ?? true}
          />
          <div className="absolute left-[7.7rem] top-[0.07rem]">
            <BulletListIconButton
              showBulletPoints={showBulletPoints ?? true}
              onClick={handleShowBulletPoints}
            />
          </div>
        </div>
      </div>
    </Form>
  );
};
