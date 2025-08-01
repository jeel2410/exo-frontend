import { useTranslation } from "react-i18next";
import { CongratulationIcon } from "../../icons";
import Button from "../../lib/components/atoms/Button";
import Modal from "../../lib/components/atoms/Modal";
import Typography from "../../lib/components/atoms/Typography";
import { useNavigate } from "react-router";
import { useRoleRoute } from "../../hooks/useRoleRoute";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}
const CreateProjectConfirmationModal = ({
  isOpen,
  onClose,
}: ChangeEmailModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getRoute } = useRoleRoute();

  return (
    <div className="flex w-full">
      <Modal
        className="w-[90%] md:max-w-[600px] mx-auto p-4 md:p-6 max-h-[90vh] md:max-h-[900px] flex justify-center items-center"
        isOpen={isOpen}
        onClose={() => {
          navigate(getRoute("dashboard"));
          onClose();
        }}
        isFullscreen={false}
        showCloseButton={false}
      >
        <div className="flex flex-col justify-center items-center gap-4 md:gap-7 w-full">
          <Typography
            className="text-secondary-100  text-[40px] text-center"
            weight="extrabold"
          >
            {t("congratulations")}
          </Typography>
          <CongratulationIcon
            className="w-[200px] h-auto md:w-[260px]"
            width="100%"
            height="100%"
          />
          <Typography
            weight="bold"
            size="xl"
            className="text-secondary-100 text-center md:text-xl_2"
          >
            {t("project_has_been_created_successfully")}
          </Typography>
          <Typography
            weight="normal"
            size="sm"
            className="text-secondary-60 text-center md:text-base px-2 md:px-4"
          >
            {t(
              "you_will_receive_further_updates_regarding_your_project_via_email_at_your_registered_email_address"
            )}
          </Typography>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-fit py-2.5 md:py-3 px-4 md:px-[35px]"
              onClick={() => {                
                onClose();
                navigate(getRoute("dashboard"));
              }}
            >
              {t("go_to_dashboard")}
            </Button>
            <Button
              variant="primary"
              className="w-full md:w-fit py-2.5 md:py-3 px-4 md:px-[35px]"
              onClick={() => {
                const formResetEvent = new CustomEvent('form-reset');
                window.dispatchEvent(formResetEvent);
                onClose();
              }}
            >
              {t("create_another_project")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateProjectConfirmationModal;
