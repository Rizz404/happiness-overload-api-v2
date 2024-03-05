import { Links, MultiResponse, Pagination } from "../../interface/Response";

export const createPagination = (
  page: number,
  limit: number,
  totalPages: number,
  totalData: number
): Pagination => {
  return {
    currentPage: page,
    dataPerPage: limit,
    totalPages,
    totalData,
    hasNextPage: page < totalPages,
  };
};

export const createPageLinks = (
  endpoint: string,
  page: number,
  totalPages: number,
  limit: number,
  category?: string
): Links => {
  const optionalCategory = category ? `?category=${category}` : "";

  return {
    previous: page > 1 ? `${endpoint}${optionalCategory}&page=${page - 1}&limit=${limit}` : null,
    next:
      page < totalPages ? `${endpoint}${optionalCategory}&page=${page + 1}&limit=${limit}` : null,
  };
};

export const multiResponse = <T>(
  data: T[],
  pagination: Pagination,
  links: Links,
  additonalParams?: { [key: string]: any }
): MultiResponse => {
  return {
    data,
    pagination,
    links,
    ...additonalParams,
  };
};
