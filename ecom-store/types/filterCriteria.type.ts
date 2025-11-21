import type { ResponseApi } from './responseApi.type';

export type FilterValue = {
  id: number;
  value: string;
  filterCriteriaId: number;
};

export type FilterCriteria = {
  id: number;
  name: string;
  categoryId: number;
  filterValues?: FilterValue[];
};

export type FilterCriteriaResponse = ResponseApi<FilterCriteria>;
export type FilterCriteriaListResponse = ResponseApi<FilterCriteria[]>;

