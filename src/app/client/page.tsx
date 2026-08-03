'use client';

import { useUsers } from '@/features/user/query';
import { QueryHandling } from '@/shared/components/molecules/query';

const ClientPage = () => {
  const usersQuery = useUsers();

  return (
    <div>
      <p>Users list</p>

      <QueryHandling
        queryResult={usersQuery}
        renderLoading={<p>Getting users data...</p>}
        render={({ data: users }) => (
          <>
            {users.map((user) => (
              <p key={user.email}>{user.name}</p>
            ))}
          </>
        )}
      />
    </div>
  );
};

export default ClientPage;
