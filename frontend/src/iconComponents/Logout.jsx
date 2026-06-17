import IconMask from "./IconMask";
import icon from "../assets/icons/logout.svg";

/**
 * Logout icon for the logout action in the header user menu.
 * @param {object} props
 */
const Logout = (props) => <IconMask src={icon} {...props} />;
export default Logout;
