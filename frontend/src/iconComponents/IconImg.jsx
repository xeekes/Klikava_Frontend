/**
 * Displays an SVG resource as an img element for slider and navigation icons.
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
