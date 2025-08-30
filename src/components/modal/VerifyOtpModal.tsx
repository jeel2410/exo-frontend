import { useTranslation } from "react-i18next";
import Button from "../../lib/components/atoms/Button";
import Label from "../../lib/components/atoms/Label";
import Modal from "../../lib/components/atoms/Modal";
import OtpInput from "../../lib/components/atoms/OtpInput";
import Typography from "../../lib/components/atoms/Typography";

interface ChangeEmailModalProps {
  isOpen: boolean;
  loading?: boolean;
  resendLoading?: boolean;
  onClose: () => void;
  verifyOTP: () => void;
  resendOTP?: () => void;
  setOtp: (otp: string) => void;
  fieldValue: { email: string; otp: string };
  // fieldValue: { email: string; password: string; otp: string };
}

const VerifyOtpModal = ({ isOpen, onClose,setOtp,fieldValue,verifyOTP,loading,resendLoading,resendOTP }: ChangeEmailModalProps) => {
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
          <div className="flex items-center mt-4">
            <Typography
              size="sm"
              weight="semibold"
              className="text-secondary-60"
            >
              {t("did_nt_receive_a_code")}
            </Typography>
            <button
              onClick={resendOTP}
              disabled={resendLoading}
              className="ml-1 text-primary-150 hover:text-primary-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold flex items-center transition-all duration-200"
            >
              {resendLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-primary-150 border-t-transparent rounded-full mr-1" />
                  {t("resending")}
                </div>
              ) : (
                t("resend")
              )}
            </button>
          </div>
        </div>
        <div className="w-full flex gap-4 justify-end mt-6">
          <Button variant="primary" className="w-fit !py-3" onClick={verifyOTP} loading={loading}>
            {t("verify")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VerifyOtpModal;
