import { BaseForm } from "components/ResumeForm/Form";
import { Input, Textarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeProfile, selectProfile } from "lib/redux/resumeSlice";
import {
  changeContactOrder,
  selectContactOrder,
} from "lib/redux/settingsSlice";
import { ResumeProfile } from "lib/redux/types";
import { ArrowSmallUpIcon, ArrowSmallDownIcon } from "@heroicons/react/24/outline";

const CONTACT_FIELD_CONFIG: Record<
  string,
  { label: string; placeholder: string }
> = {
  email: { label: "Email", placeholder: "hello@khanacademy.org" },
  phone: { label: "Phone", placeholder: "(123)456-7890" },
  url: { label: "Website", placeholder: "linkedin.com/in/khanacademy" },
  github: { label: "GitHub", placeholder: "github.com/username" },
  location: { label: "Location", placeholder: "NYC, NY" },
};

export const ProfileForm = () => {
  const profile = useAppSelector(selectProfile);
  const contactOrder = useAppSelector(selectContactOrder) ?? [
    "email",
    "phone",
    "url",
    "github",
    "location",
  ];
  const dispatch = useAppDispatch();
  const { name, summary } = profile;

  const handleProfileChange = (field: keyof ResumeProfile, value: string) => {
    dispatch(changeProfile({ field, value }));
  };

  return (
    <BaseForm>
      <div className="grid grid-cols-6 gap-3">
        <Input
          label="Name"
          labelClassName="col-span-full"
          name="name"
          placeholder="Sal Khan"
          value={name}
          onChange={handleProfileChange}
        />
        {/* Contact fields — reorderable with up/down arrows */}
        <div className="col-span-full space-y-2">
          <p className="text-sm font-medium text-gray-500">
            Contact Info{" "}
            <span className="font-normal text-gray-400">(drag ↕ to reorder)</span>
          </p>
          {contactOrder.map((field, idx) => {
            const config = CONTACT_FIELD_CONFIG[field];
            if (!config) return null;
            const isFirst = idx === 0;
            const isLast = idx === contactOrder.length - 1;
            return (
              <div key={field} className="flex items-end gap-2">
                <div className="mb-1 flex flex-col gap-0.5 self-end pb-1">
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() =>
                      dispatch(changeContactOrder({ field, direction: "up" }))
                    }
                    className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowSmallUpIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() =>
                      dispatch(changeContactOrder({ field, direction: "down" }))
                    }
                    className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowSmallDownIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Input
                  label={config.label}
                  labelClassName="flex-1 min-w-0"
                  name={field as keyof ResumeProfile}
                  placeholder={config.placeholder}
                  value={profile[field as keyof ResumeProfile] ?? ""}
                  onChange={handleProfileChange}
                />
              </div>
            );
          })}
        </div>

        <Textarea
          label="Objective"
          labelClassName="col-span-full"
          name="summary"
          placeholder="Entrepreneur and educator obsessed with making education free for anyone"
          value={summary}
          onChange={handleProfileChange}
        />
      </div>
    </BaseForm>
  );
};
