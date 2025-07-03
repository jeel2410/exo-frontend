import ApiBaseService from "./apibase.service";

class HomeService extends ApiBaseService {
  async getHomeData(limit: number, offset: number) {
    // The API expects form data, so use FormData
    const formData = new FormData();
    formData.append("limit", String(limit));
    formData.append("offset", String(offset));
    const response = await this.authorizedRequest.post("/home", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}

const homeService = new HomeService();
export default homeService;