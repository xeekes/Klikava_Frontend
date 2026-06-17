/**
 * Heart outline for favorites and wishlist on product cards.
 * @param {object} props
 */
const Heart = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 20.5C11.7 20.5 11.4 20.4 11.2 20.2L4.8 14.3C2.4 12.1 2.1 8.4 4.1 5.9C6.1 3.4 9.7 3 12.2 5L12.7 5.4L13.2 5C15.7 3 19.3 3.4 21.3 5.9C23.3 8.4 23 12.1 20.6 14.3L13.9 20.2C13.5 20.4 13.2 20.5 12.9 20.5H12Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default Heart;
