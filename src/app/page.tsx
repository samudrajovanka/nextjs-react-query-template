import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { HomePage } from '@/features/home';
import { getUsersKey } from '@/features/user';
import { getUsers } from '@/features/user/api';
import { getQueryClient } from '@/shared/lib/helpers/queryClient';
import generateMetadata from '@/shared/lib/metadata';

export const metadata = generateMetadata({ title: 'Home' }, { withSuffix: true });

const HomeRoute = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: getUsersKey(),
    queryFn: getUsers
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
};

export default HomeRoute;
