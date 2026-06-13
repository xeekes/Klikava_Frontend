/**
 * Заливная звезда для рейтинга товаров в карточках, каталоге и профиле.
 * @param {object} props
 */
const Star = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2.5L14.9 8.5L21.5 9.5L16.8 14.1L17.9 20.7L12 17.6L6.1 20.7L7.2 14.1L2.5 9.5L9.1 8.5L12 2.5Z"
      fill="currentColor"
    />
  </svg>
);
export default Star;
