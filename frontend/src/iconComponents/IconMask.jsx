const IconMask = ({ src, className, style, ...props }) => {
  return (
    <span
      className={["icon-mask", className].filter(Boolean).join(" ")}
      style={{ ...style, "--icon-url": `url(${src})` }}
      {...props}
    />
  );
};

export default IconMask;
