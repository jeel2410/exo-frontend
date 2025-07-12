import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import AppLayout from "../../layout/AppLayout";
import Button from "../../lib/components/atoms/Button";
import DashBoardCard from "../../lib/components/molecules/DashBoardCard.tsx";
import {
  ChevronLeftIcon,
  ChevronLeftLightIcon,
  ChevronRightIcon,
  ChevronRightLightIcon,
  // ArchiveIcon,
  FileVioletIcon,
  FilterIcon,
  // FilterIcon,
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
import { useNavigate } from "react-router";
import Filter from "../../lib/components/molecules/Filter.tsx";
import { useLoading } from "../../context/LoaderProvider.tsx";

const ListDashBoard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [data, setData] = useState<Data[]>([]);  
  const {loading,setLoading}=useLoading()  

  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(8);
  const [offset, setOffset] = useState(0);
  // Dashboard card state
  const [totalProject, setTotalProject] = useState(0);
  const [totalAmountProject, setTotalAmountProject] = useState(0);
  const [totalRequest, setTotalRequest] = useState(0);
  const [totalAmountRequest, setTotalAmountRequest] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
   const [range, setRange] = useState<{
     startDate: Date | null;
     endDate: Date | null;
   }>({
     startDate: null,
     endDate: null,
   });

  const datePickerRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const formateDate=(date:Date|null)=>{
    if (!date) return;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    // const formattedDate = `${day}-${month}-${year}`;
    return formattedDate
  }
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await homeService.getHomeData(
          limit,
          offset,
          debouncedSearchTerm,
          formateDate(range.startDate),
          formateDate(range.endDate),
        );
        const dataArray = (res.data || []).map((item: any, idx: number) => ({
          id: idx + 1 + offset,
          projectId: item.reference,
          projectName: item.name,
          currency: item.currency,
          amount: Number(item.amount),
          createdDate: item.created_at,
          noOfRequest: item.requests_count || 0,
          projectUuid: item.id,
          status:item.status,
          endDate:item.end_date,
          financeBy:item.finance_by
        }));

        setData(dataArray);
        setTotal(res.total_project || 0);
        setTotalProject(res.total_project || 0);
        setTotalAmountProject(res.total_amount_project || 0);
        setTotalRequest(res.total_request || 0);
        setTotalAmountRequest(res.total_amount_request || 0);

        if (res.total_project <= 0) {
          navigate("/");
        }
      } catch (e) {
        console.log(e, "error");
        setData([]);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [limit, offset, navigate, debouncedSearchTerm,range]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * limit;
    setOffset(newOffset);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0); // Reset to first page when changing limit
  };

   const handleApplyDateFilter = (newRange: {
     startDate: Date | null;
     endDate: Date | null;
   }) => {
     setRange(newRange);
     setIsDatePickerOpen(false);
   };
     
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <AppLayout>      
      <div
        className={"relative"}
      >
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
            {t("dashboard")}
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
              onClick={() => navigate("/create-project")}
            >
              <WhitePlusIcon
                width={12}
                height={12}
                className="sm:w-[13px] sm:h-[13px]"
              />
              <Typography size="sm" className="sm:text-base">
                {t("create_project")}
              </Typography>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="px-4 sm:px-0">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
            initial="hidden"
            animate="visible"
          >
            {[
              {
                icon: (
                  <FileVioletIcon
                    width={36}
                    height={36}
                    className="sm:w-11 sm:h-11"
                  />
                ),
                count: totalProject,
                title: t("total_project"),
              },
              {
                icon: (
                  <UsdGreenIcon
                    width={36}
                    height={36}
                    className="sm:w-11 sm:h-11"
                  />
                ),
                count: totalAmountProject,
                title: t("total_amount_of_project"),
              },
              // {
              //   icon: (
              //     <UsdVioletIcon
              //       width={36}
              //       height={36}
              //       className="sm:w-11 sm:h-11"
              //     />
              //   ),
              //   count: totalRequest,
              //   title: t("total_request"),
              // },
              {
                icon: (
                  <UsdOrangeIcon
                    width={36}
                    height={36}
                    className="sm:w-11 sm:h-11"
                  />
                ),
                count: totalAmountRequest,
                title: t("total_amount_requested"),
              },
            ].map((card, index) => (
              <motion.div key={index} transition={{ duration: 0.3 }}>
                <DashBoardCard
                  icon={card.icon}
                  count={card.count}
                  title={card.title}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="bg-white p-3 sm:p-4 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4 mb-4 sm:mb-5">
              <motion.div
                className="w-full sm:w-1/2"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-2.5 sm:left-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-50" />
                  </div>
                  <Input
                    type="text"
                    placeholder={t("Search By Project ID or Project Name...")}
                    className="pl-8 sm:pl-10 bg-white pr-3 sm:pr-4 text-sm sm:text-base w-full h-9 sm:h-10"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </motion.div>

              <div className="flex gap-2 sm:gap-3 justify-end relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* <Button
                    variant="outline"
                    className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[90px] sm:min-w-[120px] h-9 sm:h-10"
                  >
                    <ArchiveIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    <Typography
                      className="text-secondary-60"
                      element="span"
                      size="sm"
                      weight="semibold"
                    >
                      {t("Archive")}
                    </Typography>
                  </Button> */}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}>
                  <Button
                    variant="outline"
                    className="flex justify-center items-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-2.5 sm:px-4 min-w-[90px] sm:min-w-[120px] h-9 sm:h-10"
                    onClick={() => setIsDatePickerOpen(true)}>
                    <FilterIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    <Typography
                      className="text-secondary-60"
                      element="span"
                      size="sm"
                      weight="semibold">
                      {t("Filter")}
                    </Typography>
                  </Button>
                </motion.div>
                {isDatePickerOpen && (
                  <div
                    ref={datePickerRef}
                    className="absolute top-[100%] right-0 w-max z-50 mt-2 bg-white border border-secondary-30 rounded-lg shadow-lg p-4">
                    <Filter
                      startDate={range.startDate}
                      endDate={range.endDate}
                      onApply={handleApplyDateFilter}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="sm:mx-0 overflow-x-auto">
              <ListDashBoardTable data={data} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 sm:px-0">
              <div className="flex items-center gap-2 text-sm">
                <span>Rows per page:</span>
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
                  {currentPage===1?<ChevronLeftLightIcon/>:<ChevronLeftIcon/>} 
                </Button>
                <div><span className="text-nowrap">Page {currentPage} of {totalPages}</span></div>
                <Button
                  variant="outline"
                  className="px-2 py-1 min-w-[32px] border-0"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                {currentPage===totalPages?<ChevronRightLightIcon/>:<ChevronRightIcon/>} 

                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ListDashBoard;
