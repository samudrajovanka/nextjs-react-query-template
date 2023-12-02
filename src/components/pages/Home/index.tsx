/**
 * ! Example for use react query on client component using hydrate from server
 */
'use client';

import { useUsers } from '@/query/user';

const Home = () => {
  const usersQuery = useUsers();

  return (
    <div>
      <p>Users list</p>

      {usersQuery.data?.map((user) => (
        <p key={user.email}>{user.name}</p>
      ))}
    </div>
  );
};

export default Home;
