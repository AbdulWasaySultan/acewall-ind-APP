import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import PhoneInput from "react-phone-input-2";

const PersonalInfo = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const formData = watch();

  const { phone = "" } = watch();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="firstName"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            First Name <span className="text-red-600">*</span>
          </Label>
          <Input
            type="text"
            name="firstName"
            id="firstName"
            maxLength={15}
            placeholder="John"
            {...register("firstName")}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <div className="h-4 mt-1">
            {errors?.firstName && (
              <p className="text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label
            htmlFor="middleName"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Middle Name
          </Label>
          <Input
            type="text"
            name="middleName"
            id="middleName"
            maxLength={15}
            placeholder="M."
            {...register("middleName")}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <div className="h-4 mt-1">
            {errors?.middleName && (
              <p className="text-xs text-red-600">
                {errors.middleName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label
            htmlFor="lastName"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Last Name <span className="text-red-600">*</span>
          </Label>
          <Input
            type="text"
            name="lastName"
            id="lastName"
            maxLength={15}
            placeholder="Doe"
            {...register("lastName")}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <div className="h-4 mt-1">
            {errors?.lastName && (
              <p className="text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-600">*</span>
          </Label>
          <PhoneInput
            country={"us"}
            value={phone}
            onChange={(value) => setValue("phone", value)}
            inputClass="w-full rounded-lg pl-12 py-2 bg-gray-50"
            disableDropdown={false}
          />
          <p className="text-xs text-red-600 mt-1">{errors?.phone?.message}</p>
        </div>
      </div>
      <section>
        <div>
          <Label className="flex flex-col space-x-2">
            <Input
              type="checkbox"
              id="smsConsent"
              {...register("smsConsent")}
              className="w-4 h-4"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              I agree to receive SMS notifications from Acewall Scholars,
              including account verification codes, academic announcements,
              grades, and schedule updates. Message frequency may vary. Message
              and data rates may apply. Reply STOP to unsubscribe or HELP for
              help. Consent to receive SMS messages is not a condition of
              purchase.
            </span>
          </Label>
          <div className="h-4 mt-1">
            {errors?.smsConsent && (
              <p className="text-xs text-red-600">
                {errors.smsConsent.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4"></div>
    </>
  );
};

export default PersonalInfo;
