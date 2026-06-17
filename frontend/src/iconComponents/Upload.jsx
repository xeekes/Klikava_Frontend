import IconMask from "./IconMask";
import icon from "../assets/icons/upload.svg";

/**
 * Upload icon for uploading a photo in your profile details.
 * @param {object} props
 */
const Upload = (props) => <IconMask src={icon} {...props} />;
export default Upload;
