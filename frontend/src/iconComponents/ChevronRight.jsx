import ArrowLeft from "./ArrowLeft";

/**
 * Шеврон вправо для навигации карусели на карточке товара.
 * @param {object} props
 */
const ChevronRight = ({ className, style, ...props }) => (
  <ArrowLeft
    className={["icon-chevron-right", className].filter(Boolean).join(" ")}
    style={{ transform: "scaleX(-1)", ...style }}
    {...props}
  />
);
export default ChevronRight;
