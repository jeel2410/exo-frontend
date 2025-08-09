import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "../../layout/AppLayout";
import Typography from "../../lib/components/atoms/Typography";
import { MinusIcon, PlusIcon } from "../../icons";
import { useTranslation } from "react-i18next";
import Label from "../../lib/components/atoms/Label";
import Input from "../../lib/components/atoms/Input";
import TextArea from "../../lib/components/atoms/TextArea";
import Button from "../../lib/components/atoms/Button";
import faqService from "../../services/faq.service";
import contactService from "../../services/contact.service";
import { useLoading, LoaderProvider } from "../../context/LoaderProvider";
import { useFormik } from "formik";
import * as Yup from "yup";

interface FAQItem {
  question: string;
  answer: string;
}

const Help = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { t, i18n } = useTranslation();
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const { setLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Validation schema for the contact form
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("please_enter_a_valid_email_address"))
      .required(t("email_is_required")),
    subject: Yup.string()
      .min(3, t("subject_must_be_at_least_3_characters"))
      .max(100, t("subject_must_not_exceed_100_characters"))
      .required(t("subject_is_required")),
    message: Yup.string()
      .min(10, t("message_must_be_at_least_10_characters"))
      .max(1000, t("message_must_not_exceed_1000_characters"))
      .required(t("message_is_required")),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      subject: "",
      message: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      setError(null);
      setSubmitSuccess(false);

      try {
        const response = await contactService.submitContactForm(values);

        if (response.status) {
          setSubmitSuccess(true);
          resetForm();
          // Reset success message after 5 seconds
          setTimeout(() => setSubmitSuccess(false), 5000);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error("Contact form submission error:", err);
        setError(t("an_unexpected_error_occurred_please_try_again"));
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const lang=i18n.language ==="en-US" ||  i18n.language ==="en"? "en" :"fr"
        const faqs = await faqService.getFaqs(lang);
        setFaqItems(
          faqs.map((item: { title: string; description: string }) => ({
            question: item.title,
            answer: item.description,
          }))
        );
      } catch (err: unknown) {
        console.log(err, "err");
        setError(t("Failed to load FAQs"));
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [i18n.language]);

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full flex-col lg:flex-row gap-12 px-4 lg:px-10 mx-auto"
      >
        <div className="w-full lg:w-1/2">
          <Typography className="mb-8" size="xl_2" weight="extrabold">
            {t("frequently_asked_questions")}
          </Typography>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {error ? (
              <Typography>{error}</Typography>
            ) : faqItems.length === 0 ? (
              <Typography>{t("No FAQs available.")}</Typography>
            ) : (
              faqItems.map(
                (item: { question: string; answer: string }, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-light-10 hover:shadow-light-20 transition-shadow"
                  >
                    <button
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center gap-3 sm:gap-5"
                      onClick={() => toggleQuestion(index)}
                    >
                      <motion.div
                        animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {expandedIndex === index ? <MinusIcon /> : <PlusIcon />}
                      </motion.div>
                      <Typography
                        size="base"
                        weight="bold"
                        element="span"
                        className="text-secondary-100"
                      >
                        {item.question}
                      </Typography>
                    </button>
                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Typography
                            size="sm"
                            weight="normal"
                            className="px-4 sm:px-6 pb-4 text-secondary-100"
                          >
                            <span
                              dangerouslySetInnerHTML={{ __html: item.answer }}
                            />
                          </Typography>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              )
            )}
          </motion.div>
        </div>

        <motion.div
          className="w-full lg:w-1/2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex w-full flex-col sm:flex-row gap-2 items-center sm:items-baseline">
            <Typography
              className="text-secondary-100 text-center sm:text-left"
              weight="normal"
              size="xl_2"
            >
              {t("still_have_query")}
            </Typography>
            <span className="text-secondary-100 font-bold text-xl sm:text-2xl">
              {t("contact_us")}
            </span>
          </div>

          <motion.form
            className="pt-6 flex flex-col gap-4 sm:gap-6"
            onSubmit={formik.handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Success Message */}
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
              >
                <Typography size="sm" className="text-green-800">
                  {t(
                    "your_message_has_been_sent_successfully_we_ll_get_back_to_you_soon"
                  )}
                </Typography>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
              >
                <Typography size="sm" className="text-red-800">
                  {error}
                </Typography>
              </motion.div>
            )}

            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                type="email"
                placeholder="example@gmail.com"
                className="bg-white w-full"
                id="email"
                name="email"
                value={formik.values.email}
                error={!!formik.errors.email}
                hint={formik.errors.email}
                onChange={formik.handleChange}
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="subject">{t("subject")}</Label>
              <Input
                type="text"
                placeholder={t("subject_of_your_message")}
                className="bg-white w-full"
                id="subject"
                name="subject"
                value={formik.values.subject}
                error={!!formik.errors.subject}
                hint={formik.errors.subject}
                onChange={formik.handleChange}
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="message">{t("message")}</Label>
              <TextArea
                id="message"
                placeholder={t("type_your_message_or_question_here")}
                className="w-full"
                name="message"
                value={formik.values.message}
                error={formik.errors.message}
                onChange={formik.handleChange}
                disabled={submitting}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                className="py-3 px-6 w-full sm:w-fit"
                type="submit"
                disabled={submitting}
              >
                {submitting ? t("sending") : t("submit")}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

const HelpWithLoader = () => (
  <LoaderProvider>
    <Help />
  </LoaderProvider>
);

export default HelpWithLoader;
