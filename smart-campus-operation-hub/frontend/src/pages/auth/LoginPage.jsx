import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMockLogin = () => {
    // TEMPORARY: Mock login for development/testing
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'STUDENT'
    };
    login('mock-token', mockUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Smart Campus Hub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the notification system
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleMockLogin}
              className="btn btn-primary w-full"
            >
              Mock Login (Development)
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This is a temporary login for testing the notification system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
