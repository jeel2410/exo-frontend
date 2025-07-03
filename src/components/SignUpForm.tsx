import { useState } from "react";
import Checkbox from "../lib/components/atoms/Checkbox";
import Input from "../lib/components/atoms/Input";
import Label from "../lib/components/atoms/Label";
import Password from "../lib/components/atoms/Password";
import Typography from "../lib/components/atoms/Typography";
import Button from "../lib/components/atoms/Button";

import PhoneInput from "../lib/components/atoms/PhoneInput";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useModal } from "../hooks/useModal";
import TermsConditionModal from "./modal/TermsConditionModal";
import { toast } from "react-toastify";
import localStorageService from "../services/local.service";

const mobileCountryCode = [
  {
    label: "+1",
    value: "+1",
  },
  {
    label: "+91",
    value: "+91",
  },
  {
    label: "+44",
    value: "+44",
  },
];

const SignUpForm = () => {
  const [remember, setRemember] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();

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
    mobile: Yup.string().required(t("phone_number_required")),
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
    onSubmit: (values) => {
      localStorageService.setUser(JSON.stringify(values));
      // toast.success(t("account_created_successfully"), {
      //   autoClose: 800,
      // });
      setTimeout(() => {
        navigate("/otp-verification", {
          state: {
            path: "sign-up",
          },
        });
      }, 300);
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

        <motion.div variants={itemVariants} className="mt-4 lg:flex gap-5">
          <div className="w-full">
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
          </div>
          <div className="w-full mt-4 lg:mt-0">
            <Label htmlFor="phoneNumber">{t("mobile_number")}</Label>
            <PhoneInput
              options={mobileCountryCode}
              name="mobile"
              value={formik.values.mobile}
              onChange={(e) => formik.setFieldValue("mobile", e.target.value)}
              onOptionChange={(value) =>
                formik.setFieldValue("country_code", value)
              }
              onBlur={formik.handleBlur}
              error={formik.touched.mobile && Boolean(formik.errors.mobile)}
              hint={formik.touched.mobile ? formik.errors.mobile : undefined}
            />
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
              className="text-primary-150 text-base font-normal mx-1 cursor-pointer"
              onClick={openModal}
            >
              {t("terms_conditions")}
            </span>
            {t("and")}
            <span
              className="text-primary-150 text-base font-normal mx-1 cursor-pointer"
              onClick={openModal}
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
            // disable={!formik.isValid}
          >
            {t("create_account")}
          </Button>
        </motion.div>

        {/* <motion.div variants={itemVariants} className="mt-10">
          <TextDivider text={t("or")} />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex gap-5 mt-6 flex-col lg:flex-row"
        >
          <Button variant="outline" type="button">
            <div className="flex items-center justify-center gap-3">
              <GoogleLogo />
              <Typography>{t("continue_with_google")}</Typography>
            </div>
          </Button>
          <Button variant="outline" type="button">
            <div className="flex items-center justify-center gap-3">
              <AppleLogo />
              <Typography>{t("continue_with_apple")}</Typography>
            </div>
          </Button>
        </motion.div> */}
      </motion.form>
      <TermsConditionModal isOpen={isOpen} onClose={closeModal} />
    </motion.div>
  );
};

export default SignUpForm;
