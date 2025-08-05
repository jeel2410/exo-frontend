import { useEffect, useState } from "react";
import AppLayout from "../../../layout/AppLayout";
import { motion } from "framer-motion";
import Typography from "../../../lib/components/atoms/Typography";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useLoading } from "../../../context/LoaderProvider";
import contractService from "../../../services/contract.service";
import { ContractDetails } from "./ContractListPage";
import SelectContractTable from "../../../components/table/SelectContractTable";

const SelectContractPage = () => {
  const [contracts, setContracts] = useState<ContractDetails[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setLoading } = useLoading();

  const contractsMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await contractService.getAllContractList({ limit: 100, offset: 0, search: '', start_date: '', end_date: '' });
      setContracts(response.data.data);
      setLoading(false);
    },
    onError: (error) => {
      console.error(error);
      setLoading(false);
    },
  });

  useEffect(() => {
    contractsMutation.mutate();
  }, []);

  const handleSelectContract = (contractId: string, projectId: string) => {
    navigate(`/add-request/${projectId}/${contractId}`);
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
            {t("select_contract")}
          </Typography>
        </motion.div>

        <motion.div className="px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            <SelectContractTable
              data={contracts}
              onSelectContract={handleSelectContract}
            />
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SelectContractPage;

