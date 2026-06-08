import "./SellerFormField.scss";

const SellerFormField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  className = "",
  multiline = false,
}) => {
  const InputTag = multiline ? "textarea" : "input";

  return (
    <label
      htmlFor={id}
      className={`seller-field ${className}`.trim()}
    >
      <span className="seller-field__label">{label}</span>
      <div className="seller-field__control-wrap">
        <InputTag
          id={id}
          type={multiline ? undefined : type}
          className={`seller-field__control ${multiline ? "seller-field__control--area" : ""}`.trim()}
          value={value}
          onChange={onChange}
        />
        {multiline ? null : (
          <span className="seller-field__icon" aria-hidden="true">
            ⚙
          </span>
        )}
      </div>
    </label>
  );
};

export default SellerFormField;
