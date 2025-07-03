import Input from "../lib/components/atoms/Input";
import Label from "../lib/components/atoms/Label";
import Typography from "../lib/components/atoms/Typography";
import Button from "../lib/components/atoms/Button";
import { BackArrowIcon } from "../icons";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import authService from "../services/auth.service";
import { toast } from "react-toastify";
import localStorageService from "../services/local.service";
import { AxiosError } from "axios";

const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email(t("invalid_email")).required(t("email_required")),
  });
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await authService.forgotPassword(data);
    },
    onSuccess: (_, data) => {
      console.log(data, "data");
      localStorageService.setEmail(JSON.stringify(data.email));
      // toast.success(t("otp_sent_successfully"));
      navigate("/otp-verification", {
        state: {
          path: "forgot-password",
        },
      });
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 412) {
        // return toast.error(t("email_is_not_registered"));
      }
      console.error("Error during sign in:", error.response?.status);
      // return toast.error(t("otp_send_error"));
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      forgotPasswordMutation.mutate(values);
    },
  });

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
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-1 cursor-pointer"
      >
        <BackArrowIcon />
        <div onClick={() => navigate("/sign-in")}>
          <Typography className="text-primary-150 text-base font-semibold">
            {t("back_to_login")}
          </Typography>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography
          weight="extrabold"
          className="text-[28px] text-secondary-100 mt-10"
        >
          {t("forgot_password")}
        </Typography>
        <Typography
          weight="normal"
          size="sm"
          className="text-secondary-60 mt-1.5"
        >
          {t("enter_your_registered_email_to_receive_an_otp")}
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

        <motion.div variants={itemVariants}>
          <Button
            variant="primary"
            className="py-3 mt-4"
            type="submit"
            disable={forgotPasswordMutation.isPending}
          >
            {t("send_otp")}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default ForgotPasswordForm;
