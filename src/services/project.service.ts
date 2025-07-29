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

  async removeFile(id: string) {
    return await this.authorizedRequest.delete(ApiRoutes.REMOVE_FILE, {
      data: { id },
    });
  }

  async changeDocumentName(newName: string, documentId: string) {
    return await this.authorizedRequest.put(ApiRoutes.RENAME_FILE, {
      new_name: newName,
      document_id: documentId,
    });
  }

  async requestDetails(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.REQUEST_DETAILS, data);
  }

  async getProjectDetails(projectId: string) {
    const formData = new FormData();
    formData.append("project_id", projectId);
    const response = await this.authorizedRequest.post(
      "/project/view",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async deleteRequest(requestIds: string) {
    return await this.authorizedRequest.delete(ApiRoutes.DELETE_REQUEST, {
      data: { request_ids: requestIds },
    });
  }
  async deleteProject(projectIds: string) {
    return await this.authorizedRequest.delete(ApiRoutes.DELETE_PROJECT, {
      data: { project_ids: projectIds },
    });
  }

  async getAddressList(projectId: string) {
    return await this.authorizedRequest.post(ApiRoutes.ADDRESS_LIST, {
      project_id: projectId,
    });
  }
}

const projectService = new ProjectService();

export default projectService;
