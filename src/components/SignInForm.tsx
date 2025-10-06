import { useEffect, useState } from "react";
import Checkbox from "../lib/components/atoms/Checkbox";
import Input from "../lib/components/atoms/Input";
import Label from "../lib/components/atoms/Label";
import Password from "../lib/components/atoms/Password";
import Typography from "../lib/components/atoms/Typography";
import Button from "../lib/components/atoms/Button";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import authService from "../services/auth.service";
import localStorageService from "../services/local.service";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

const SignInForm = () => {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);

  const { t } = useTranslation();
  const { login } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState<
    "week" | "acceptable" | "strong" | ""
  >("");

  const signInMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await authService.signIn(data);
      return res;
    },
    onSuccess: (res) => {
      const userData = res.data.data;
      localStorageService.setUser(JSON.stringify(userData));
      localStorageService.setAccessToken(JSON.stringify(userData.token));
      localStorageService.setLogin(JSON.stringify("true"));
      login("true", userData);

      console.log(userData, "user data on sign in");

      // Navigate based on user typee
      if (userData.type === "project_manager") {
        navigate("/project-dashboard");
      } else {
        navigate("/project-dashboard");
      }
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      let message = "Something went wrong";
      message =
        axiosError?.response?.data?.message || // backend-defined message
        axiosError?.message || // fallback Axios error message
        "An unexpected error occurred"; // fallback generic message

      console.error(
        "Error during sign in:",
        axiosError?.response?.data?.message
      );
      toast.error(t(message));
    },
  });

  const validationSchema = Yup.object().shape({
    email: Yup.string().email(t("invalid_email")).required(t("email_required")),
    password: Yup.string()
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
        t("password_requirements")
      )
      .required(t("password_required")),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      signInMutation.mutate(values);
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
    localStorage.removeItem("userData");
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <Typography
          weight="extrabold"
          className="text-[28px] text-secondary-100"
        >
          {t("login")}
        </Typography>
        <Typography
          weight="normal"
          size="sm"
          className="text-secondary-60 mt-1.5"
        >
          {t("don_t_have_an_account")}
          <span
            className="ml-1 text-base font-semibold text-primary-150 cursor-pointer"
            onClick={() => navigate("/sign-up")}
          >
            {t("create_new")}
          </span>
        </Typography>
      </motion.div>

      <motion.form variants={itemVariants} onSubmit={formik.handleSubmit}>
        <motion.div variants={itemVariants} className="mt-10">
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

        <motion.div variants={itemVariants} className="mt-4">
          <Password
            passwordType={passwordStrength}
            labelProps={{
              htmlFor: "password",
              children: `${t("password")}`,
            }}
            value={formik.values.password}
            onChange={handlePasswordChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            hint={formik.touched.password ? formik.errors.password : undefined}
            name="password"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-4 flex justify-between"
        >
          <Checkbox
            checked={remember}
            onChange={() => setRemember((prev) => !prev)}
            label={t("remember_me")}
          />
          <div>
            <span
              className="text-primary-150 text-base font-semibold cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              {t("forgot_password")}
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            variant="primary"
            className="py-3 mt-4"
            type="submit"
            disable={!formik.isValid || signInMutation.isPending}
            loading={signInMutation.isPending}
          >
            {t("login")}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default SignInForm;
