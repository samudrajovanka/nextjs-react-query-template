import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';
import { cache } from 'react';
import type { ErrorGeneralResponse } from '@/shared/types/response';
import { FetchError } from './fetcher';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
      retry: (failureCount, error) => {
        if (error instanceof FetchError && error.status >= 400 && error.status < 500) {
          return false;
        }

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          return failureCount < 2;
        }

        return false;
      }
    },
    mutations: {
      onError: (error: Error) => {
        let message = error.message;

        if (error instanceof FetchError) {
          message = (error.data as ErrorGeneralResponse).message;
        }

        console.log('error mutation', message);
      }
    }
  }
};

export const getQueryClient = cache(() => new QueryClient(queryClientConfig));
