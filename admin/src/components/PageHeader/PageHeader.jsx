import "./PageHeader.scss";

const PageHeader = ({ title, subtitle, actions = null }) => {
  return (
    <div className="page-header">
      <div className="page-header__copy">
        <h2 className="page-header__title">{title}</h2>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
