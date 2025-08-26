import { useEffect, useState } from "react";
import AppLayout from "../../../layout/AppLayout";
import { motion } from "framer-motion";
import Typography from "../../../lib/components/atoms/Typography";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Button from "../../../lib/components/atoms/Button";
import {
  ChevronLeftIcon,
  ChevronLeftLightIcon,
  ChevronRightIcon,
  ChevronRightLightIcon,
  WhitePlusIcon,
} from "../../../icons";
import { useMutation } from "@tanstack/react-query";
import { useLoading } from "../../../context/LoaderProvider";
import moment from "moment";
import requestService from "../../../services/request.service";
import RequestTable from "../../../components/table/RequestTable";
import contractService from "../../../services/contract.service";

export interface RequestData {
  id: number;
  requestNo: string;
  amount: string;
  currency?: string;
  createdDate: string;
  status: string;
  sub_status?: string;
  request_id: string;
  contract_id: string;
}

export interface RequestDetails {
  id: string;
  contract_id: string;
  project_id: string;
  project_name: string;
  amount: string;
  total_amount?: string;
  currency: string;
  status: string;
  current_status: string;
  sub_status?: string;
  created_at: string;
  entities?: Array<{
    total?: string;
    [key: string]: any;
  }>;
}

const RequestListPage = () => {
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<RequestData[]>([]);
  const [hasContracts, setHasContracts] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLoading } = useLoading();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0); // Reset to first page when changing limit
  };

  const requestMutaion = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const payload = {
        limit,
        offset,
      };
      const response = await requestService.getAllRequestList(payload);
      const requests: RequestDetails[] = response.data.data;
      const newRequestData: RequestData[] = requests.map(
        (request, index: number) => {
          // Get the correct amount from entities[0].total first, then fallback to other fields
          const finalAmount =
            request.entities?.[0]?.total ||
            request.total_amount ||
            request.amount ||
            "0";
          return {
            id: Number(index + 1),
            requestNo: request.id,
            amount: finalAmount,
            currency: request.currency || "USD",
            createdDate: moment(request.created_at).format("YYYY/MM/DD"),
            status: request.current_status || request.status,
            sub_status: request.sub_status,
            request_id: request.id,
            contract_id: request.contract_id,
          };
        }
      );
      setData(newRequestData);
      setTotal(response.data.total);
      setLoading(false);
    },
    onError: async (error) => {
      console.error(error);
      setLoading(false);
    },
  });

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
    requestMutaion.mutate();
    checkContracts.mutate();
  }, [limit, offset]);

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    setOffset(newOffset);
  };

  const handleCreateRequest = () => {
    if (hasContracts) {
      navigate("/select-contract");
    } else {
      navigate("/contract-project-list");
    }
  };

  return (
    <AppLayout>
      <div className="relative">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Typography
            size="xl"
            weight="extrabold"
            className="text-secondary-100 text-center sm:text-left"
          >
            {t("requests")}
          </Typography>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full sm:w-auto"
          >
            <Button
              variant="primary"
              className="flex items-center justify-center w-full sm:w-fit gap-2 py-2.5 px-4"
              onClick={handleCreateRequest}
            >
              <WhitePlusIcon
                width={12}
                height={12}
                className="sm:w-[13px] sm:h-[13px]"
              />
              <Typography size="sm" className="sm:text-base">
                {t("create_request")}
              </Typography>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="px-4 sm:px-0">
          <motion.div
            className="bg-white p-3 sm:p-4 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            <div className="sm:mx-0 overflow-x-auto">
              <RequestTable data={data} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
              <div className="flex items-center gap-2 text-sm">
                <span>{t("rows_per_page")}:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  {[8, 16, 32].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="outline"
                  className="px-2 py-1 min-w-[32px] border-0 disabled:text-gray-400"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  {currentPage === 1 ? (
                    <ChevronLeftLightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </Button>
                <div>
                  <span className="text-nowrap">
                    {t("page")} {currentPage} {t("of")} {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="px-2 py-1 min-w-[32px] border-0"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  {currentPage === totalPages ? (
                    <ChevronRightLightIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default RequestListPage;
