import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e6f2f9] via-[#f8fbfc] to-[#e6f2f9] px-4">
      <div className="absolute inset-0 bg-[url('/bg-medical.svg')] bg-no-repeat bg-center bg-cover opacity-10 pointer-events-none" />
      <LoginForm />
    </div>
  );
}