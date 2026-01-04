import { BaseForm } from "components/ResumeForm/Form";
import { Input, Textarea } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeProfile, selectProfile } from "lib/redux/resumeSlice";
import { ResumeProfile } from "lib/redux/types";

export const ProfileForm = () => {
  const profile = useAppSelector(selectProfile);
  const dispatch = useAppDispatch();
  const { name, email, phone, linkedIn, summary, location, github, portfolio} = profile;

  const handleProfileChange = (field: keyof ResumeProfile, value: string) => {
    dispatch(changeProfile({ field, value }));
  };

  return (
    <BaseForm>
      <div className="">
        <Input
          label="Name"
          labelClassName="col-span-full"
          name="name"
          placeholder="Sal Khan"
          value={name}
          onChange={handleProfileChange}
        />
        <Textarea
          label="Objective"
          labelClassName="col-span-full"
          name="summary"
          placeholder="Entrepreneur and educator obsessed with making education free for anyone"
          value={summary}
          onChange={handleProfileChange}
        />
        <div className="grid grid-cols-2 gap-4 mt-4">
        <Input
          label="Email"
          name="email"
          placeholder="hello@khanacademy.org"
          value={email}
          onChange={handleProfileChange}
        />
        <Input
          label="Phone"
          name="phone"
          placeholder="(123)456-7890"
          value={phone}
          onChange={handleProfileChange}
        />
        <Input
          label="LinkedIn Username"
          name="linkedIn"
          placeholder="pontusberg.com"
          value={linkedIn}
          onChange={handleProfileChange}
        />
        <Input 
          label="GitHub Username"
          name="github"
          placeholder="github.com/pontusBerg"
          value={github}
          onChange={handleProfileChange}
        />
        <Input 
          label="Portfolio"
          name="portfolio"
          placeholder="pontusberg.com"
          value={portfolio}
          onChange={handleProfileChange}
        />
        <Input
          label="Location"
          name="location"
          placeholder="NYC, NY"
          value={location}
          onChange={handleProfileChange}
        />
        </div>
      </div>
    </BaseForm>
  );
};
