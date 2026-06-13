import IconMask from "./IconMask";
import icon from "../assets/icons/search.svg";

/**
 * Иконка лупы для оверлея и поля поиска по сайту.
 * @param {object} props
 */
const Search = (props) => <IconMask src={icon} {...props} />;
export default Search;
