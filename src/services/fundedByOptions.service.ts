import ApiBaseService from "./apibase.service";

export type FundedByQuery = {
  search?: string;
  active?: boolean | string; // API expects boolean-like string
  limit?: number;
  offset?: number;
};

export type FundedByItem = {
  id: string;
  name: string;
  status: string;
};

export type FundedByResponse = {
  status: number;
  message: string;
  data: FundedByItem[];
  total?: number;
  limit?: number;
  offset?: number;
};

class FundedByOptionsService extends ApiBaseService {
  async getOptions(params: FundedByQuery = {}) {
    const { search = "", active = true, limit = 15, offset = 0 } = params;
    const res = await this.guestRequest.get<FundedByResponse>(
      "/funded-by-options",
      {
        params: {
          search: search || undefined,
          active: String(active),
          limit,
          offset,
        },
      }
    );
    return res.data;
  }
}

const fundedByOptionsService = new FundedByOptionsService();
export default fundedByOptionsService;
