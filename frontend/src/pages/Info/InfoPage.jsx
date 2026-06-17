/* Reusable layout for static information/marketing pages. */
import { Link } from "react-router-dom";
import "./InfoPage.scss";

/**
 * A common layout wrapper for static marketing and informational content.
 * @param {{ eyebrow?: string, title: string, children: import("react").ReactNode, actions?: Array<{ to: string, label: string }> }} props
 */
const InfoPage = ({ eyebrow, title, children, actions = [] }) => {
  return (
    <section className="info-page">
      <div className="container">
        {eyebrow ? <p className="info-page__eyebrow">{eyebrow}</p> : null}
        <h1 className="info-page__title">{title}</h1>
        <div className="info-page__content">{children}</div>
        {actions.length ? (
          <div className="info-page__actions">
            {actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="info-page__action"
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default InfoPage;
