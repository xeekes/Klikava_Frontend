import "./PanelState.scss";

export const PanelLoading = ({ label = "Loading..." }) => (
  <p className="panel-state panel-state--loading">{label}</p>
);

export const PanelError = ({ message }) =>
  message ? <p className="panel-state panel-state--error">{message}</p> : null;

export const PanelSuccess = ({ message }) =>
  message ? <p className="panel-state panel-state--success">{message}</p> : null;
