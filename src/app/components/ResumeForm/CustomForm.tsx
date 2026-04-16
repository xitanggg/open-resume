import { Form } from "components/ResumeForm/Form";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import { BulletListTextarea, InputGroupWrapper } from "components/ResumeForm/Form/InputGroup";
import { CommaInput } from "components/ResumeForm/Form/CommaInput";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeCustom, selectCustom } from "lib/redux/resumeSlice";
import {
  selectShowBulletPoints,
  changeShowBulletPoints,
  selectCustomDisplayMode,
  changeCustomDisplayMode,
} from "lib/redux/settingsSlice";

export const CustomForm = () => {
  const custom = useAppSelector(selectCustom);
  const dispatch = useAppDispatch();
  const { descriptions } = custom;
  const form = "custom";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));
  const customDisplayMode = useAppSelector(selectCustomDisplayMode) ?? "bullet";

  const handleCustomChange = (field: "descriptions", value: string[]) => {
    dispatch(changeCustom({ field, value }));
  };

  const handleShowBulletPoints = (value: boolean) => {
    dispatch(changeShowBulletPoints({ field: form, value }));
  };

  return (
    <Form form={form}>
      <div className="col-span-full grid grid-cols-6 gap-3">
        {/* Display mode toggle */}
        <div className="col-span-full flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Display mode:
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => dispatch(changeCustomDisplayMode("bullet"))}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                customDisplayMode === "bullet"
                  ? "border-sky-400 bg-sky-400 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              • Bullet List
            </button>
            <button
              type="button"
              onClick={() => dispatch(changeCustomDisplayMode("comma"))}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                customDisplayMode === "comma"
                  ? "border-sky-400 bg-sky-400 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              , Comma Separated
            </button>
          </div>
        </div>

        {customDisplayMode === "bullet" ? (
          <div className="relative col-span-full">
            <BulletListTextarea
              label="Custom Textbox"
              labelClassName="col-span-full"
              name="descriptions"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleCustomChange}
              showBulletPoints={showBulletPoints}
            />
            <div className="absolute left-[7.7rem] top-[0.07rem]">
              <BulletListIconButton
                showBulletPoints={showBulletPoints}
                onClick={handleShowBulletPoints}
              />
            </div>
          </div>
        ) : (
          <div className="col-span-full">
            <InputGroupWrapper label="Custom (comma separated)" className="col-span-full">
              <CommaInput
                items={descriptions}
                onChange={(value) => handleCustomChange("descriptions", value)}
              />
            </InputGroupWrapper>
            <p className="mt-1 text-xs text-gray-500">
              Items will appear inline separated by commas on the resume.
            </p>
          </div>
        )}
      </div>
    </Form>
  );
};
