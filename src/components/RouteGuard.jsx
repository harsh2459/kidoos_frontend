import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/Auth";
import { useSite } from "../contexts/SiteConfig";

export function AdminGuard({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

export function PageGate({ page, children }) {
  const { visibility } = useSite();
  const { isAdmin } = useAuth();
  const cfg = visibility?.pages?.[page];

  // If no config, assume public
  if (!cfg) return children;

  // If explicitly public
  if (cfg.public) return children;

  // If roles specified
  if (cfg.roles && cfg.roles.length) {
    return (isAdmin ? children : <Navigate to="/" replace />);
  }

  // default deny
  return <Navigate to="/" replace />;
}
