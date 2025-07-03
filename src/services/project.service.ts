import { ApiRoutes } from "../utils/constant/apiRoutes";
import ApiBaseService from "./apibase.service";

class ProjectService extends ApiBaseService {

  async createProject(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.CREATE_PROJECT, data);
  }

  async uploadFile(data: any, config: any = {}) {
    return await this.authorizedRequest.post(
      ApiRoutes.UPLOAD_FILE,
      data,
      config
    );
  }

  async removeFile(id:string){
    return await this.authorizedRequest.delete(ApiRoutes.REMOVE_FILE,{data:{id}})
  }
  
  async requestDetails(data:any){
    return await this.authorizedRequest.post(ApiRoutes.REQUEST_DETAILS,data)
  }
  
  async getProjectDetails(projectId: string) {
    const formData = new FormData();
    formData.append("project_id", projectId);
    const response = await this.authorizedRequest.post("/project/view", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  }

  async deleteRequest(requestIds:string){
    return await this.authorizedRequest.delete(ApiRoutes.DELETE_REQUEST,{data:{request_ids:requestIds}})
  }

}

const projectService = new ProjectService();

export default projectService;
