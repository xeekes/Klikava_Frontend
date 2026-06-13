import IconMask from "./IconMask";
import icon from "../assets/icons/logout.svg";

/**
 * Иконка выхода для действия logout в меню пользователя шапки.
 * @param {object} props
 */
const Logout = (props) => <IconMask src={icon} {...props} />;
export default Logout;
