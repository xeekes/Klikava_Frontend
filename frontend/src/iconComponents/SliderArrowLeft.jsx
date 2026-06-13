import IconImg from "./IconImg";
import icon from "../assets/icons/silder_arrow_left.svg";

/**
 * Стрелка карусели влево для мобильного меню шапки и слайдера скидок.
 * @param {object} props
 */
const SliderArrowLeft = (props) => <IconImg src={icon} {...props} />;
export default SliderArrowLeft;
