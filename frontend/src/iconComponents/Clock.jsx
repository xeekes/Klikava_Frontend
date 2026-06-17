import IconMask from "./IconMask";
import icon from "../assets/images/clock.svg";

/**
 * Clock icon for delivery and availability metadata on product cards and in the cart.
 * @param {object} props
 */
const Clock = (props) => <IconMask src={icon} {...props} />;
export default Clock;
