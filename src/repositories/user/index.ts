import { User } from './types';

export const getUsers = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users')
    .then((res) => res.json() as Promise<User[]>);

  return response;
};
