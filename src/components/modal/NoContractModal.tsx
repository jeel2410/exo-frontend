import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Button from "../../lib/components/atoms/Button";
import Modal from "../../lib/components/atoms/Modal";
import Typography from "../../lib/components/atoms/Typography";
import { WhitePlusIcon } from "../../icons";

interface NoContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoContractModal: React.FC<NoContractModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreateContract = () => {
    onClose();
    navigate("/contract-project-list");
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="w-fit">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isFullscreen={false}
        className="max-w-[600px] mx-auto p-6 max-h-[500px]"
      >
        <div className="flex flex-col items-center justify-center text-center">
          {/* Title */}
          <Typography
            size="xl"
            weight="bold"
            className="text-secondary-100 mt-4"
          >
            {t("no_contract_available")}
          </Typography>

          {/* Message */}
          <Typography
            size="base"
            weight="normal"
            className="text-secondary-60 mt-2 mb-6"
          >
            {t("no_contract_message")}
          </Typography>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button 
              variant="outline" 
              className="w-fit py-3" 
              onClick={handleCancel}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="primary"
              className="w-fit py-3 flex items-center gap-2"
              onClick={handleCreateContract}
            >
              <WhitePlusIcon className="w-4 h-4" />
              {t("create_contract")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NoContractModal;
