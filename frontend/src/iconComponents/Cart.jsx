import IconMask from "./IconMask";
import icon from "../assets/icons/cart.svg";

/**
 * Cart icon for the cart button in the header and the “add to cart” actions.
 * @param {object} props
 */
const Cart = (props) => <IconMask src={icon} {...props} />;
export default Cart;
