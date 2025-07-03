import { useTranslation } from "react-i18next";
import AppLayout from "../../layout/AppLayout";
import Typography from "../../lib/components/atoms/Typography";
import ProfileHeader from "../../lib/components/molecules/ProfileHeader";
import IconButton from "../../lib/components/molecules/IconuButton";
import { useEffect, useState } from "react";
import {
  LockActiveIcon,
  LockIcon,
  LogoutIcon,
  UserProfileActiveIcon,
  UserProfileIcon,
} from "../../icons";

import UserInformation from "../../components/user/UserInformation";
import Security from "../../components/user/Security";
import LogoutModal from "../../components/modal/LogoutModal";
import { useModal } from "../../hooks/useModal";
import { useQuery } from "@tanstack/react-query";
import { UserData } from "../Dashboard/CreateProject";
import localStorageService from "../../services/local.service";
import authService from "../../services/auth.service";

const EditProfile = () => {
  const { t } = useTranslation();
  const [isActiveButton, setIsActiveButton] = useState<"info" | "security">(
    "info"
  );
  const [userData, setUserData] = useState<UserData | undefined>();

  useEffect(() => {
    try {
      const userRaw = localStorageService.getUser();
      const user = typeof userRaw === "string" ? JSON.parse(userRaw) : userRaw;
      setUserData(user || null);
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    }
  }, []);
  const isTokenAvailable = !!userData?.token;

  const { data: profile } = useQuery({
    queryKey: ["userProfile", userData?.token],
    enabled: isTokenAvailable,
    queryFn: async () => {
      const res = await authService.getProfile()
      return res.data;
    },
  });

  const {
    isOpen: isOpenLogoutModal,
    openModal: openLogoutModal,
    closeModal: closeLogoutModal,
  } = useModal();
  return (
    <AppLayout>
      <div className="lg:px-10 px-4">
        <div>
          <Typography
            size="xl_2"
            weight="extrabold"
            className="text-secondary-100"
          >
            {t("edit_profile")}
          </Typography>
          <ProfileHeader
            email="pratik@mailinator.com"
            name="Pratik Patel"
            imageUrl="/images/user/thubmnail.png"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <div className="bg-white px-6 w-full lg:w-fit py-7 flex lg:flex-col flex-row gap-7 min-w-0 lg:min-w-[284px] rounded-[2px] h-fit overflow-x-auto">
            <IconButton
              onClick={() => setIsActiveButton("info")}
              className="w-fit"
              icon={
                isActiveButton === "info" ? (
                  <UserProfileActiveIcon />
                ) : (
                  <UserProfileIcon />
                )
              }
              isActive={isActiveButton === "info"}
              label={t("basic_information")}
              textClassName="text-[14px]"
            />
            <IconButton
              className="w-fit"
              onClick={() => setIsActiveButton("security")}
              icon={
                isActiveButton === "security" ? (
                  <LockActiveIcon width={24} height={24} />
                ) : (
                  <LockIcon width={24} height={24} />
                )
              }
              isActive={isActiveButton === "security"}
              label="Security"
              textClassName="text-[14px]"
            />
            <hr className="hidden lg:block" />
            <IconButton
              className="w-fit"
              icon={<LogoutIcon />}
              label={t("logout")}
              textClassName="!text-red text-[14px]"
              onClick={openLogoutModal}
            />
          </div>

          {isActiveButton === "info" ? (
            <UserInformation userData={profile && profile.data} />
          ) : (
            <Security userData={profile && profile.data} />
          )}
        </div>
        <LogoutModal isOpen={isOpenLogoutModal} onClose={closeLogoutModal} userData={userData} />
      </div>
    </AppLayout>
  );
};

export default EditProfile;
