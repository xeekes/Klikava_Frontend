import IconMask from "./IconMask";
import icon from "../assets/icons/user.svg";

/**
 * User/profile icon for menu trigger and dropdown title.
 * @param {object} props
 */
const User = (props) => <IconMask src={icon} {...props} />;
export default User;
