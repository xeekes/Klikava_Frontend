import IconMask from "./IconMask";
import icon from "../assets/icons/logo.svg";

/**
 * KLIKAVA brand logo for the header and footer of the site.
 * @param {object} props
 */
const Logo = (props) => <IconMask src={icon} {...props} />;
export default Logo;
