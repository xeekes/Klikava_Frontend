import IconMask from "./IconMask";
import icon from "../assets/icons/cart.svg";

/**
 * Иконка корзины для кнопки корзины в шапке и действий «добавить в корзину».
 * @param {object} props
 */
const Cart = (props) => <IconMask src={icon} {...props} />;
export default Cart;
