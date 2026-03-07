import { useState } from "react";
import { Form } from "components/ResumeForm/Form";
import {
  BulletListTextarea,
  InputGroupWrapper,
} from "components/ResumeForm/Form/InputGroup";
import { FeaturedSkillInput } from "components/ResumeForm/Form/FeaturedSkillInput";
import { BulletListIconButton } from "components/ResumeForm/Form/IconButton";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { selectSkills, changeSkills } from "lib/redux/resumeSlice";
import {
  selectShowBulletPoints,
  changeShowBulletPoints,
  selectThemeColor,
  selectSkillsDisplayMode,
  changeSkillsDisplayMode,
} from "lib/redux/settingsSlice";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// ---- Comma Skills chip input ----
const CommaSkillsInput = ({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (value: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addSkills = (raw: string) => {
    const newSkills = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (newSkills.length > 0) {
      onChange([...skills, ...newSkills]);
      setInputValue("");
    }
  };

  const deleteSkill = (idx: number) => {
    onChange(skills.filter((_, i) => i !== idx));
  };

  const moveSkill = (idx: number, direction: "left" | "right") => {
    const newSkills = [...skills];
    const swapIdx = direction === "left" ? idx - 1 : idx + 1;
    const temp = newSkills[idx];
    newSkills[idx] = newSkills[swapIdx];
    newSkills[swapIdx] = temp;
    onChange(newSkills);
  };

  return (
    <div className="mt-1 min-h-[72px] flex flex-wrap gap-1.5 items-start rounded-md border border-gray-300 bg-white p-2 shadow-sm">
      {skills.map((skill, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-0.5 rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-sm text-gray-800"
        >
          <button
            type="button"
            onClick={() => moveSkill(idx, "left")}
            disabled={idx === 0}
            className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-25"
            title="Move left"
          >
            <ChevronLeftIcon className="h-3 w-3" />
          </button>
          <span className="mx-0.5">{skill}</span>
          <button
            type="button"
            onClick={() => moveSkill(idx, "right")}
            disabled={idx === skills.length - 1}
            className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-25"
            title="Move right"
          >
            <ChevronRightIcon className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => deleteSkill(idx)}
            className="ml-0.5 p-0.5 text-gray-400 hover:text-red-500"
            title="Remove skill"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="min-w-[160px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400 px-1"
        placeholder={skills.length === 0 ? "Type a skill, press Enter or comma to add" : "Add more…"}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkills(inputValue);
          }
          if (
            e.key === "Backspace" &&
            inputValue === "" &&
            skills.length > 0
          ) {
            deleteSkill(skills.length - 1);
          }
        }}
        onBlur={() => {
          if (inputValue.trim()) addSkills(inputValue);
        }}
      />
    </div>
  );
};

export const SkillsForm = () => {
  const skills = useAppSelector(selectSkills);
  const dispatch = useAppDispatch();
  const { featuredSkills, descriptions } = skills;
  const form = "skills";
  const showBulletPoints = useAppSelector(selectShowBulletPoints(form));
  const themeColor = useAppSelector(selectThemeColor) || "#38bdf8";
  const skillsDisplayMode = useAppSelector(selectSkillsDisplayMode) ?? "bullet";

  const handleSkillsChange = (field: "descriptions", value: string[]) => {
    dispatch(changeSkills({ field, value }));
  };
  const handleFeaturedSkillsChange = (
    idx: number,
    skill: string,
    rating: number
  ) => {
    dispatch(changeSkills({ field: "featuredSkills", idx, skill, rating }));
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
            Skills display:
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => dispatch(changeSkillsDisplayMode("bullet"))}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                skillsDisplayMode === "bullet"
                  ? "border-sky-400 bg-sky-400 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              • Bullet List
            </button>
            <button
              type="button"
              onClick={() => dispatch(changeSkillsDisplayMode("comma"))}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                skillsDisplayMode === "comma"
                  ? "border-sky-400 bg-sky-400 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              , Comma Separated
            </button>
          </div>
        </div>

        {skillsDisplayMode === "bullet" ? (
          <div className="relative col-span-full">
            <BulletListTextarea
              label="Skills List"
              labelClassName="col-span-full"
              name="descriptions"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleSkillsChange}
              showBulletPoints={showBulletPoints}
            />
            <div className="absolute left-[4.5rem] top-[0.07rem]">
              <BulletListIconButton
                showBulletPoints={showBulletPoints}
                onClick={handleShowBulletPoints}
              />
            </div>
          </div>
        ) : (
          <div className="col-span-full">
            <InputGroupWrapper label="Skills (comma separated)" className="col-span-full">
              <CommaSkillsInput
                skills={descriptions}
                onChange={(value) => handleSkillsChange("descriptions", value)}
              />
            </InputGroupWrapper>
            <p className="mt-1 text-xs text-gray-500">
              Skills will appear inline separated by commas on the resume.
            </p>
          </div>
        )}

        <div className="col-span-full mb-4 mt-6 border-t-2 border-dotted border-gray-200" />
        <InputGroupWrapper
          label="Featured Skills (Optional)"
          className="col-span-full"
        >
          <p className="mt-2 text-sm font-normal text-gray-600">
            Featured skills is optional to highlight top skills, with more
            circles mean higher proficiency.
          </p>
        </InputGroupWrapper>

        {featuredSkills.map(({ skill, rating }, idx) => (
          <FeaturedSkillInput
            key={idx}
            className="col-span-3"
            skill={skill}
            rating={rating}
            setSkillRating={(newSkill, newRating) => {
              handleFeaturedSkillsChange(idx, newSkill, newRating);
            }}
            placeholder={`Featured Skill ${idx + 1}`}
            circleColor={themeColor}
          />
        ))}
      </div>
    </Form>
  );
};
