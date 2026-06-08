import { USER_ROLES } from "../../constants/roles";
import "./PortalBadge.scss";

const BADGE_CONFIG = {
  [USER_ROLES.ADMIN]: {
    label: "Platform Admin",
    shortLabel: "Admin",
  },
  [USER_ROLES.SELLER]: {
    label: "Seller Portal",
    shortLabel: "Seller",
  },
};

const PortalBadge = ({ role, variant = "default" }) => {
  const config = BADGE_CONFIG[role];

  if (!config) {
    return null;
  }

  return (
    <span
      className={`portal-badge portal-badge--${role} portal-badge--${variant}`.trim()}
      title={config.label}
    >
      {variant === "compact" ? config.shortLabel : config.label}
    </span>
  );
};

export default PortalBadge;
