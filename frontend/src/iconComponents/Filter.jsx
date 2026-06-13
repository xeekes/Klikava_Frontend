import IconMask from "./IconMask";
import icon from "../assets/icons/filter.svg";

/**
 * Иконка фильтра для фильтров каталога и меню пользователя шапки.
 * @param {object} props
 */
const Filter = (props) => <IconMask src={icon} {...props} />;
export default Filter;
