import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function OAuthCallback() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // TEMPORARY: For development, just redirect to login
    // TODO: Handle actual OAuth callback with token/code from URL params
    navigate('/login');
  }, [navigate]);

  return <LoadingSpinner />;
}
