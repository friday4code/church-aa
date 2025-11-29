import { useNavigate, useLocation } from 'react-router';

export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    pathname: location.pathname,
    query: location.search,
    hash: location.hash,
    state: location.state
  };
};
