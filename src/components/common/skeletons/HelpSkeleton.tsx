import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const HelpSkeleton = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    const body = document.body;
    body.style.overflow = "hidden";
    body.style.pointerEvents = "none";
    return () => {
      body.style.overflow = "";
      body.style.pointerEvents = "";
    };
  }, []);

  const shimmer = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

  return (
    <div className="fixed inset-0 z-100 bg-white">
      <div className="min-h-screen">
        <div className="flex w-full flex-col lg:flex-row gap-12 px-4 lg:px-10 mx-auto py-6">
          
          {/* FAQ Section - Left Side */}
          <div className="w-full lg:w-1/2">
            {/* Keep static title */}
            <h1 className="mb-8 text-2xl font-extrabold text-gray-900">
              {t("frequently_asked_questions")}
            </h1>
            
            {/* FAQ Items - Skeleton for dynamic content */}
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-light-10 hover:shadow-light-20 transition-shadow"
                >
                  <div className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sm:gap-5">
                    {/* Plus/Minus Icon - keep static */}
                    <div className="w-5 h-5 flex-shrink-0">
                      <div className="w-full h-full bg-gray-300 rounded"></div>
                    </div>
                    {/* Question - skeleton for dynamic content */}
                    <div className={`h-5 rounded flex-1 ${shimmer}`} style={{ 
                      width: `${60 + Math.random() * 40}%` // Vary width to look more natural
                    }}></div>
                  </div>
                  
                  {/* Show some expanded answers occasionally for realism */}
                  {index % 3 === 0 && (
                    <div className="px-4 sm:px-6 pb-4">
                      <div className={`h-4 rounded mb-2 ${shimmer}`} style={{ width: '90%' }}></div>
                      <div className={`h-4 rounded mb-2 ${shimmer}`} style={{ width: '85%' }}></div>
                      <div className={`h-4 rounded ${shimmer}`} style={{ width: '70%' }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form Section - Right Side */}
          <div className="w-full lg:w-1/2">
            {/* Keep static titles */}
            <div className="flex w-full flex-col sm:flex-row gap-2 items-center sm:items-baseline mb-6">
              <h2 className="text-secondary-100 text-center sm:text-left font-normal text-2xl">
                {t("still_have_query")}
              </h2>
              <span className="text-secondary-100 font-bold text-xl sm:text-2xl">
                {t("contact_us")}
              </span>
            </div>

            {/* Contact Form - Keep static labels, skeleton for form validation messages */}
            <form className="pt-6 flex flex-col gap-4 sm:gap-6">
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className="bg-white w-full border rounded-lg px-3 py-2 text-gray-400"
                  disabled
                />
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("subject")}
                </label>
                <input
                  type="text"
                  placeholder={t("subject_of_your_message")}
                  className="bg-white w-full border rounded-lg px-3 py-2 text-gray-400"
                  disabled
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("message")}
                </label>
                <textarea
                  placeholder={t("type_your_message_or_question_here")}
                  className="w-full border rounded-lg px-3 py-2 h-32 text-gray-400 resize-none"
                  disabled
                />
              </div>

              {/* Submit Button - Keep static */}
              <div className="flex justify-end">
                <button
                  className="py-3 px-6 w-full sm:w-fit bg-blue-500 text-white rounded-lg disabled:opacity-50"
                  disabled
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSkeleton;
