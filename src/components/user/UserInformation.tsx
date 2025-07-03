import { useTranslation } from "react-i18next";
import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import Button from "../../lib/components/atoms/Button";
import Input from "../../lib/components/atoms/Input";
import Label from "../../lib/components/atoms/Label";
import PhoneInput from "../../lib/components/atoms/PhoneInput";
import Typography from "../../lib/components/atoms/Typography";
import { useMutation } from "@tanstack/react-query";

import authService from "../../services/auth.service";

// 📌 Type definitions
interface UserData {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  country_code?: string;
  mobile?: string;
  token?: string;
}

interface FormValues {
  first_name: string;
  last_name: string;
  company_name: string;
  country_code: string;
  mobile: string;
}

interface UserInformationProps {
  userData: UserData;
}

// 📌 Fixed Validation Schema - field names now match form fields
const validationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  company_name: Yup.string().required("Company name is required"),
  country_code: Yup.string().required("Country code is required"),
  mobile: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
});

const UserInformation = ({ userData }: UserInformationProps) => {
  const { t } = useTranslation();

  // 🔥 HOOK MUST BE CALLED BEFORE ANY EARLY RETURNS
  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();

      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await authService.editProfile(data)
      return res.data;
    },
    onSuccess: (res) => {
      console.log("Profile updated successfully:", res);
      // Add success notification here
      // toast.success(t("profile_updated_successfully"));
    },
    onError: (error) => {
      console.error("Error during profile update:", error);
      // Add error notification here
      // toast.error(t("profile_update_error"));
    },
  });

  // 📌 NOW SAFE TO HAVE EARLY RETURNS AFTER ALL HOOKS
  if (!userData) {
    return (
      <div className="bg-white p-4 md:p-6 lg:p-10 w-full">
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100"
        >
          {t("basic_information")}
        </Typography>
        <div className="mt-6">
          <Typography>{t("loading_user_information")}</Typography>
        </div>
      </div>
    );
  }

  const initialValues: FormValues = {
    first_name: userData.first_name || "",
    last_name: userData.last_name || "",
    company_name: userData.company_name || "",
    country_code: userData.country_code || "+91",
    mobile: userData.mobile || "",
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const payload = {
        ...values,
      };

      await updateProfileMutation.mutateAsync(payload);
      console.log("Payload submitted:", payload);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 lg:p-10 w-full">
      <Typography size="xl_2" weight="extrabold" className="text-secondary-100">
        {t("basic_information")}
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form>
            {/* First + Last Name */}
            <div className="flex flex-col md:flex-row gap-3 mt-6">
              <div className="w-full">
                <Label htmlFor="first_name">{t("first_name")}</Label>
                <Input
                  placeholder={t("enter_first_name")}
                  type="text"
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="w-full">
                <Label htmlFor="last_name">{t("last_name")}</Label>
                <Input
                  placeholder={t("enter_last_name")}
                  type="text"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="mt-6">
              <Label htmlFor="company_name">
                {t("name_of_organization_company")}
              </Label>
              <Input
                placeholder={t("enter_company_name")}
                name="company_name"
                value={values.company_name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <ErrorMessage
                name="company_name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Mobile Number with Country Code */}
            <div className="mt-6">
              <Label htmlFor="mobile">{t("mobile_number")}</Label>
              <PhoneInput
                countryCode={values.country_code}
                value={values.mobile}
                onOptionChange={(val: string) =>
                  setFieldValue("country_code", val)
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFieldValue("mobile", e.target.value)
                }
                options={[
                  { label: "+1", value: "+1" },
                  { label: "+91", value: "+91" },
                  { label: "+44", value: "+44" },
                ]}
              />
              <ErrorMessage
                name="country_code"
                component="div"
                className="text-red-500 text-sm"
              />
              <ErrorMessage
                name="mobile"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full md:w-fit mt-6 !py-3"
              disabled={isSubmitting || updateProfileMutation.isPending}
            >
              {isSubmitting || updateProfileMutation.isPending
                ? t("saving")
                : t("save_changes")}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UserInformation;
