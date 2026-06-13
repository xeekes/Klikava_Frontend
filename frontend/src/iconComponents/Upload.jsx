import IconMask from "./IconMask";
import icon from "../assets/icons/upload.svg";

/**
 * Иконка загрузки для загрузки фото в личных данных профиля.
 * @param {object} props
 */
const Upload = (props) => <IconMask src={icon} {...props} />;
export default Upload;
