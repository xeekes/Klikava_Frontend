import IconMask from "./IconMask";
import icon from "../assets/icons/user.svg";

/**
 * Иконка пользователя/профиля для триггера меню и заголовка выпадающего списка.
 * @param {object} props
 */
const User = (props) => <IconMask src={icon} {...props} />;
export default User;
