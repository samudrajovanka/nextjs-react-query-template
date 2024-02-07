/**
 * ! Example for use react query on client component
 */
'use client';

import ReactQuery from '@/components/parts/ReactQuery';
import { useUsers } from '@/query/user';

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
            {users.map(user => (
              <p key={user.email}>{user.name}</p>
            ))}
          </>
        )}
      />
    </div>
  );
};

export default ClientPage;
