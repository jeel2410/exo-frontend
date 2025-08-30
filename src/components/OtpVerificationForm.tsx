import Label from "../lib/components/atoms/Label";
import Typography from "../lib/components/atoms/Typography";
import Button from "../lib/components/atoms/Button";
import OtpInput from "../lib/components/atoms/OtpInput";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import authService from "../services/auth.service";
import { useEffect, useState } from "react";
import localStorageService from "../services/local.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { useAuth } from "../context/AuthContext";

const OtpVerificationForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userData, setUserData] = useState<any | undefined>();
  const path = localStorageService.getPath();

  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .required(t("otp_required"))
      .length(6, t("otp_length_error"))
      .matches(/^[0-9]+$/, t("otp_numbers_only")),
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: any) => {
      return await authService.signUp(data);
    },
    onSuccess: (res) => {
      console.log(res.data, "resp data");
      const userDataNew = res.data.data;

      localStorageService.setUser(JSON.stringify(res.data.data));
      localStorageService.setLogin(JSON.stringify("true"));
      login("true", userDataNew);
      // localStorageService.removePath();
      localStorageService.setAccessToken(JSON.stringify(res.data.data.token));
      navigate("/project-dashboard");
    },
    onError: (error) => {
      console.error("Error during sign up:", error);
      toast.error(t("sign_up_error"));
    },
  });
  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      await authService.sendOtp(email);
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
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await authService.forgotPassword(data);
    },
    onSuccess: (_, data) => {
      localStorageService.setEmail(JSON.stringify(data.email));
      toast.success(t("otp_sent_successfully"));
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 412) {
        return toast.error(t("email_is_not_registered"));
      }
      console.error("Error during sign in:", error.response?.status);
      return toast.error(t("otp_send_error"));
    },
  });

  const otpVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      await authService.otpVerification(data);
    },
    onSuccess: () => {
      toast.success(t("otp_verified_successfully"));
      navigate("/reset-password");
    },
    onError: (error) => {
      console.error("Error during sign up:", error);
      toast.error(t("sign_up_error"));
    },
  });

  useEffect(() => {
    if (path === "sign-up") {
      const userDataString = localStorageService.getUser() as string;
      const user = JSON.parse(userDataString);
      setUserData(user);
      // sendOtpMutation.mutate(user.email);
    }
  }, []);
  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (path === "sign-up") {
        const data = {
          ...userData,
          confirmPassword: undefined,
          otp: values.otp,
        };
        signUpMutation.mutate(data);
        console.log("in sign up flow");
      } else if (path === "forgot-password") {
        const email = localStorageService.getEmail() as string;
        const emailData = JSON.parse(email);
        const data = {
          email: emailData,
          otp: values.otp,
        };
        otpVerificationMutation.mutate(data);
      }
    },
  });

  const handleResendOtp = () => {
    // Clear form errors and reset form state when resending OTP
    formik.setErrors({});
    formik.setTouched({}, false);
    formik.setFieldValue('otp', '');
    
    if (path === "sign-up") {
      sendOtpMutation.mutate(userData?.email || "");
    } else if (path == "forgot-password") {
      const emailString = localStorageService.getEmail() as string;
      const email = JSON.parse(emailString);
      forgotPasswordMutation.mutate({ email: email });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <Typography
          weight="extrabold"
          className="text-[28px] text-secondary-100 mt-10"
        >
          {t("verify_otp")}
        </Typography>
        <Typography
          weight="normal"
          size="sm"
          className="text-secondary-60 mt-1.5"
        >
          {t("enter_the_6_digit_otp_sent_to_your_email")}
        </Typography>
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={formik.handleSubmit}>
        <motion.div variants={itemVariants} className="mt-10">
          <Label htmlFor="otp">{t("otp")}</Label>
          <OtpInput
            value={formik.values.otp}
            onChange={(value) => formik.setFieldValue("otp", value)}
            onBlur={formik.handleBlur}
            error={formik.touched.otp && Boolean(formik.errors.otp)}
            hint={formik.touched.otp ? formik.errors.otp : undefined}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4">
          <div className="flex items-center">
            <Typography size="sm" weight="semibold" className="text-secondary-60">
              {t("didn_t_receive_a_code")}
            </Typography>
            <button
              onClick={handleResendOtp}
              disabled={sendOtpMutation.isPending || forgotPasswordMutation.isPending}
              className="ml-1 text-primary-150 hover:text-primary-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold flex items-center transition-all duration-200"
            >
              {(sendOtpMutation.isPending || forgotPasswordMutation.isPending) ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-primary-150 border-t-transparent rounded-full mr-1" />
                  {t("resending")}
                </div>
              ) : (
                t("resend")
              )}
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="primary"
            className="py-3 mt-4"
            type="submit"
            disable={!formik.isValid || signUpMutation.isPending}
            loading={
              signUpMutation.isPending || otpVerificationMutation.isPending
            }
          >
            {t("verify")}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default OtpVerificationForm;
