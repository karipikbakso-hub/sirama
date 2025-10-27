import LoginForm from './components/LoginForm'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <LoginForm />
      </div>
    </div>
  )
}
