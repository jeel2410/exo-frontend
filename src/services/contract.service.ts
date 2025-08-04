import { ApiRoutes } from "../utils/constant/apiRoutes";
import ApiBaseService from "./apibase.service";

class ContractService extends ApiBaseService {
  async getProjects(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.LIST_ALL_PPROJECT, data);
  }
  async getContractDetails(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.CONTRACT_DETAILS, data);
  }
  async creteContract(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.CREATE_CONTRACT, data);
  }
  async getAllContractList(data:any){
    return await this.authorizedRequest.post(ApiRoutes.ALL_CONTRACT_LIST,data)
  }
  async archiveContract(data:any){
    return await this.authorizedRequest.delete(ApiRoutes.ARCHIVE_CONTRACT,{data:data})
  }
}

const contractService = new ContractService();

export default contractService;
