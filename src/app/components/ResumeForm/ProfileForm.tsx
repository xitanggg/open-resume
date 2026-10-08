import { BaseForm } from "components/ResumeForm/Form";

import {
  Input,
  Textarea,
} from "components/ResumeForm/Form/InputGroup";

import {
  useAppDispatch,
  useAppSelector,
} from "lib/redux/hooks";

import {
  changeProfile,
  selectProfile,
} from "lib/redux/resumeSlice";

import { ResumeProfile } from "lib/redux/types";

const PROFILE_FIELD_MAX_LENGTHS = {
  name: 20,
  email: 25,
  phone: 50,
  url: 50,
  location: 200,
  summary: 500,
} as const;

export const ProfileForm = () => {
  const profile =
    useAppSelector(selectProfile);

  const dispatch = useAppDispatch();

  const {
    name,
    email,
    phone,
    url,
    summary,
    location,
  } = profile;

  const handleProfileChange = (
    field: keyof ResumeProfile,
    value: string
  ) => {
    dispatch(
      changeProfile({
        field,
        value,
      })
    );
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
          maxLength={
            PROFILE_FIELD_MAX_LENGTHS.name
          }
          onChange={
            handleProfileChange
          }
        />

        <Textarea
          label="Objective"
          labelClassName="col-span-full"
          name="summary"
          placeholder="Entrepreneur and educator obsessed with making education free for anyone"
          value={summary}
          maxLength={
            PROFILE_FIELD_MAX_LENGTHS.summary
          }
          onChange={
            handleProfileChange
          }
        />

        <Input
          label="Email"
          labelClassName="col-span-4"
          name="email"
          placeholder="hello@khanacademy.org"
          value={email}
          maxLength={
            PROFILE_FIELD_MAX_LENGTHS.email
          }
          onChange={
            handleProfileChange
          }
        />

        <Input
          label="Phone"
          labelClassName="col-span-2"
          name="phone"
          placeholder="(123)456-7890"
          value={phone}
          maxLength={
            PROFILE_FIELD_MAX_LENGTHS.phone
          }
          onChange={
            handleProfileChange
          }
        />

        <Input
          label="Website"
          labelClassName="col-span-4"
          name="url"
          placeholder="linkedin.com/in/khanacademy"
          value={url}
          maxLength={
            PROFILE_FIELD_MAX_LENGTHS.url
          }
          onChange={
            handleProfileChange
          }
        />

        <Input
          label="Location"
          labelClassName="col-span-2"
          name="location"
          placeholder="NYC, NY"
          value={location}
          maxLength={
            PROFILE_FIELD_MAX_LENGTHS.location
          }
          onChange={
            handleProfileChange
          }
        />
      </div>
    </BaseForm>
  );
};