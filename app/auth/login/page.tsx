import LoginForm from './LoginForm';

/**
 * Login page.
 * 
 * Authenticated users are automatically redirected to /dashboard
 * by the middleware (middleware.ts, lines 79-89) before this page
 * ever renders. No duplicate check needed here.
 */
export default function LoginPage() {
  return <LoginForm />;
}
