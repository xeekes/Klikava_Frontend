import saleIcon from "../assets/icons/sale.svg";

const Sale = ({ className = "", alt = "", ...props }) => (
  <img src={saleIcon} alt={alt} className={className} {...props} />
);

export default Sale;
