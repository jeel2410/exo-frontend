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
import { useQuery, useMutation } from "@tanstack/react-query";
import localStorageService from "../../services/local.service";
import authService from "../../services/auth.service";
import { useLoading } from "../../context/LoaderProvider";
import { toast } from "react-toastify";

// Define proper types for user data
interface UserData {
  id?: string | number;
  token: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  profile_picture?: string;
  profile_image?: string;
  country_code?: string;
  mobile?: string;
  type?: string;
}

interface ProfileData {
  data: {
    first_name: string;
    last_name: string;
    company_name: string;
    profile_picture?: string;
  };
}

const EditProfile = () => {
  const { t } = useTranslation();
  const [isActiveButton, setIsActiveButton] = useState<"info" | "security">(
    "info"
  );
  const { setLoading } = useLoading();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const userRaw = localStorageService.getUser();
      const user = typeof userRaw === "string" ? JSON.parse(userRaw) : userRaw;
      setUserData(user || null);
      setLoading(false);
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    }
  }, [setLoading]);

  const isTokenAvailable = !!userData?.token;

  const { refetch } = useQuery({
    queryKey: ["userProfile", userData?.token],
    enabled: isTokenAvailable,
    queryFn: async () => {
      setLoading(true);
      const res = await authService.getProfile();
      console.log(res.data.data, "userProfileData");
      setLoading(false);
      setUserData((prev: UserData | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          first_name: res.data.data.first_name,
          last_name: res.data.data.last_name,
          company_name: res.data.data.company_name,
          profile_picture: res.data.data.profile_picture,
          profile_image: res.data.data.profile_image,
          mobile: res.data.data.mobile,
        };
      });
      localStorageService.setUser(JSON.stringify({
          ...userData,
          first_name: res.data.data.first_name,
          last_name: res.data.data.last_name,
          company_name: res.data.data.company_name,
          profile_picture: res.data.data.profile_picture,
          profile_image: res.data.data.profile_image,
          mobile: res.data.data.mobile,
        }))
      return res.data as ProfileData;
    },
  });

  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      return await authService.uploadProfilePicture(formData);
    },
    onSuccess: (response) => {
      const newImageUrl = response.data.data?.url;
      if (newImageUrl) {
        setUserData((prev: UserData | null) => {
          if (!prev) return prev;
          return {
            ...prev,
            profile_picture: newImageUrl,
          };
        });
        toast.success(t("profile_picture_updated_successfully"));
        // Refetch profile data
        refetch();
      }
    },
    onError: (error) => {
      console.error("Failed to upload profile picture:", error);
      toast.error(t("failed_to_upload_profile_picture"));
    },
    onSettled: () => {
      setIsUploadingImage(false);
    },
  });

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("please_select_a_valid_image_file"));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(t("image_size_should_be_less_than_5mb"));
      return;
    }

    // setIsUploadingImage(true);
    setFile(file);
    // uploadProfilePictureMutation.mutate(file);
  };

  const {
    isOpen: isOpenLogoutModal,
    openModal: openLogoutModal,
    closeModal: closeLogoutModal,
  } = useModal();

  const handelSetUser = (data: { email: string }): void => {
    if (data) {
      setUserData((prev: UserData | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          email: data.email,
        };
      });
    }
  };

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
          {userData && (
            <ProfileHeader
              email={(userData && userData.email) || ""}
              fullName={
                (userData && `${userData.first_name} ${userData.last_name}`) ||
                ""
              }
              name={{
                firstName: userData.first_name || "",
                lastName: userData.last_name || "",
              }}
              imageUrl={userData.profile_image || userData.profile_picture}
              onImageUpload={handleImageUpload}
              isUploading={isUploadingImage}
            />
          )}
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
              label={t("security")}
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

          {userData && (
            <>
              {isActiveButton === "info" ? (
                <UserInformation userData={userData as any} file={file} />
              ) : (
                <Security
                  userData={userData as any}
                  setUserDate={handelSetUser}
                />
              )}
            </>
          )}
        </div>
        {userData && (
          <LogoutModal
            isOpen={isOpenLogoutModal}
            onClose={closeLogoutModal}
            userData={userData as any}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default EditProfile;
