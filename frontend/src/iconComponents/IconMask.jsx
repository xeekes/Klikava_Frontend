const IconMask = ({ src, className, style, ...props }) => {
  const iconUrl = typeof src === "string" ? src : String(src);

  return (
    <span
      className={["icon-mask", className].filter(Boolean).join(" ")}
      style={{ ...style, "--icon-url": `url("${iconUrl}")` }}
      {...props}
    />
  );
};

export default IconMask;
