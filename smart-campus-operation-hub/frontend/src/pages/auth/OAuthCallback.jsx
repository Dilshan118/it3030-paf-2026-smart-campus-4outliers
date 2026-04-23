import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function OAuthCallback() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    login(token)
      .then((userData) => {
        if (!userData?.profileCompleted) {
          navigate('/complete-profile', { replace: true });
          return;
        }
        const redirectUrl = localStorage.getItem('auth_redirect') || '/';
        localStorage.removeItem('auth_redirect');
        navigate(redirectUrl, { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, []);

  return <LoadingSpinner />;
}
