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

interface UserData {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  country_code?: string;
  mobile?: string;
  token?: string;
  email?:string
}
interface UserInformationProps {
  userData: UserData;
}

interface ChangeEmailFields{
  email:string,
  password:string,
  otp:string
}

const initialChangeEmailFields: ChangeEmailFields = {
  email: "",
  password: "",
  otp: "",
};
const Security = ({userData}:UserInformationProps) => {
  const [changeEmialFields, setChangeEmailFields] = useState<ChangeEmailFields>(initialChangeEmailFields);
  
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

  const handelOnChange = (e: React.ChangeEvent<HTMLInputElement>|any) => {
    setChangeEmailFields((preve: any) => ({
      ...preve,
      [e.target.name]: e.target.value,
    }));
  };
  const setOtp = (otp:string) => {
    setChangeEmailFields((preve: any) => ({
      ...preve,
      otp:otp,
    }));
  };
  const handelSendOtp = () => {
    console.log(changeEmialFields,"changeEmialFields")
    closeEmailModal();
    openOtpModal();
  };
    const changeEmail = useMutation({
    mutationFn: async (data: ChangeEmailFields) => {
      const formData = new FormData();

      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const res = await authService.changeEmail(data)
      return res.data;
    },
    onSuccess: (res) => {
      console.log("Email updated successfully:", res);
      setChangeEmailFields(initialChangeEmailFields)
      // Add success notification here
      // toast.success(t("email_updated_successfully"));
    },
    onError: (error) => {
      console.error("Error during Email update:", error);
      // Add error notification here
      // toast.error(t("email_update_error"));
    },
  });
  const verifyOTP=async()=>{
    console.log(changeEmialFields,"changeEmialFields");
    const res= await changeEmail.mutateAsync(changeEmialFields)
    closeOtpModal();
  }


  return (
    <div className="w-full flex gap-4 md:gap-6 flex-col">
      <div className="bg-white p-4 md:p-6 lg:p-10">
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100">
          {t("email_address")}
        </Typography>
        <div className="mt-6">
          <Typography size="base" weight="normal" className="text-secondary-60">
            {t("current_email")}
          </Typography>
          <Typography
            size="base"
            weight="normal"
            className="text-secondary-100">
            {userData.email}
          </Typography>
        </div>
        <Button
          variant="primary"
          className="w-full md:w-fit mt-6 !py-3"
          onClick={openEmailModal}>
          {t("change_email")}
        </Button>
      </div>
      <div className="bg-white p-4 md:p-6 lg:p-10">
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100">
          {t("change_password")}
        </Typography>
        <div className="mt-6">
          <Password
            labelProps={{
              children: "Current Password",
            }}
          />
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-6 w-full">
          <div className="w-full">
            <Password
              className="w-full"
              labelProps={{
                children: t("new_password"),
              }}
            />
          </div>
          <div className="w-full">
            <Password
              labelProps={{
                children: t("confirm_password"),
              }}
            />
          </div>
        </div>
        <div className="mt-6">
          <Button
            variant="primary"
            className="w-full md:w-fit !py-3"
            onClick={openOtpModal}>
            {t("update_password")}
          </Button>
        </div>
      </div>
      <ChangeEmailModal
        isOpen={isOpenEmailModal}
        onClose={closeEmailModal}
        sendOtp={handelSendOtp}
        onChange={handelOnChange}
        fieldValue={changeEmialFields}
      />
      <VerifyOtpModal isOpen={isOpenOtpModal} onClose={closeOtpModal} setOtp={setOtp}
        fieldValue={changeEmialFields} verifyOTP={verifyOTP} />
    </div>
  );
};

export default Security;
