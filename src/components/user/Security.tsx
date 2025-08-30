import { useTranslation } from "react-i18next";
import { useModal } from "../../hooks/useModal";
import Button from "../../lib/components/atoms/Button";
import Password from "../../lib/components/atoms/Password";
import Typography from "../../lib/components/atoms/Typography";
import ChangeEmailModal from "../modal/ChangeEmailModal";
import VerifyOtpModal from "../modal/VerifyOtpModal";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import authService from "../../services/auth.service";
import { toast } from "react-toastify";
import localStorageService from "../../services/local.service";
import { useFormik } from "formik";
import * as Yup from "yup";

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string;
  country_code: string;
  mobile: string;
  email: string;
  profile_image: string;
  type: string;
  token: string;
}
interface UserInformationProps {
  userData: UserData;
  setUserDate:(data:UserData)=>void;
}

interface ChangeEmailFields {
  email: string;
  // password: string;
  otp: string;
}

const initialChangeEmailFields: ChangeEmailFields = {
  email: "",
  // password: "",
  otp: "",
};
const Security = ({ userData,setUserDate }: UserInformationProps) => {
  const [changeEmialFields, setChangeEmailFields] = useState<ChangeEmailFields>(
    initialChangeEmailFields
  );
  const [passwordStrength, setPasswordStrength] = useState<"week" | "acceptable" | "strong" | "">("");

  const { t } = useTranslation();
  const {
    isOpen: isOpenEmailModal,
    openModal: openEmailModal,
    closeModal: closeEmailModal,
  } = useModal();

  const {
    isOpen: isOpenOtpModal,
    openModal: openOtpModal,
    closeModal: closeOtpModal,
  } = useModal();

  const handelOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    setChangeEmailFields((preve: any) => ({
      ...preve,
      [e.target.name]: e.target.value,
    }));
  };
  const setOtp = (otp: string) => {
    setChangeEmailFields((preve: any) => ({
      ...preve,
      otp: otp,
    }));
  };
  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await authService.sendOtp(email);
      return res;
    },
    onSuccess: () => {
      toast.success(t("otp_sent_successfully"));
    },
    onError: (error: any) => {
      if (error.status === 412) {
        return toast.error(t("email_is_already_registered"));
      }
      return toast.error(t("otp_send_error"));
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await authService.sendOtp(email);
      return res;
    },
    onSuccess: () => {
      toast.success(t("otp_sent_successfully"));
    },
    onError: (error: any) => {
      if (error.status === 412) {
        return toast.error(t("email_is_already_registered"));
      }
      return toast.error(t("otp_send_error"));
    },
  });
  const handelSendOtp = async () => {
    console.log(changeEmialFields, "changeEmialFields");
    const res = await sendOtpMutation.mutateAsync(changeEmialFields.email);
    if (res.status === 200) {
      closeEmailModal();
      openOtpModal();
    }
  };

  const handleResendOtp = async () => {
    // Clear the OTP field when resending
    setChangeEmailFields((prev) => ({
      ...prev,
      otp: "",
    }));
    await resendOtpMutation.mutateAsync(changeEmialFields.email);
  };
  const changeEmail = useMutation({
    mutationFn: async (data: ChangeEmailFields) => {
      const formData = new FormData();

      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await authService.changeEmail(data);      
      return res;
    },
    onSuccess: (res) => {
      console.log("Email updated successfully:", res);
      setChangeEmailFields(initialChangeEmailFields);
      // Add success notification here
      // toast.success(t("email_updated_successfully"));
    },
    onError: (error) => {
      console.error("Error during Email update:", error);
      // Add error notification here
      // toast.error(t("email_update_error"));
    },
  });
  const verifyOTP = async () => {
    const res= await changeEmail.mutateAsync(changeEmialFields);
    if(res.data.status===200){
      setUserDate({...res.data.data})
      setChangeEmailFields(initialChangeEmailFields);
      localStorageService.setUser(JSON.stringify({...userData,email:res.data.data.email}))
      closeOtpModal();
    }
  };

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required(t("current_password_required")),
    newPassword: Yup.string()
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
        t("password_requirements")
      )
      .required(t("new_password_required")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], t("passwords_must_match"))
      .required(t("confirm_password_required")),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      changePasswordMutation.mutate(values);
    },
  });
  // Password validation schema


  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) return "week";
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*#?&]/.test(password);

    if (hasLetter && hasNumber && hasSpecial) return "strong";
    if (
      (hasLetter && hasNumber) ||
      (hasLetter && hasSpecial) ||
      (hasNumber && hasSpecial)
    )
      return "acceptable";
    return "week";
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    formik.handleChange(e);
    if (e.target.name === "newPassword") {
      setPasswordStrength(checkPasswordStrength(password));
    }
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const payload={
        old_password:data.currentPassword,
        new_password:data.newPassword,
        conf_new_password:data.confirmPassword
      }            
      const res = await authService.changePassword(payload);
      return res;
    },
    onSuccess: () => {
      toast.success(t("password_updated_successfully"));
      formik.resetForm();
      setPasswordStrength("");
    },
    onError: (error: any) => {
      if (error.status === 412) {
        return toast.error(t("password_incorrect"));
      }
      return toast.error(error?.response.data.message || t("password_update_error"));
    },
  });
  return (
    <div className="w-full flex gap-4 md:gap-6 flex-col">
      <div className="bg-white p-4 md:p-6 lg:p-10">
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100"
        >
          {t("email_address")}
        </Typography>
        <div className="mt-6">
          <Typography size="base" weight="normal" className="text-secondary-60">
            {t("current_email")}
          </Typography>
          <Typography
            size="base"
            weight="normal"
            className="text-secondary-100"
          >
            {userData.email}
          </Typography>
        </div>
        <Button
          variant="primary"
          className="w-full md:w-fit mt-6 !py-3"
          onClick={openEmailModal}
        >
          {t("change_email")}
        </Button>
      </div>
      <div className="bg-white p-4 md:p-6 lg:p-10">
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100"
        >
          {t("change_password")}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <div className="mt-6">
            <Password
              labelProps={{
                children: t("current_password"),
              }}
              name="currentPassword"
              value={formik.values.currentPassword}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={
                formik.touched.currentPassword &&
                Boolean(formik.errors.currentPassword)
              }
              hint={
                formik.touched.currentPassword
                  ? formik.errors.currentPassword
                  : undefined
              }
            />
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-6 w-full">
            <div className="w-full">
              <Password
                className="w-full"
                labelProps={{
                  children: t("new_password"),
                }}
                name="newPassword"
                value={formik.values.newPassword}
                onChange={handlePasswordChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.newPassword && Boolean(formik.errors.newPassword)
                }
                hint={
                  formik.touched.newPassword
                    ? formik.errors.newPassword
                    : undefined
                }
                passwordType={passwordStrength}
              />
            </div>
            <div className="w-full">
            <Password
                labelProps={{
                  children: t("confirm_password"),
                }}
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                hint={
                  formik.touched.confirmPassword
                    ? formik.errors.confirmPassword
                    : undefined
                }
              />
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="primary"
              className="w-full md:w-fit !py-3"
              type="submit"
              disabled={!formik.isValid || changePasswordMutation.isPending}
              loading={changePasswordMutation.isPending}
            >
              {t("update_password")}
            </Button>
          </div>
        </form>
      </div>
      <ChangeEmailModal
        isOpen={isOpenEmailModal}
        onClose={closeEmailModal}
        sendOtp={handelSendOtp}
        loading={sendOtpMutation.isPending}
        onChange={handelOnChange}
        fieldValue={changeEmialFields}
      />
      <VerifyOtpModal
        isOpen={isOpenOtpModal}
        onClose={closeOtpModal}
        setOtp={setOtp}
        loading={changeEmail.isPending}
        resendLoading={resendOtpMutation.isPending}
        fieldValue={changeEmialFields}
        verifyOTP={verifyOTP}
        resendOTP={handleResendOtp}
      />
    </div>
  );
};

export default Security;
