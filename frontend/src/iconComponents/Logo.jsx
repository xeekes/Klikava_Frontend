import IconMask from "./IconMask";
import icon from "../assets/icons/logo.svg";

/**
 * Логотип бренда KLIKAVA для шапки и футера сайта.
 * @param {object} props
 */
const Logo = (props) => <IconMask src={icon} {...props} />;
export default Logo;
