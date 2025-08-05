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
import authService from "../../services/auth.service";
import { useLoading } from "../../context/LoaderProvider";
import { toast } from "react-toastify";
import { useUser } from "../../hooks/useUser";

// interface ProfileData {
//   data: {
//     first_name: string;
//     last_name: string;
//     company_name: string;
//     profile_picture?: string;
//   };
// }

const EditProfile = () => {
  const { t } = useTranslation();
  const [isActiveButton, setIsActiveButton] = useState<"info" | "security">(
    "info"
  );
  const { setLoading } = useLoading();
  const { userData, updateUserData } = useUser();
  // const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Cleanup image preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const isTokenAvailable = !!userData?.token;

  const { refetch } = useQuery({
    queryKey: ["userProfile", userData?.token],
    enabled: isTokenAvailable,
    queryFn: async () => {
      setLoading(true);
      const res = await authService.getProfile();
      console.log(res.data.data, "userProfileData");
      setLoading(false);

      // Update user data using the hook
      updateUserData({
        first_name: res.data.data.first_name,
        last_name: res.data.data.last_name,
        company_name: res.data.data.company_name,
        profile_picture: res.data.data.profile_picture,
        profile_image: res.data.data.profile_image,
        mobile: res.data.data.mobile,
        country_code: res.data.data.country_code,
      });

      // Clear image preview after successful update
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        setFile(null);
      }

      return res.data;
    },
  });

  // Profile picture upload mutation
  // const uploadProfilePictureMutation = useMutation({
  //   mutationFn: async (file: File) => {
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append("type", "image");
  //     return await authService.uploadProfilePicture(formData);
  //   },
  //   onSuccess: (response) => {
  //     const newImageUrl = response.data.data?.url;
  //     if (newImageUrl) {
  //       setUserData((prev: UserData | null) => {
  //         if (!prev) return prev;
  //         return {
  //           ...prev,
  //           profile_picture: newImageUrl,
  //         };
  //       });
  //       toast.success(t("profile_picture_updated_successfully"));
  //       // Refetch profile data
  //       refetch();
  //     }
  //   },
  //   onError: (error) => {
  //     console.error("Failed to upload profile picture:", error);
  //     toast.error(t("failed_to_upload_profile_picture"));
  //   },
  //   onSettled: () => {
  //     setIsUploadingImage(false);
  //   },
  // });

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

    // Clean up previous preview URL if it exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Create new preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setFile(file);
  };

  const {
    isOpen: isOpenLogoutModal,
    openModal: openLogoutModal,
    closeModal: closeLogoutModal,
  } = useModal();

  const handelSetUser = (data: { email: string }): void => {
    if (data) {
      updateUserData({
        email: data.email,
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
              imageUrl={
                imagePreview ||
                userData.profile_image ||
                userData.profile_picture
              }
              onImageUpload={handleImageUpload}
              // isUploading={isUploadingImage}
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
                <UserInformation
                  userData={userData as any}
                  file={file}
                  onProfileUpdate={() => refetch()}
                />
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
