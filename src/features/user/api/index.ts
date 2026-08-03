import placeholderApiClient from '@/shared/lib/helpers/apiClient/placeholderApiClient';
import type { User } from './types';

export const getUsers = async () => {
  return await placeholderApiClient.get<User[]>('/users');
};
