import type { UseQueryResult } from '@tanstack/react-query';
import type React from 'react';

export type QueryProps<T> = {
  queryResult: UseQueryResult<T>;
  render: (data: T) => React.ReactNode;
  renderLoading?: React.ReactNode;
  renderError?: React.ReactNode;
  renderEmpty?: React.ReactNode;
  renderNotFound?: React.ReactNode;
  renderForbidden?: React.ReactNode;
  bypassForbidden?: boolean;
  checkEmpty?: (data: T) => boolean;
};
