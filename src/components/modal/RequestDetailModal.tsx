import { useTranslation } from "react-i18next";
import {
  FileVioletIcon,
} from "../../icons";
import Modal from "../../lib/components/atoms/Modal";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard";
import Typography from "../../lib/components/atoms/Typography";
import CreateRequestTable from "../table/CreateRequestTable.tsx";
import CurrencyBadge from "../common/CurrencyBadge";

export interface RequestAddress {
  country: string;
  providence: string;
  city: string;
  municipality: string;
}

export interface RequestEntity {
  label: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate: number;
  tax_amount: number;
  vat_included: number;
  financial_authority: string;
  status: string;
  unit?: string;
  reference?: string;
  tarrif_position?: string;
  issue_date?: string; // Add issue_date field for local acquisition
  nature_of_operation?: string; // Add nature_of_operations field for local acquisition
  custom_duties?: string; // Add custom_duties field
  it_ic?: string; // Add it_ic field for importation
}

export interface AmountSummary {
  total_quantity: number;
  total_amount: number;
  total_tax: number;
  vat_included: number;
}

export interface RequestDetails {
  id: string;
  unique_number: string;
  status: string;
  project_id: string;
  request_letter: string;
  address: RequestAddress;
  entities: RequestEntity[];
  amount_summary: AmountSummary;
  tracks: any[]; // Use a specific interface if `tracks` has a defined shape
  contract_currency?: string; // Currency from contract
  project_amount?: number; // Project amount from API
  contract_amount?: number; // Contract amount from API
  tax_category?: string; // Tax category for dynamic column display
}

interface RequestDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  requestDetails: RequestDetails | any;
}
const RequestDetailModal = ({
  isOpen,
  onClose,
  requestDetails,
}: RequestDetailsProps) => {
  const { t } = useTranslation();
  const { total_quantity, total_amount, total_tax, vat_included } =
    requestDetails.amount_summary;
  return (
    <div className="w-fit">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isFullscreen={false}
        className="xl:max-w-[1200px] lg:max-w-[800px] max-w-[80dvw] mx-auto p-6 max-h-[500px]"
      >
        <div className="py-4">
          <Typography size="xl" weight="bold" className="text-secondary-100">
            {t("details")}
          </Typography>
          <div className="mt-5">
            <Typography
              size="base"
              weight="semibold"
              className="text-secondary-100"
            >
              {t("request_latter")}
            </Typography>
            <Typography size="sm" weight="normal" className="text-secondary-60">
              <div
                dangerouslySetInnerHTML={{
                  __html: requestDetails.request_letter,
                }}
              ></div>
            </Typography>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-5">
            <DashBoardCard
              icon={<FileVioletIcon width={36} height={36} />}
              count={total_quantity || 0}
              title={t("total_quantity")}
              formatType="count"
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(requestDetails?.contract_currency as "USD" | "CDF" | "EUR" | "GBP") || "USD"}
                  variant="green"
                  width={36}
                  height={36}
                />
              }
              count={total_amount || 0}
              title={t("total_amount")}
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(requestDetails?.contract_currency as "USD" | "CDF" | "EUR" | "GBP") || "USD"}
                  variant="violet"
                  width={36}
                  height={36}
                />
              }
              count={total_tax || 0}
              title={t("total_tax_amount")}
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(requestDetails?.contract_currency as "USD" | "CDF" | "EUR" | "GBP") || "USD"}
                  variant="orange"
                  width={36}
                  height={36}
                />
              }
              count={vat_included || 0}
              title={t("total_amount_with_tax")}
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(requestDetails?.contract_currency as "USD" | "CDF" | "EUR" | "GBP") || "USD"}
                  variant="green"
                  width={36}
                  height={36}
                />
              }
              count={requestDetails?.project_amount || 0}
              title={t("project_amount")}
            />
            <DashBoardCard
              icon={
                <CurrencyBadge
                  currency={(requestDetails?.contract_currency as "USD" | "CDF" | "EUR" | "GBP") || "USD"}
                  variant="violet"
                  width={36}
                  height={36}
                />
              }
              count={requestDetails?.contract_amount || 0}
              title={t("contract_amount")}
            />
          </div>
        </div>
        <div className="mt-3 md:mt-5 mb-2 min-w-0">
          <CreateRequestTable
            data={
              requestDetails.entities?.map((entity: any, index: number) => ({
                id: index + 1,
                label: entity.label,
                quantity: entity.quantity,
                unitPrice: entity.unit_price,
                unit: entity.unit,
                unit_price: entity.unit_price,
                total: entity.total,
                taxRate: entity.tax_rate,
                tax_rate: entity.tax_rate,
                taxAmount: entity.tax_amount,
                tax_amount: entity.tax_amount,
                vatIncluded: entity.vat_included,
                vat_included: entity.vat_included,
                reference: entity.reference || "",
                tarrifPosition: entity.tarrif_position || "",
                customDuty: entity.custom_duties,
                custom_duty: entity.custom_duties,
                // Map new fields for location_acquisition tax category
                issueDate: entity.issue_date || "",
                natureOfOperations: entity.nature_of_operation || "",
                // Map it_ic field for importation tax category
                itIc: entity.it_ic || "",
                currency: requestDetails.contract_currency,
              })) || []
            }
            showActions={false}
            showAddButton={false}
            currentTaxCategory={requestDetails.tax_category}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RequestDetailModal;
