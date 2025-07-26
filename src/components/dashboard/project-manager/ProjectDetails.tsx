import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CdfCreamIcon,
  CdfGreenIcon,
  CdfPurpleIcon,
  CommentIcon,
  PdfIcon,
} from "../../../icons";
import Typography from "../../../lib/components/atoms/Typography";
import Button from "../../../lib/components/atoms/Button";
import DashBoardCard from "../../../lib/components/molecules/DashBoardCard";
import AddressTable from "../../table/AddressTable";
import ContractTable from "../../table/ContractTable";
import { useLoading } from "../../../context/LoaderProvider";
import projectService from "../../../services/project.service";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import moment from "moment";
import { useRoleRoute } from "../../../hooks/useRoleRoute";

export interface ProjectProps {
  id: string;
  userId: string;
  name: string;
  funded_by: string;
  reference: string;
  currency: string;
  amount: string;
  begin_date: string;
  end_date: string;
  description: string;
  status: string;
  created_at: string;
  documents: any[];
  address: ProjectAddress[];
  user: ProjectUser;
  contracts: Contract[];
  requests: any[];
  updated_at: string;
}

export interface ProjectAddress {
  id: string;
  user_id: string;
  project_id: string;
  country: string;
  providence: string;
  city: string;
  municipality: string;
}

export interface ProjectUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  countryCode: string;
  mobile: string;
  companyName: string;
  profileImage: string;
  status: string;
}

export interface Contract {
  id: string;
  project_id: string;
  signed_by: string;
  position: string;
  currency: string;
  amount: string;
  organization: string;
  place: string;
  date_of_signing: string;
  status: "draft" | "publish" | string;
  created_at: string;
  requests_data_count: number;
}

interface cardProps {
  project_amount: string;
  contracts_total: number;
  requests_total: number;
}

const ProjectDetails = () => {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState<ProjectProps | null>(null);
  const [cardData, setCardData] = useState<cardProps>({
    project_amount: "0",
    contracts_total: 0,
    requests_total: 0,
  });

  const { setLoading } = useLoading();
  const {getRoute}=useRoleRoute()
  const navigate=useNavigate()

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const res = await projectService.getProjectDetails(projectId);
      setProjectData(res.data);
      setCardData(res.summary);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, []);

  // animations

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div>
      <>
        <div className={"relative px-4 sm:px-6 md:px-8"}>
          <motion.div
            className="flex flex-col sm:flex-row sm:justify-between sm:items-start lg:items-center gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex-1 min-w-0">
              <motion.div
                className="flex items-center gap-2 cursor-pointer mb-2"
                onClick={() => navigate(getRoute("dashboard")) }
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowLeftIcon
                  width={16}
                  height={16}
                  className="text-primary-150 flex-shrink-0"
                />
                <Typography
                  size="base"
                  weight="semibold"
                  className="text-primary-150 truncate"
                >
                  {t("back_to_dashboard")}
                </Typography>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
              >
                <Typography
                  size="xl_2"
                  weight="extrabold"
                  className="text-secondary-100 break-words"
                >
                  {t("project_details")}{" "}
                  {/* {project?.reference ? `#${project.reference}` : ""} */}
                </Typography>
              </motion.div>
              <Typography
                size="base"
                weight="normal"
                className="text-secondary-60"
              >
                {t("last_updated")}:{" "}
                {projectData &&
                  moment(projectData.updated_at).format("MMMM D, YYYY")}
              </Typography>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Button
                variant="outline"
                className="flex items-center justify-center w-full sm:w-fit gap-2 py-2 sm:py-3 h-fit hover:bg-primary-50 transition-colors"
              >
                <CommentIcon width={13} height={13} />
                <Typography size="base">{t("comment")}(s)</Typography>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-3 md:mt-5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <DashBoardCard
                icon={<CdfCreamIcon width={44} height={44} />}
                count={Number(cardData?.project_amount) || 0}
                title={t("project_amount")}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <DashBoardCard
                icon={<CdfPurpleIcon width={44} height={44} />}
                count={Number(cardData.contracts_total)}
                title={t("sum_of_contracts_amount")}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <DashBoardCard
                icon={<CdfCreamIcon width={44} height={44} />}
                count={Number(cardData.requests_total)}
                title={t("sum_of_requests_amount")}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <DashBoardCard
                icon={<CdfGreenIcon width={44} height={44} />}
                count={0}
                title={t("sum_of_approved_amount")}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-5 bg-white rounded-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <motion.div className="p-6" variants={itemVariants}>
              <Typography element="p" size="base" weight="bold">
                {t("project_info")}
              </Typography>
            </motion.div>
            <motion.div
              className="flex flex-col lg:flex-row w-full gap-4 pb-6 px-6"
              variants={staggerContainer}
            >
              <div className="border border-secondary-30 rounded-lg p-6 flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Project Name :
                  </Typography>
                  <Typography
                    className="text-secondary-100 break-words"
                    size="sm"
                    weight="normal"
                  >
                    {projectData?.name || ""}
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Funded By :
                  </Typography>
                  <Typography
                    className="text-secondary-100 break-words"
                    size="sm"
                    weight="normal"
                  >
                    {projectData?.funded_by || ""}
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Amount :
                  </Typography>
                  <Typography
                    className="text-secondary-100 break-words"
                    size="sm"
                    weight="normal"
                  >
                    <span className="text-secondary-60">
                      {projectData?.currency}{" "}
                    </span>
                    {projectData?.amount || 0}
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Project End Date :
                  </Typography>
                  <Typography
                    className="text-secondary-100 break-words"
                    size="sm"
                    weight="normal"
                  >
                    {projectData?.end_date || ""}
                  </Typography>
                </div>
              </div>
              <div className="border border-secondary-30 rounded-lg p-6 flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Project Reference :
                  </Typography>
                  <Typography
                    className="text-secondary-100 break-words"
                    size="sm"
                    weight="normal"
                  >
                    {projectData?.reference || ""}
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Project Begin Date :
                  </Typography>
                  <Typography
                    className="text-secondary-100 break-words"
                    size="sm"
                    weight="normal"
                  >
                    {projectData?.begin_date || ""}
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Description :
                  </Typography>
                  <Typography
                    className="text-secondary-100 break-words"
                    size="sm"
                    element="div"
                    weight="normal"
                  >
                    {projectData?.description && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: projectData?.description || "-",
                        }}
                      ></div>
                    )}
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <Typography
                    className="text-secondary-60 min-w-[140px]"
                    size="sm"
                    weight="normal"
                  >
                    Uploaded Files :
                  </Typography>
                  {projectData?.documents.length ? (
                    <>
                      {projectData?.documents.map((doc) => (
                        <a
                          key={1}
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline break-all">
                          <PdfIcon width={16} height={16} />
                          {doc.original_name}
                        </a>
                      ))}
                    </>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-5 bg-white rounded-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <motion.div className="p-6" variants={itemVariants}>
              <Typography element="p" size="base" weight="bold">
                {t("location")}
              </Typography>
            </motion.div>
            <motion.div
              className="p-6 overflow-x-auto"
              variants={tableVariants}
            >
              <AddressTable
                data={(projectData?.address ?? []).map((address, index) => ({
                  id: index + 1,
                  country: address.country,
                  providence: address.providence,
                  city: address.city,
                  municipality: address.municipality,
                }))}
              />
            </motion.div>
          </motion.div>
          <motion.div
            className="mt-5 bg-white rounded-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <motion.div className="p-6" variants={itemVariants}>
              <Typography element="p" size="base" weight="bold">
                {t("contracts")}
              </Typography>
            </motion.div>
            <motion.div
              className="p-6 overflow-x-auto"
              variants={tableVariants}
            >
              <ContractTable
                data={(projectData?.contracts ?? []).map((contract, index) => ({
                  id: index + 1,
                  signedBy: contract.signed_by,
                  position: contract.position,
                  amountByContract: Number(contract.amount),
                  dateCreated: moment(contract.created_at).format("YYYY/MM/DD"),
                  noOfRequest: contract.requests_data_count,
                  contract_id: contract.id,
                  organization: contract.organization,
                  currency: contract.currency,
                }))}
              />
            </motion.div>
          </motion.div>

          {/* <motion.div
            className="mt-4 sm:mt-5 bg-white p-4 sm:p-6 rounded-lg shadow-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Typography
              size="base"
              weight="bold"
              className="text-secondary-100"
            >
              Address
            </Typography>
            <motion.div
              className="mt-4 sm:mt-6 overflow-x-auto"
              variants={itemVariants}
            >
              <AddressTable data={addressData} />
            </motion.div>
          </motion.div> */}

          {/* <motion.div
            className="mt-4 sm:mt-5 bg-white p-4 sm:p-6 rounded-lg shadow-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <Typography
              size="base"
              weight="bold"
              className="text-secondary-100"
            >
              Requests
            </Typography>
            <div className="flex justify-end gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="primary"
                  className="flex items-center justify-center w-fit gap-2 py-2 px-4 sm:py-3"
                  onClick={() => navigate(`/add-request/${projectId}`)}
                >
                  <WhitePlusIcon width={13} height={13} />
                  <Typography size="base">{t("create_request")}</Typography>
                </Button>
              </motion.div>
            </div>
            <motion.div
              className="mt-4 sm:mt-6 overflow-x-auto min-h-[230px]"
              variants={itemVariants}
            >
              <RequestTable data={requestData} />
            </motion.div>
          </motion.div> */}

          {/* <motion.div
            className="mt-4 sm:mt-5 rounded-lg"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
          >
            <div className="bg-[#FFECD7] border border-[#FFB15D] rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center px-3 sm:px-4 py-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <InfoIcon width={20} height={20} />
                <Typography
                  size="sm"
                  weight="semibold"
                  className="text-[#B54708]"
                >
                  Your request has been reached at financial authority.
                </Typography>
              </div>
              <motion.div
                className="mt-2 sm:mt-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CloseYellowIcon width={24} height={24} />
              </motion.div>
            </div>
          </motion.div> */}

          {/* <motion.div
            className="mt-4 sm:mt-5 mb-4 w-full border rounded-md bg-white shadow-lg p-4 sm:p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >
            <Typography className="mb-4" size="base" weight="bold">
              History
            </Typography>
            <History items={historyData} />
          </motion.div> */}
        </div>
      </>
    </div>
  );
};

export default ProjectDetails;
