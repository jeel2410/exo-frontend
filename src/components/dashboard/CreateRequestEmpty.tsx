import { useTranslation } from "react-i18next";
import { CreateRequestIcon, WhitePlusIcon } from "../../icons";
import Button from "../../lib/components/atoms/Button";
import Typography from "../../lib/components/atoms/Typography";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import contractService from "../../services/contract.service";
import { useEffect, useState } from "react";
import NoContractModal from "../modal/NoContractModal";

type Props = {
  onClick?: () => void;
};

const CreateRequestEmpty = ({ onClick }: Props) => {
  const { t } = useTranslation();
  const [hasContracts, setHasContracts] = useState(false);
  const [showNoContractModal, setShowNoContractModal] = useState(false);

  const navigate = useNavigate();

  const checkContracts = useMutation({
    mutationFn: async () => {
      const response = await contractService.getAllContractList({
        limit: 1,
        offset: 0,
        search: "",
        start_date: "",
        end_date: "",
      });
      setHasContracts(response.data.total > 0);
    },
  });
  useEffect(() => {
    checkContracts.mutate();
  }, []);

  const handleCreateRequest = () => {
    if (hasContracts) {
      navigate("/select-contract");
    } else {
      setShowNoContractModal(true);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-[calc(100vh-200px)]"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <CreateRequestIcon width={133} height={133} />
        <Typography
          className="text-secondary-100"
          size="xl_2"
          weight="extrabold"
        >
          {t("no_requests_available")}
        </Typography>
        <Typography className="text-secondary-60" size="xl_2" weight="semibold">
          {t("get_started_by_submitting_your_first_request")}
        </Typography>
        <Button
          variant="primary"
          className="flex gap-2 w-fit px-5 py-4 items-center justify-center"
          onClick={handleCreateRequest}
        >
          <WhitePlusIcon />
          <Typography>{t("create_request")}</Typography>
        </Button>
      </div>
      
      {/* No Contract Modal */}
      <NoContractModal 
        isOpen={showNoContractModal}
        onClose={() => setShowNoContractModal(false)}
      />
    </div>
  );
};

export default CreateRequestEmpty;
