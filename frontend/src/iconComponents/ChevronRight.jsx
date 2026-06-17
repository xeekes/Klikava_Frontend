import ArrowLeft from "./ArrowLeft";

/**
 * Chevron to the right for carousel navigation on the product card.
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
