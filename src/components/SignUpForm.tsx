import { useEffect, useState, useMemo } from "react";
import Checkbox from "../lib/components/atoms/Checkbox";
import Input from "../lib/components/atoms/Input";
import Label from "../lib/components/atoms/Label";
import Password from "../lib/components/atoms/Password";
import Typography from "../lib/components/atoms/Typography";
import Button from "../lib/components/atoms/Button";

import PhoneInput from "../lib/components/atoms/PhoneInput";
import CountryPicker from "../lib/components/atoms/CountryPicker";
import { useCountryLookup } from "../hooks/useCountryLookup";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config"; // Import i18n to access current language
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useModal } from "../hooks/useModal";
import TermsConditionModal from "./modal/TermsConditionModal";
import localStorageService from "../services/local.service";
import { mobileCountryCode } from "../utils/constant/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import authService from "../services/auth.service";
import { toast } from "react-toastify";
import PrivacyModal from "./modal/PrivacyModal";

const SignUpForm = () => {
  const [remember, setRemember] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { byPhoneCode } = useCountryLookup();
  const {
    isOpen: isTermModel,
    openModal: openTermModel,
    closeModal: closeTermModel,
  } = useModal();

  const {
    isOpen: isPrivacyModel,
    openModal: openPrivacyModel,
    closeModal: closePrivacyModel,
  } = useModal();

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openTermModel();
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openPrivacyModel();
  };

  const [passwordStrength, setPasswordStrength] = useState<
    "week" | "acceptable" | "strong" | ""
  >("");

  const validationSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(2, t("name_min_length"))
      .max(20, t("name_max_length"))
      .required(t("first_name_required")),
    last_name: Yup.string()
      .min(2, t("name_min_length"))
      .max(20, t("name_max_length"))
      .required(t("last_name_required")),
    email: Yup.string().email(t("invalid_email")).required(t("email_required")),
    mobile: Yup.string()
      .required(t("phone_number_required"))
      .min(7, t("phone_number_min_length"))
      .max(12, t("phone_number_max_length"))
      .matches(/^\d{7,12}$/, t("phone_number_format")),
    company_name: Yup.string()
      .min(5, t("organization_name_min_length"))
      .max(40, t("organization_name_max_length"))
      .required(t("organization_name_required")),
    password: Yup.string()
      .min(8, t("password_min_length"))
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
        t("password_requirements")
      )
      .required(t("password_required")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("passwords_must_match"))
      .required(t("confirm_password_required")),
  });
  // Mobile validation mutation - must be called first
  const checkMobileMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; country_code: string; mobile: string; lang: string }) => {
      return await authService.checkMobile(data);
    },
    onSuccess: async (response, variables) => {
      // If mobile validation is successful (200 status), proceed with OTP
      const mobileWithCountryCode = variables.country_code + variables.mobile;
      // Get first_name from formik values
      await sendOtpMutation.mutateAsync({ 
        email: variables.email,
        first_name: formik.values.first_name,
        mobile: variables.mobile, 
        country_code: variables.country_code 
      });
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
      if (errorObj.response?.status === 400) {
        const message = errorObj.response?.data?.message || "Mobile number already exists";
        return toast.error(message);
      }
      return toast.error(t("mobile_validation_error") || "Mobile validation failed");
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { email: string; first_name: string; mobile: string; country_code: string }) => {
      const mobileWithCountryCode = data.country_code + data.mobile;
      await authService.sendOtp({
        email: data.email,
        first_name: data.first_name,
        is_login: "no",
        mobile: mobileWithCountryCode
      });
    },
    onSuccess: () => {
      toast.success(t("otp_sent_successfully"));
      navigate("/otp-verification");
    },
    onError: (error: unknown) => {
      const errorObj = error as { status?: number };
      if (errorObj.status === 412) {
        return toast.error(t("email_is_already_registered"));
      }
      return toast.error(t("otp_send_error"));
    },
  });
  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      company_name: "",
      password: "",
      confirmPassword: "",
      country_code: mobileCountryCode[0].value,
    },
    validationSchema,
    onSubmit: async (values) => {
      localStorageService.setUser(JSON.stringify(values));
      localStorageService.setPath("sign-up");
      
      // First validate mobile number, then send OTP if successful
      await checkMobileMutation.mutateAsync({
        email: values.email,
        password: values.password,
        country_code: values.country_code,
        mobile: values.mobile,
        lang: i18n.language || "en" // Use current language from i18n
      });
    },
  });

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
    setPasswordStrength(checkPasswordStrength(password));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
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

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const data = JSON.parse(userData);
      formik.setFieldValue("first_name", data.first_name);
      formik.setFieldValue("last_name", data.last_name);
      formik.setFieldValue("email", data.email);
      formik.setFieldValue("mobile", data.mobile);
      formik.setFieldValue("company_name", data.company_name);
      formik.setFieldValue("country_code", data.country_code);
    }
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <Typography
          weight="extrabold"
          className="text-[28px] text-secondary-100"
        >
          {t("create_an_account")}
        </Typography>
        <Typography
          weight="normal"
          size="sm"
          className="text-secondary-60 mt-1.5"
        >
          {t("already_have_an_account")}
          <span
            className="ml-1 text-base font-semibold text-primary-150 cursor-pointer"
            onClick={() => navigate("/sign-in")}
          >
            {t("login")}
          </span>
        </Typography>
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={formik.handleSubmit}>
        <motion.div variants={itemVariants} className="mt-5 lg:flex gap-5">
          <div className="w-full">
            <Label htmlFor="firstName">{t("first_name")}</Label>
            <Input
              type="text"
              placeholder="John"
              id="firstName"
              name="first_name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.first_name && Boolean(formik.errors.first_name)
              }
              hint={
                formik.touched.first_name ? formik.errors.first_name : undefined
              }
            />
          </div>
          <div className="w-full mt-4 lg:mt-0">
            <Label htmlFor="lastName">{t("last_name")}</Label>
            <Input
              type="text"
              placeholder="Doe"
              id="lastName"
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.last_name && Boolean(formik.errors.last_name)
              }
              hint={
                formik.touched.last_name ? formik.errors.last_name : undefined
              }
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 w-full">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            type="email"
            placeholder="example@gmail.com"
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            hint={formik.touched.email ? formik.errors.email : undefined}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 w-full">
          <Label htmlFor="phoneNumber">{t("mobile_number")}</Label>
          <div className="flex gap-2 w-full">
            <div className="flex-shrink-0 min-w-[120px]">
              <CountryPicker
                value={useMemo(() => {
                  if (!formik.values.country_code) return null;
                  const country = byPhoneCode.get(formik.values.country_code);
                  return country ? {
                    value: formik.values.country_code,
                    label: country.name,
                    code: country.code,
                    phoneCode: formik.values.country_code
                  } : null;
                }, [formik.values.country_code, byPhoneCode])}
                onChange={(selectedOption) =>
                  formik.setFieldValue(
                    "country_code",
                    selectedOption ? selectedOption.value : ""
                  )
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <PhoneInput
                name="mobile"
                value={formik.values.mobile}
                onChange={(e) => formik.setFieldValue("mobile", e.target.value)}
                onBlur={formik.handleBlur}
                error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                hint={formik.touched.mobile ? formik.errors.mobile : undefined}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 w-full">
          <Label htmlFor="organizationName">
            {t("name_of_organization_company")}
          </Label>
          <Input
            type="text"
            placeholder="ABC Organization"
            id="organizationName"
            name="company_name"
            value={formik.values.company_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.company_name && Boolean(formik.errors.company_name)
            }
            hint={
              formik.touched.company_name
                ? formik.errors.company_name
                : undefined
            }
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4">
          <Password
            passwordType={passwordStrength}
            labelProps={{
              htmlFor: "password",
              children: `${t("password")}`,
            }}
            name="password"
            value={formik.values.password}
            onChange={handlePasswordChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            hint={formik.touched.password ? formik.errors.password : undefined}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4">
          <Password
            labelProps={{
              htmlFor: "confirmPassword",
              children: `${t("confirm_password")}`,
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
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4 flex gap-3">
          <Checkbox
            checked={remember}
            onChange={() => setRemember((prev) => !prev)}
          />
          <Typography className="text-secondary-60 text-base font-normal">
            {t("i_agree_to_the")}
            <span
              className="text-primary-150 text-base font-normal mx-1 cursor-pointer hover:underline"
              onClick={handleTermsClick}
            >
              {t("terms_conditions")}
            </span>
            {t("and")}
            <span
              className="text-primary-150 text-base font-normal mx-1 cursor-pointer hover:underline"
              onClick={handlePrivacyClick}
            >
              {t("privacy_policy")}
            </span>
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="primary"
            className="py-3 mt-4"
            type="submit"
            disable={!formik.isValid || !remember}
            loading={checkMobileMutation.isPending || sendOtpMutation.isPending}
          >
            {t("create_account")}
          </Button>
        </motion.div>
      </motion.form>

      <TermsConditionModal isOpen={isTermModel} onClose={closeTermModel} />
      <PrivacyModal isOpen={isPrivacyModel} onClose={closePrivacyModel} />
    </motion.div>
  );
};

export default SignUpForm;
