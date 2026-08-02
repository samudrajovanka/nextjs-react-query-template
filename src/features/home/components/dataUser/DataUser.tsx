import { useUsers } from '@/features/user';

const DataUser = () => {
  const usersQuery = useUsers();

  return (
    <div>
      {usersQuery.data?.map((user) => (
        <p key={user.email}>{user.name}</p>
      ))}
    </div>
  );
};

export default DataUser;
