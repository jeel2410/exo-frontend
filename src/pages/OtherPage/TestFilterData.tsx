import { useTranslation } from "react-i18next";
import {
  BlueCopyIcon,
  CopyIcon,
  FilterIcon,
  FilterIconFrench,
  GreenIcon,
  UsdOrangeIcon,
  WhitePlusIcon,
} from "../../icons";
import AppLayout from "../../layout/AppLayout";
import Button from "../../lib/components/atoms/Button";
import Typography from "../../lib/components/atoms/Typography";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard";

const TestFilterData = () => {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <AppLayout>
        <div className="flex justify-between items-center">
          <Typography
            size="xl_2"
            weight="extrabold"
            className="text-secondary-100"
          >
            {t("dashboard")}
          </Typography>
          <Button
            variant="primary"
            className="flex items-center justify-center w-fit gap-2 py-3"
          >
            <WhitePlusIcon width={13} height={13} />
            <Typography>{t("create_project")}</Typography>
          </Button>
        </div>
        <div className="flex gap-5 mt-5">
          <DashBoardCard
            icon={<CopyIcon width={36} height={36} />}
            count={1}
            title={t("total_project")}
            formatType="count"
          />
          <DashBoardCard
            icon={<GreenIcon width={36} height={36} />}
            count={2500000}
            title={t("total_amount_of_project")}
          />
          <DashBoardCard
            icon={<BlueCopyIcon width={36} height={36} />}
            count={1}
            title={t("total_request")}
            formatType="count"
          />
          <DashBoardCard
            icon={<UsdOrangeIcon width={36} height={36} />}
            count={25000000}
            title={t("total_amount_requested")}
          />
        </div>
        <div className="mt-6">
          {i18n.language === "en" ? (
            <FilterIcon width="100%" height="100%" />
          ) : (
            <FilterIconFrench width="100%" height="100%" />
          )}
        </div>
      </AppLayout>
    </div>
  );
};

export default TestFilterData;
