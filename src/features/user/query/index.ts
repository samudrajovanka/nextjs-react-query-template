import { useQuery } from '@tanstack/react-query';

import { getUsers } from '@/features/user/api';

export const getUsersKey = () => ['users'];

export const useUsers = () => {
  const result = useQuery({
    queryKey: getUsersKey(),
    queryFn: getUsers
  });

  return result;
};
