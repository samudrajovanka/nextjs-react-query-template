import { useQuery } from '@tanstack/react-query';

import { getUsers } from '@/features/user/api';

export const getUsersKey = () => ['users'];

export const useUsers = () => {
  return useQuery({
    queryKey: getUsersKey(),
    queryFn: getUsers
  });
};
