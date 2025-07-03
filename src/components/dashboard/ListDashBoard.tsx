import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import AppLayout from "../../layout/AppLayout";
import Button from "../../lib/components/atoms/Button";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard.tsx";
import {
  ArchiveIcon,
  FileVioletIcon,
  FilterIcon,
  SearchIcon,
  UsdGreenIcon,
  UsdOrangeIcon,
  UsdVioletIcon,
  WhitePlusIcon,
} from "../../icons";
import Typography from "../../lib/components/atoms/Typography.tsx";
import Input from "../../lib/components/atoms/Input.tsx";
import ListDashBoardTable, { Data } from "../table/ListDashboardTable.tsx";
import homeService from "../../services/home.service.ts";


const ListDashBoard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8); // default rows per page
  const [page, setPage] = useState(1);
  // Dashboard card state
  const [totalProject, setTotalProject] = useState(0);
  const [totalAmountProject, setTotalAmountProject] = useState(0);
  const [totalRequest, setTotalRequest] = useState(0);
  const [totalAmountRequest, setTotalAmountRequest] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await homeService.getHomeData(limit, page);
        setData(
          (res.data || []).map((item: any, idx: number) => ({
            id: idx + 1 + (page - 1) * limit,
            projectId: item.reference,
            projectName: item.name,
            currency: item.currency,
            amount: Number(item.amount),
            createdDate: item.created_at,
            noOfRequest: item.no_of_request || 0,
            projectUuid: item.id,
          }))
        );
        setTotal(res.total_project || 0); // Use total_project for pagination
        setTotalProject(res.total_project || 0);
        setTotalAmountProject(res.total_amount_project || 0);
        setTotalRequest(res.total_request || 0);
        setTotalAmountRequest(res.total_amount_request || 0);
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [limit, page]);

  return (
    <AppLayout>
      <motion.div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Typography
          size="xl_2"
          weight="extrabold"
          className="text-secondary-100 mb-4 sm:mb-0"
        >
          {t("dashboard")}
        </Typography>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="primary"
            className="flex items-center justify-center w-fit gap-2 py-2 px-4 sm:py-3"
          >
            <WhitePlusIcon width={13} height={13} />
            <Typography size="base">{t("create_project")}</Typography>
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        initial="hidden"
        animate="visible"
      >
        {[
          {
            icon: <FileVioletIcon width={36} height={36} className="sm:w-11 sm:h-11" />, count: totalProject, title: t("total_project"),
          },
          {
            icon: <UsdGreenIcon width={36} height={36} className="sm:w-11 sm:h-11" />, count: totalAmountProject, title: t("total_amount_of_project"),
          },
          {
            icon: <UsdVioletIcon width={36} height={36} className="sm:w-11 sm:h-11" />, count: totalRequest, title: t("total_request"),
          },
          {
            icon: <UsdOrangeIcon width={36} height={36} className="sm:w-11 sm:h-11" />, count: totalAmountRequest, title: t("total_amount_requested"),
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            // whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <DashBoardCard icon={card.icon} count={card.count} title={card.title} />
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="bg-white p-4 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <motion.div
            className="w-full sm:w-1/2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-50" />
              </div>
              <Input
                type="text"
                placeholder="Search By Project ID or Project Name..."
                className="pl-9 sm:pl-10 bg-white pr-4 text-sm sm:text-base w-full"
              // Add search logic as needed
              />
            </div>
          </motion.div>
          <div className="flex gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button variant="outline" className="flex justify-center items-center gap-2 w-fit py-2 px-3 sm:py-3 sm:px-4 min-w-[100px] sm:min-w-[120px] h-fit">
                <ArchiveIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <Typography className="text-secondary-60" element="span" size="sm" weight="semibold">Archive</Typography>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button variant="outline" className="flex justify-center items-center gap-2 w-fit py-2 px-3 sm:py-3 sm:px-4 min-w-[100px] sm:min-w-[120px] h-fit">
                <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <Typography className="text-secondary-60" element="span" size="sm" weight="semibold">Filter</Typography>
              </Button>
            </motion.div>
          </div>
        </div>
        <motion.div className="mt-4 sm:mt-6 mb-5 overflow-x-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}>
          <ListDashBoardTable data={data} />
          {loading && <Typography className="text-center mt-4">{t("Loading...")}</Typography>}
        </motion.div>
        <div className="flex justify-between items-center mt-4">
          <div>
            Rows per page:
            <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="ml-2 border rounded px-2 py-1">
              {[8, 16, 32].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>Page: {page} of {Math.max(1, Math.ceil(total / limit))}</span>
            <Button variant="outline" className="px-2 py-1" disabled={page === 1} onClick={() => setPage(page - 1)}>&lt;</Button>
            <Button variant="outline" className="px-2 py-1" disabled={page === Math.ceil(total / limit) || total === 0} onClick={() => setPage(page + 1)}>&gt;</Button>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default ListDashBoard;