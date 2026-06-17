import IconMask from "./IconMask";
import icon from "../assets/icons/search.svg";

/**
 * Magnifying glass icon for the overlay and site search field.
 * @param {object} props
 */
const Search = (props) => <IconMask src={icon} {...props} />;
export default Search;
