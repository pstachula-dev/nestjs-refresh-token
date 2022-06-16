export interface User {
  id: number;
  email: string;
  password: string;
}

export const users: User[] = [
  {
    id: 1,
    email: 'vlad',
    password: 'pass',
  },
  {
    id: 2,
    email: 'pawel',
    password: 'pass',
  },
];
