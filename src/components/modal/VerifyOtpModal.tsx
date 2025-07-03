import { useTranslation } from "react-i18next";
import Button from "../../lib/components/atoms/Button";
import Label from "../../lib/components/atoms/Label";
import Modal from "../../lib/components/atoms/Modal";
import OtpInput from "../../lib/components/atoms/OtpInput";
import Typography from "../../lib/components/atoms/Typography";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  verifyOTP: () => void;
  setOtp:(otp:string)=>void;
  fieldValue:{email:string,password:string,otp:string}
}

const VerifyOtpModal = ({ isOpen, onClose,setOtp,fieldValue,verifyOTP }: ChangeEmailModalProps) => {
  const { t } = useTranslation();
  return (
    <div className="w-fit">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isFullscreen={false}
        className="max-w-[600px] mx-auto p-6"
      >
        <Typography size="xl" weight="bold" className="text-secondary-100">
          {t("verify_otp")}
        </Typography>
        <Typography size="base" weight="normal" className="text-secondary-60">
          {t("enter_the_code_sent_to_your_email_to_continue")}
        </Typography>
        <div className="mt-7">
          <Label>{t("otp")}</Label>
          <OtpInput onChange={(e)=>setOtp(e)} value={fieldValue.otp} />
          <Typography
            size="sm"
            weight="semibold"
            className="text-secondary-60 mt-4"
          >
            {t("did_nt_receive_a_code")}

            <span className="text-primary-150 ml-1">{t("resend")}</span>
          </Typography>
        </div>
        <div className="w-full flex gap-4 justify-end mt-6">
          <Button variant="primary" className="w-fit !py-3" onClick={verifyOTP}>
            {t("verify")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VerifyOtpModal;
