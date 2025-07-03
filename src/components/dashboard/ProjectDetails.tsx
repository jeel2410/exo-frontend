import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CloseYellowIcon,
  CommentIcon,
  InfoIcon,
  PdfIcon,
} from "../../icons";
import AppLayout from "../../layout/AppLayout";
import Button from "../../lib/components/atoms/Button";
import Typography from "../../lib/components/atoms/Typography";
import AddressTable, { Data as AddressData } from "../table/AddressTable";
import RequestTable, { Data as RequestData } from "../table/RequestTable";
import History, { HistoryItem } from "./History";
import projectService from "../../services/project.service";

const initialAddressData: AddressData[] = [
  {
    id: 1,
    city: "Ahmedabad",
    country: "India",
    municipality: "AMC",
    providence: "West Arindale",
  },
  {
    id: 2,
    city: "Ahmedabad",
    country: "India",
    municipality: "AMC",
    providence: "West Arindale",
  },
];

const initialRequestData: RequestData[] = [
  {
    id: 1,
    requestNo: 1200,
    amount: 123300,
    createdDate: "24-20-2001",
    status: "pending",
    request_id:""
  },
];

const historyData: HistoryItem[] = [
  {
    id: "1",
    date: "24/10/2001",
    time: "2:30 PM",
    title: "Return the signed documents to the Secretariat",
    description: "Prepared a summary calculation note",
  },
  {
    id: "2",
    date: "24/10/2001",
    time: "2:30 PM",
    title: "Return the signed documents to the Secretariat",
    description: "Prepared a summary calculation note",
  },
  {
    id: "3",
    date: "Today",
    time: "2:30 PM",
    title: "Return the signed documents to the Secretariat",
  },
  {
    id: "4",
    date: "Yesterday",
    time: "2:30 PM",
    title: "Return the signed documents to the Secretariat",
    description: "Prepared a summary calculation note",
  },
];

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { t } = useTranslation();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await projectService.getProjectDetails(projectId!);
        setProject(data);
      } catch (err: any) {
        setError(t("Failed to load project details"));
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId, t]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!project) return null;

  // Map address for AddressTable
  const addressData = (project.address || []).map((item: any, idx: number) => ({
    id: idx + 1,
    country: item.country,
    providence: item.providence,
    city: item.city,
    municipality: item.municipality,
  }));
  
  // Map requests for RequestTable
  const requestData = (project.requests || []).map((item: any, idx: number) => ({
    id: idx + 1,
    requestNo: item.request_unique_number || idx + 1,
    amount: Number(item.total_amount || 0),
    createdDate: item.created_at ? new Date(item.created_at).toLocaleDateString("en-US") : "",
    status: item.status || "",
    request_id:item.id,
  }));

  // Format dates
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString("en-US") : "-";
  // Format amount
  const formatAmount = (amount: string | number) => Number(amount).toLocaleString();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div>
      <AppLayout>
        <div className="px-4 sm:px-6 md:px-8">
          <motion.div
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div>
              <motion.div
                className="flex items-center gap-2 cursor-pointer mb-2"
                onClick={() => window.history.back()}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowLeftIcon
                  width={16}
                  height={16}
                  className="text-primary-150"
                />
                <Typography
                  size="base"
                  weight="semibold"
                  className="text-primary-150"
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
                  className="text-secondary-100"
                >
                  {t("project_details")} {project.reference ? `#${project.reference}` : ""}
                </Typography>
              </motion.div>
              <Typography
                size="base"
                weight="normal"
                className="text-secondary-60"
              >
                {t("last_updated")} {formatDate(project.created_at)}
              </Typography>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="flex items-center justify-center w-fit gap-2 py-2 sm:py-3 h-fit mt-4 sm:mt-0 hover:bg-primary-50 transition-colors"
              >
                <CommentIcon width={13} height={13} />
                <Typography size="base">{t("comment")}(s)</Typography>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col md:flex-row gap-4 w-full mt-4 sm:mt-7"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="bg-white p-4 sm:p-6 w-full rounded-lg shadow-lg"
              variants={itemVariants}
            >
              <Typography
                size="base"
                weight="bold"
                className="text-secondary-100"
              >
                Project Info
              </Typography>
              <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
                {[
                  { label: "Project Name:", value: project.name },
                  { label: "Project Reference:", value: project.reference },
                  {
                    label: "Amount:",
                    value: (
                      <>
                        <span className="text-secondary-60">{project.currency}</span> {formatAmount(project.amount)}
                      </>
                    ),
                  },
                  { label: "Project Begin Date:", value: formatDate(project.begin_date) },
                  { label: "Project End Date:", value: formatDate(project.end_date) },
                  { label: "Description:", value: <span dangerouslySetInnerHTML={{ __html: project.description || "-" }} /> },
                  { label: "Upload Files:", value: project.documents && project.documents.length > 0 ? project.documents.map((doc: any, idx: number) => (
                    <a key={idx} href={doc.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <PdfIcon width={16} height={16} />
                      {doc.original_name}
                    </a>
                  )) : "-" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-secondary-10 p-2 rounded transition-colors"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Typography
                      size="sm"
                      weight="normal"
                      className="text-secondary-60 w-full sm:w-32"
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      size="sm"
                      weight="normal"
                      className="text-secondary-100"
                    >
                      {item.value}
                    </Typography>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="bg-white p-4 sm:p-6 w-full rounded-lg shadow-lg"
              variants={itemVariants}
            >
              <Typography
                size="base"
                weight="bold"
                className="text-secondary-100"
              >
                Contact Info
              </Typography>
              <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
                {[
                  { label: "Signed By:", value: project.signed_by },
                  { label: "Position:", value: project.position },
                  { label: "Organization:", value: project.organization },
                  { label: "Place:", value: project.place },
                  { label: "Date of Signing:", value: formatDate(project.date_of_signing) },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-secondary-10 p-2 rounded transition-colors"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Typography
                      size="sm"
                      weight="normal"
                      className="text-secondary-60 w-full sm:w-32"
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      size="sm"
                      weight="normal"
                      className="text-secondary-100"
                    >
                      {item.value}
                    </Typography>
                  </motion.div>
                ))}
                {project.documents && project.documents.length > 0 && (
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                  >
                    <Typography
                      size="sm"
                      weight="normal"
                      className="text-secondary-60 w-full sm:w-32"
                    >
                      Upload Files:
                    </Typography>
                    <div className="flex flex-col gap-2">
                      {project.documents.map((doc: any, idx: number) => (
                        <a
                          key={idx}
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <PdfIcon width={16} height={16} />
                          {doc.original_name}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
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
          </motion.div>

          <motion.div
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
            <motion.div
              className="mt-4 sm:mt-6 overflow-x-auto"
              variants={itemVariants}
            >
              <RequestTable data={requestData} />
            </motion.div>
          </motion.div>

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
      </AppLayout>
    </div>
  );
};

export default ProjectDetails;
