import api from '@/lib/api';
import { User } from '@/types/user';

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<{ access_token: string; user: User }>('/login', {
    email,
    password,
  });

  localStorage.setItem('token', res.data.access_token);
  return res.data.user;
}

export async function getMe(): Promise<User> {
  const res = await api.get<User>('/me');
  return res.data;
}