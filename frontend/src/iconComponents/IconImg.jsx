/**
 * Отображает SVG-ресурс как элемент img для слайдера и навигационных иконок.
 * @param {object} props
 */
const IconImg = ({ src, className, alt = "", ...props }) => (
  <img
    src={src}
    className={["icon-img", className].filter(Boolean).join(" ")}
    alt={alt}
    aria-hidden={!alt}
    draggable={false}
    {...props}
  />
);
export default IconImg;
