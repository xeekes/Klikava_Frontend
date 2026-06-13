import IconMask from "./IconMask";
import icon from "../assets/icons/arrow_right.svg";

/**
 * Стрелка подменю для раскрывающихся пунктов в меню пользователя и каталоге.
 * @param {object} props
 */
const MenuArrowRight = (props) => <IconMask src={icon} {...props} />;
export default MenuArrowRight;
