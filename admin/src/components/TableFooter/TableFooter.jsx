import "./TableFooter.scss";

const TableFooter = ({
  showFilterSelected = false,
  trashLabel = "Trash Selected",
  onTrashSelected,
  isTrashDisabled = false,
  total = 0,
  rangeStart = 0,
  rangeEnd = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  onFirst,
  onPrev,
  onNext,
  onLast,
  canGoFirst = false,
  canGoPrev = false,
  canGoNext = false,
  canGoLast = false,
}) => {
  return (
    <div className="dash-table-footer table-footer">
      <div className="dash-table-footer__actions">
        <button
          type="button"
          className="dash-btn dash-btn--pill"
          onClick={onTrashSelected}
          disabled={isTrashDisabled || !onTrashSelected}
        >
          {trashLabel}
        </button>
        {showFilterSelected ? (
          <button type="button" className="dash-btn dash-btn--pill">
            Filter selected
          </button>
        ) : null}
      </div>

      <div className="dash-table-footer__pagination">
        <div className="dash-table-footer__rows">
          <span>Rows per page</span>
          <select
            className="dash-table-footer__select"
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(event.target.value)}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <span>
          {total > 0
            ? `${rangeStart} - ${rangeEnd} of ${total}`
            : "0 of 0"}
        </span>

        <div className="dash-table-footer__nav">
          <button
            type="button"
            className="dash-table-footer__nav-btn"
            onClick={onFirst}
            disabled={!canGoFirst}
            aria-label="First page"
          >
            |&lt;
          </button>
          <button
            type="button"
            className="dash-table-footer__nav-btn"
            onClick={onPrev}
            disabled={!canGoPrev}
            aria-label="Previous page"
          >
            &lt;
          </button>
          <button
            type="button"
            className="dash-table-footer__nav-btn"
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Next page"
          >
            &gt;
          </button>
          <button
            type="button"
            className="dash-table-footer__nav-btn"
            onClick={onLast}
            disabled={!canGoLast}
            aria-label="Last page"
          >
            &gt;|
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableFooter;
