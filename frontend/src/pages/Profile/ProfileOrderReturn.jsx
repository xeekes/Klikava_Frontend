import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "../../iconComponents";
import ProfileOrderProductForm from "../../components/Profile/ProfileOrderProductForm/ProfileOrderProductForm";
import { useUserData } from "../../context/UserDataContext";
import { getOrderByIdFromList, getOrderProducts } from "../../utils/orderHelpers";
import { rules } from "../../utils/validation";
import "../../styles/profile-page.scss";
import "./ProfileOrderFormPage.scss";

const createInitialReturns = (products) =>
  products.map(() => ({
    reason: "",
  }));

const ProfileOrderReturn = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders } = useUserData();
  const order = getOrderByIdFromList(orders, orderId);
  const products = getOrderProducts(order);
  const [returns, setReturns] = useState(() => createInitialReturns(products));
  const [returnErrors, setReturnErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateReturn = (index, value) => {
    setReturns((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, reason: value } : item
      )
    );

    if (returnErrors[index]) {
      setReturnErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  if (!order) {
    return (
      <section className="profile-page">
        <Link to="/profile/orders" className="profile-page__back">
          <ArrowLeft className="profile-page__back-icon" aria-hidden="true" />
          Return/Refund
        </Link>
        <p>Order not found</p>
      </section>
    );
  }

  return (
    <section className="profile-page profile-order-form-page">
      <Link to="/profile/orders" className="profile-page__back">
        <ArrowLeft className="profile-page__back-icon" aria-hidden="true" />
        Return/Refund
      </Link>

      {submitted ? (
        <p className="profile-order-form-page__success">
          Return request submitted. Support will contact you soon.
        </p>
      ) : null}

      <div className="profile-order-form-page__list">
        {products.map((product, index) => (
          <ProfileOrderProductForm
            key={product.id}
            product={product}
            textLabel="Reason for return"
            textValue={returns[index]?.reason ?? ""}
            onTextChange={(value) => updateReturn(index, value)}
            textError={returnErrors[index]}
            submitLabel="Return/Refund"
            onSubmit={() => {
              const reasonError = rules.returnReason()(returns[index]?.reason ?? "");
              if (reasonError) {
                setReturnErrors((prev) => ({ ...prev, [index]: reasonError }));
                return;
              }

              setSubmitted(true);
              window.setTimeout(() => navigate("/profile/orders?tab=return"), 1200);
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default ProfileOrderReturn;
