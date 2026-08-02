import type { PaginationMeta } from './pagination';

export type ErrorGeneralResponse = {
  success: false;
  message: string;
  type: string;
  validations?: Record<string, unknown>;
};

export type SuccessGeneralResponse = {
  success: true;
  message: string;
};

export type SuccessResponseData<SuccessData> = SuccessGeneralResponse & {
  data: SuccessData;
  meta?: {
    pagination?: PaginationMeta;
  };
};
