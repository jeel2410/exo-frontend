import { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router";

import { Dropdown } from "../../lib/components/atoms/Dropdown";
import { NotificationIcon } from "../../icons";
import Typography from "../../lib/components/atoms/Typography";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import authService from "../../services/auth.service";

interface NotificationData {
  id: string;
  user_id: string;
  from_user_id: string;
  push_type: number;
  title: string;
  message: string;
  read: number;
  extra: string;
  created_at: string;
  updated_at: string;
  object_id: string;
  object_type: string;
}

interface FormattedNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  objectId: string;
  objectType: string;
}

export default function NotificationDropdown() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Function to translate notification titles and messages
  const translateNotification = (title: string, message: string) => {
    // Translate the title
    let translatedTitle = title;
    if (title === "Request Status Updated") {
      translatedTitle = t("request_status_updated");
    }
    
    // Translate the message by replacing stage names with translated versions
    let translatedMessage = message;
    
    // Replace common message patterns
    if (message.includes("Your request has been moved from")) {
      translatedMessage = translatedMessage.replace(
        "Your request has been moved from", 
        t("your_request_has_been_moved_from")
      );
    }
    
    // Replace stage names in the message
    const stageTranslations = {
      "Secretariat Review": t("secretariat_review"),
      "Financial Review": t("financial_review"),
      "Calculation Notes Transmission": t("calculation_notes_transmission"),
      "FO Preparation": t("fo_preparation"),
      "Coordinator Review": t("coordinator_review"),
      "Transmission to Secretariat": t("transmission_to_secretariat"),
      "Coordinator Final Validation": t("coordinator_final_validation"),
      "Application Submission": t("application_submission"),
      "Ministerial Review": t("ministerial_review"),
      "Title Generation": t("title_generation")
    };
    
    // Replace each stage name in the message
    Object.entries(stageTranslations).forEach(([englishStage, translatedStage]) => {
      translatedMessage = translatedMessage.replace(new RegExp(englishStage, 'g'), translatedStage);
    });
    
    // Replace common words
    translatedMessage = translatedMessage.replace(/ to /g, ` ${t("to")} `);
    
    return { title: translatedTitle, message: translatedMessage };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["notification"],
    queryFn: () => {
      return authService.notificationList();
    },
  });

  // Format notifications from API response
  const formattedNotifications: FormattedNotification[] = (
    data?.data?.data || []
  ).map((notification: NotificationData) => {
    const translatedContent = translateNotification(notification.title, notification.message);
    return {
      id: notification.id,
      title: translatedContent.title,
      description: translatedContent.message,
      createdAt: moment(notification.created_at).fromNow(),
      isRead: notification.read === 1,
      objectId: notification.object_id,
      objectType: notification.object_type,
    };
  });

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  // Handle notification click to navigate to appropriate page
  const handleNotificationClick = (notification: FormattedNotification) => {
    // Check if it's a request notification
    if (notification.objectType === 'request' && notification.objectId) {
      navigate(`/request-details/${notification.objectId}`);
      closeDropdown(); // Close dropdown after navigation
    }
    // Add more object types here if needed in the future
    // For example:
    // else if (notification.objectType === 'project' && notification.objectId) {
    //   navigate(`/project-details/${notification.objectId}`);
    // }
  };

  // Separate unread and read notifications
  const unread = formattedNotifications.filter((n) => !n.isRead);
  const read = formattedNotifications.filter((n) => n.isRead);

  return (
    <div className="relative">
      <div className="relative inline-block">
        <NotificationIcon
          onClick={handleClick}
          width={26}
          height={26}
          className="cursor-pointer"
        />
        {unread.length > 0 && (
          <span
            className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 border-2 border-white"
            style={{ transform: "translate(50%,-50%)" }}
          />
        )}
      </div>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute !-right-[305px] mt-[17px] flex h-[400px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {t("notification")}
          </h5>
          <button
            onClick={closeDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <Typography size="xs" weight="semibold" className="text-secondary-50">
          {t("notifications")}
        </Typography>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <Typography size="xs" className="text-red-500">
              {t("failed_to_load_notifications")}
            </Typography>
          </div>
        ) : formattedNotifications.length === 0 ? (
          <div className="py-4 text-center">
            <Typography size="xs" className="text-secondary-50">
              {t("no_notifications")}
            </Typography>
          </div>
        ) : (
          <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar mt-2 gap-3">
            {unread.length > 0 && (
              <>
                <li className="text-xs font-bold text-blue-600 mb-1">
                  {t("unread")}
                </li>
                {unread.map((l, index) => (
                  <div
                    key={"unread-" + index}
                    className="notification-unread flex flex-col gap-1 rounded p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleNotificationClick(l)}
                  >
                    <Typography
                      size="xs"
                      weight="semibold"
                      className="text-secondary-100"
                    >
                      {l.title}
                    </Typography>
                    <Typography
                      size="xs"
                      weight="normal"
                      className="text-secondary-80"
                    >
                      {l.description}
                    </Typography>
                    <Typography
                      size="xs"
                      weight="semibold"
                      className="text-secondary-50"
                    >
                      {l.createdAt}
                    </Typography>
                  </div>
                ))}
              </>
            )}
            {read.length > 0 && (
              <>
                {unread.length > 0 && (
                  <li className="text-xs font-bold text-gray-400 mt-2 mb-1">
                    {t("read")}
                  </li>
                )}
                {read.map((l, index) => (
                  <div
                    key={"read-" + index}
                    className="notification-read flex flex-col gap-1 rounded p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleNotificationClick(l)}
                  >
                    <Typography
                      size="xs"
                      weight="semibold"
                      className="text-secondary-100"
                    >
                      {l.title}
                    </Typography>
                    <Typography
                      size="xs"
                      weight="normal"
                      className="text-secondary-80"
                    >
                      {l.description}
                    </Typography>
                    <Typography
                      size="xs"
                      weight="semibold"
                      className="text-secondary-50"
                    >
                      {l.createdAt}
                    </Typography>
                  </div>
                ))}
              </>
            )}
          </ul>
        )}
        {/* <Link
          to="/"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link> */}
      </Dropdown>
    </div>
  );
}
