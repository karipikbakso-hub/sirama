'use client';

import { useState } from 'react';
import { MdEmail, MdLock } from 'react-icons/md';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await api.post('/login', { email, password });
      const token = res.data.access_token;

      localStorage.setItem('token', token);
      setError('');

      // Optional: simpan user info kalau mau
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Redirect ke dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError('Email atau password salah');
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md shadow-blue-100 p-8 space-y-6">
      <h2 className="text-2xl font-bold text-center text-[#1a4c6e]">Login SIRAMA</h2>

      <div className="space-y-6">
        {/* Email */}
        <div className="relative">
          <MdEmail className="absolute left-3 top-4 text-muted-foreground text-xl" />
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full pl-10 pt-6 pb-2 rounded-md border border-[#e0e0e0] bg-[#f5f5f5] text-[#212121] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
          <label
            htmlFor="email"
            className="absolute left-10 top-2 text-sm text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#1976d2]"
          >
            Email
          </label>
        </div>

        {/* Password */}
        <div className="relative">
          <MdLock className="absolute left-3 top-4 text-muted-foreground text-xl" />
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full pl-10 pt-6 pb-2 rounded-md border border-[#e0e0e0] bg-[#f5f5f5] text-[#212121] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
          <label
            htmlFor="password"
            className="absolute left-10 top-2 text-sm text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#1976d2]"
          >
            Password
          </label>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full py-2 rounded-md bg-[#1976d2] text-white font-semibold hover:bg-[#1565c0] transition"
        >
          Masuk
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <a href="/register" className="text-[#1976d2] hover:underline">
          Daftar di sini
        </a>
      </p>
    </div>
  );
}