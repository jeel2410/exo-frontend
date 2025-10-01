import { useTranslation } from "react-i18next";
import UploadFile from "../../components/common/UploadFile";
import {
  ArrowLeftIcon,
  FileVioletIcon,
  Table1Icon,
  UsdGreenIcon,
  UsdOrangeIcon,
  UsdVioletIcon,
} from "../../icons";
import AppLayout from "../../layout/AppLayout";
import Input from "../../lib/components/atoms/Input";
import Label from "../../lib/components/atoms/Label";
import TextEditor from "../../lib/components/atoms/TextEditor";
import Typography from "../../lib/components/atoms/Typography";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard";

const TestRequest = () => {
  const { t } = useTranslation();

  return (
    <div className="px-8">
      <AppLayout className="!bg-white">
        <div
          className="flex items-center gap-2 cursor-pointer mb-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeftIcon width={16} height={16} className="text-primary-150" />
          <Typography
            size="base"
            weight="semibold"
            className="text-primary-150"
          >
            {t("back_to_dashboard")}
          </Typography>
        </div>
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100"
        >
          {t("create_request")}
        </Typography>
        <div className="mt-6">
          <Label htmlFor="address">{t("address")}</Label>
          <Input
            type="text"
            id="address"
            name="address"
            value=""
            placeholder={t("enter_address")}
          />
        </div>
        <div className="mt-6">
          <Label htmlFor="requestLetter">{t("request_letter")}</Label>
          <TextEditor placeholder="Write here..." maxLength={100} />
        </div>
        <div className="">
          <Typography size="base" weight="normal" className="text-secondary-60">
            {t("entity")}
          </Typography>
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
          <div className="mt-5 mb-2">
            <Table1Icon width="100%" height="100%" />
          </div>
          <div>
            <div className="mt-7 mb-6">
              <Label>{t("invoice_files")}</Label>
              <UploadFile
                maxSize={10}
                acceptedFormats={[".pdf", ".doc", ".txt", ".ppt"]}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
};

export default TestRequest;
