import { useTranslation } from "react-i18next";
import { CreateRequestIcon, WhitePlusIcon } from "../../icons";
import Button from "../../lib/components/atoms/Button";
import Typography from "../../lib/components/atoms/Typography";
import { useNavigate } from "react-router";

type Props = {
  onClick?: () => void;
};

const CreateRequestEmpty = ({ onClick }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleCreateRequest = () => {
    // Navigate to contract project list to select a project/contract first
    navigate("/contract-project-list");
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
    </div>
  );
};

export default CreateRequestEmpty;
