import ArrowLeft from "./ArrowLeft";

const ChevronRight = ({ className, style, ...props }) => (
  <ArrowLeft
    className={["icon-chevron-right", className].filter(Boolean).join(" ")}
    style={{ transform: "scaleX(-1)", ...style }}
    {...props}
  />
);

export default ChevronRight;
