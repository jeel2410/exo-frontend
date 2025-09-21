import { ApiRoutes } from "../utils/constant/apiRoutes";
import ApiBaseService from "./apibase.service";

class AuthService extends ApiBaseService {
  async checkMobile(data: { email: string; password: string; country_code: string; mobile: string; lang: string }) {
    return await this.guestRequest.post(ApiRoutes.CHECK_MOBILE, data);
  }
  
  async sendOtp(data: { email: string; first_name: string; is_login: string; mobile?: string }) {
    const payload: { email: string; first_name: string; is_login: string; mobile?: string } = {
      email: data.email,
      first_name: data.first_name,
      is_login: data.is_login
    };
    if (data.mobile) {
      payload.mobile = data.mobile;
    }
    return await this.guestRequest.post(ApiRoutes.SEND_OTP, payload);
  }
  async signUp(data: any) {
    return await this.guestRequest.post(ApiRoutes.SIGN_UP, data);
  }
  async otpVerification(data: any) {
    return await this.guestRequest.post(ApiRoutes.VERIFY_OTP, data);
  }
  async signIn(data: any) {
    return await this.guestRequest.post(ApiRoutes.LOGIN, data);
  }
  async forgotPassword(data: any) {
    return await this.guestRequest.post(ApiRoutes.FORGOT_PASSWORD, data);
  }
  async resetPassword(data: any) {
    return await this.guestRequest.post(ApiRoutes.RESET_PASSWORD, data);
  }
  async getProfile() {
    return await this.authorizedRequest.get(ApiRoutes.USER_PROFILE);
  }
  async editProfile(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.EDIT_PROFILE, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async changeEmail(data: any) {
    return await this.authorizedRequest.put(ApiRoutes.CHANGE_EMAIL, data);
  }

  async logOutUser() {
    return await this.authorizedRequest.get(ApiRoutes.LOGOUT_USER);
  }

  async changePassword(data: any) {
    return await this.authorizedRequest.put(ApiRoutes.CHANGE_PASSWORD, data);
  }

  async uploadProfilePicture(data: FormData) {
    return await this.authorizedRequest.post(ApiRoutes.UPLOAD_FILE, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  async notificationList() {
    return await this.authorizedRequest.post(ApiRoutes.NOTIFICATION_LIST);
  }
  // async getProfile() {
  //   return await this.guestRequest.post(ApiRoutes.RESET_PASSWORD, data);
  // }
}

const authService = new AuthService();
export default authService;
