import { ObjectData } from '../../types';

export const paginateResponse = <T>({
  paginate,
  ...data
}: {
  count: number;
  rows: T[];
  paginate: {
    offset: number;
    skip: number;
    page: number;
    limit: number;
    href: (prev?: boolean, params?: ObjectData) => string;
    hasNextPages: (pageCount: number) => boolean;
    getArrayPages: (limit: number, pageCount: number, page: number) => { number: number; url: string }[];
  };
}): {
  records: T[];
  metaData: {
    page: number;
    perPage: number;
    pageCount: number;
    totalCount: number;
    hasPreviousPages: boolean;
    hasNextPages: boolean;
    links: { number: number; url: string }[];
  };
} => {
  const pageCount = Math.ceil(data.count / paginate.limit);

  return {
    records: data.rows,
    metaData: {
      page: paginate.page,
      perPage: paginate.limit,
      pageCount,
      totalCount: data.count,
      hasPreviousPages: paginate.page > 1,
      hasNextPages: paginate.hasNextPages(pageCount),
      links: paginate.getArrayPages(paginate.limit, pageCount, paginate.page),
    },
  };
};
