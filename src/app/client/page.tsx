'use client';

import { useUsers } from '@/features/user/query';
import ReactQuery from '@/shared/components/molecules/query/Query';

const ClientPage = () => {
  const usersQuery = useUsers();

  return (
    <div>
      <p>Users list</p>

      <ReactQuery
        queryResult={usersQuery}
        renderLoading={<p>Getting users data...</p>}
        render={(users) => (
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
