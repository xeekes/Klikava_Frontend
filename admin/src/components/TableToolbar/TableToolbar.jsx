import "./TableToolbar.scss";

const TableToolbar = ({
  value,
  onChange,
  placeholder = "Search...",
  action = null,
}) => {
  return (
    <div className="dash-toolbar table-toolbar">
      <label className="dash-search dash-toolbar__search">
        <span className="dash-search__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </label>

      <button type="button" className="dash-toolbar__filter" aria-label="Filter">
        ☰
      </button>

      {action}
    </div>
  );
};

export default TableToolbar;
