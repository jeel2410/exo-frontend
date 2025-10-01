import { useTranslation } from "react-i18next";
import {
  FileVioletIcon,
  Table2Icon,
  Table2IconFrench,
  UsdGreenIcon,
  UsdOrangeIcon,
  UsdVioletIcon,
  WhitePlusIcon,
} from "../../icons";
import AppLayout from "../../layout/AppLayout";
import Button from "../../lib/components/atoms/Button";
import Typography from "../../lib/components/atoms/Typography";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard";

const TestListRecord = () => {
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
            icon={<FileVioletIcon width={36} height={36} />}
            count={2}
            title={t("total_entity")}
            formatType="count"
          />
          <DashBoardCard
            icon={<UsdGreenIcon width={36} height={36} />}
            count={2200}
            title={t("total_amount")}
          />
          <DashBoardCard
            icon={<UsdVioletIcon width={36} height={36} />}
            count={440}
            title={t("total_tax_amount")}
          />
          <DashBoardCard
            icon={<UsdOrangeIcon width={36} height={36} />}
            count={4840}
            title={t("total_amount_with_tax")}
          />
        </div>
        <div className="mt-6">
          {i18n.language === "en" ? (
            <Table2Icon width="100%" height="100%" />
          ) : (
            <Table2IconFrench width="100%" height="100%" />
          )}
        </div>
      </AppLayout>
    </div>
  );
};

export default TestListRecord;
