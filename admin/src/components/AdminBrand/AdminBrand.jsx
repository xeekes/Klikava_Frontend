import logoIcon from "../../assets/icons/logo.svg";
import IconMask from "../IconMask/IconMask";
import "./AdminBrand.scss";

const AdminBrand = () => {
  return (
    <div className="admin-brand">
      <IconMask src={logoIcon} className="admin-brand__icon" aria-hidden="true" />
      <span className="admin-brand__text">
        KLIK<span>AVA</span>
      </span>
    </div>
  );
};

export default AdminBrand;
