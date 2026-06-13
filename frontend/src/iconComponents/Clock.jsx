import IconMask from "./IconMask";
import icon from "../assets/images/clock.svg";

/**
 * Иконка часов для метаданных доставки и наличия на карточках товаров и в корзине.
 * @param {object} props
 */
const Clock = (props) => <IconMask src={icon} {...props} />;
export default Clock;
