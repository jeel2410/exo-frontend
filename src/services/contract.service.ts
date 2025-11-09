import { ApiRoutes } from "../utils/constant/apiRoutes";
import ApiBaseService from "./apibase.service";

// Contract API interfaces
export interface ContractCreateRequest {
  project_id: string;
  currency: string;
  amount: string;
  place: string;
  date_of_signing: string;
  contracting_agency_name: string;
  contracting_agency_person_name: string;
  contracting_agency_person_position: string;
  awarded_company_name: string;
  awarded_company_person_name: string;
  awarded_company_person_position: string;
  reference: string;
  name: string;
  document_ids?: string;
  contract_id?: string; // For updates
}

export interface ContractDetailsResponse {
  project_id: string;
  currency: string;
  amount: string;
  amount_cdf?: string | number;
  exchange_rate_used?: string | number;
  place: string;
  date_of_signing: string;
  contracting_agency_name?: string;
  contracting_agency_person_name?: string;
  contracting_agency_person_position?: string;
  awarded_company_name?: string;
  awarded_company_person_name?: string;
  awarded_company_person_position?: string;
  reference?: string;
  name?: string;
  documents: any[] | [];
  // Legacy fields for backward compatibility
  signed_by?: string;
  position?: string;
  organization?: string;
}

class ContractService extends ApiBaseService {
  async getProjects(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.LIST_ALL_PPROJECT, data);
  }

  async getContractDetails(data: { contract_id: string } | FormData) {
    return await this.authorizedRequest.post<{
      status: number;
      data: ContractDetailsResponse & {
        summary?: any; // For backward compatibility
        id?: string;
        created_at?: string;
        requests_data_count?: number;
        requests_data?: any[];
      };
      message?: string;
    }>(ApiRoutes.CONTRACT_DETAILS, data);
  }

  async creteContract(data: FormData) {
    return await this.authorizedRequest.post<{
      status: number;
      data: { id: string };
      message?: string;
    }>(ApiRoutes.CREATE_CONTRACT, data);
  }

  async getAllContractList(data: any) {
    return await this.authorizedRequest.post(ApiRoutes.ALL_CONTRACT_LIST, data);
  }

  async archiveContract(data: any) {
    return await this.authorizedRequest.delete(ApiRoutes.ARCHIVE_CONTRACT, {
      data: data,
    });
  }
}

const contractService = new ContractService();

export default contractService;
