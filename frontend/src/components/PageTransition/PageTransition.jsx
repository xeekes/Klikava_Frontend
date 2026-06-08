import { useLocation, useOutlet } from "react-router-dom";
import { isAuthPath } from "../../constants/authRoutes";
import "./PageTransition.scss";

const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();

  if (isAuthPath(location.pathname)) {
    return outlet;
  }

  return (
    <div key={location.pathname} className="page-transition">
      {outlet}
    </div>
  );
};

export default PageTransition;
