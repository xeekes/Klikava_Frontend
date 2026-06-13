import IconMask from "./IconMask";
import icon from "../assets/icons/arrow-next.svg";

/**
 * Стрелка назад для страниц заказов профиля и каруселей товаров.
 * @param {object} props
 */
const ArrowLeft = (props) => <IconMask src={icon} {...props} />;
export default ArrowLeft;
