import saleIcon from "../assets/icons/sale.svg";

/**
 * Promotion/discount icon for the promotional header in the hero section.
 * @param {object} props
 */
const Sale = ({ className = "", alt = "", ...props }) => (
  <img src={saleIcon} alt={alt} className={className} {...props} />
);
export default Sale;
