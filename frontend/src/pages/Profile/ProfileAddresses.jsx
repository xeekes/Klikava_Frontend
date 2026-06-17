/* CRUD delivery addresses (API or local mock). */
import { Navigate, useMatch, useNavigate } from "react-router-dom";
import ProfileAddressFormFields from "../../components/Profile/ProfileAddressFormFields/ProfileAddressFormFields";
import { useActionFeedback } from "../../context/ActionFeedbackContext";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileAddresses.scss";

const DELETE_ADDRESS_CONFIRM = {
  title: "Delete address?",
  message: "This delivery address will be removed permanently.",
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
};

/**
 * List of delivery addresses with creation, editing, deleting and copying.
 */
const ProfileAddresses = () => {
  const navigate = useNavigate();
  const { confirm, showSuccess, showError } = useActionFeedback();
  const addMatch = useMatch("/profile/addresses/new");
  const editMatch = useMatch("/profile/addresses/:addressId/edit");
  const { addresses, deleteAddress, addAddress, updateAddress } = useUserData();
  const editingAddress = editMatch?.params.addressId
    ? addresses.find((item) => item.id === editMatch.params.addressId)
    : null;
  const isFormView = Boolean(addMatch || editMatch);

  /**
   * Deletes the address after confirmation.
   * @param {string} addressId
   */
  const handleDeleteAddress = async (addressId) => {
    if (!(await confirm(DELETE_ADDRESS_CONFIRM))) {
      return;
    }
    try {
      await deleteAddress(addressId);
      showSuccess("Delivery address deleted.");
    } catch (error) {
      showError(error.message || "Failed to delete address.");
    }
  };

  /**
   * Copies formatted address strings to the clipboard.
   * @param {object} address
   */
  const handleCopy = async (address) => {
    const text = `${address.fullName}\n${address.phone}\n${address.lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      showSuccess("Address copied to clipboard.");
    } catch {
      showError("Could not copy address. Try again.");
    }
  };

  if (editMatch && !editingAddress) {
    return <Navigate to="/profile/addresses" replace />;
  }
  return (
    <section
      className={`profile-page profile-addresses ${
        isFormView ? "" : "profile-page--footer-action"
      } ${addMatch ? "profile-addresses--create" : ""} ${
        editMatch ? "profile-addresses--edit" : ""
      }`.trim()}
    >
      <h1 className="profile-page__title">Delivery addresses</h1>
      {isFormView ? (
        <div className="profile-addresses__form-panel">
          {addMatch ? (
            <ProfileAddressFormFields
              mode="create"
              submitLabel="Create delivery address"
              onSubmit={async (form) => {
                try {
                  await addAddress(form);
                  showSuccess("Delivery address created.");
                  navigate("/profile/addresses");
                } catch (error) {
                  showError(error.message || "Failed to create address.");
                }
              }}
            />
          ) : null}
          {editMatch && editingAddress ? (
            <ProfileAddressFormFields
              mode="edit"
              addressId={editingAddress.id}
              submitLabel="Save"
              onSubmit={async (form) => {
                try {
                  await updateAddress(editingAddress.id, form);
                  showSuccess("Delivery address updated.");
                  navigate("/profile/addresses");
                } catch (error) {
                  showError(error.message || "Failed to update address.");
                }
              }}
              onDelete={async () => {
                if (!(await confirm(DELETE_ADDRESS_CONFIRM))) {
                  return;
                }
                try {
                  await deleteAddress(editingAddress.id);
                  showSuccess("Delivery address deleted.");
                  navigate("/profile/addresses");
                } catch (error) {
                  showError(error.message || "Failed to delete address.");
                }
              }}
            />
          ) : null}
        </div>
      ) : (
        <div className="profile-page__panel">
          <div className="profile-page__body">
            {addresses.length === 0 ? (
              <p className="profile-page__empty">No delivery addresses yet.</p>
            ) : (
              <div className="profile-addresses__grid">
                {addresses.map((address) => (
                  <article key={address.id} className="profile-addresses__card">
                    <div className="profile-addresses__top">
                      <div className="profile-addresses__field">
                        <p>
                          <span>{address.fullName}</span>
                        </p>
                      </div>
                      <div className="profile-addresses__field">
                        <p>
                          <span>{address.phone}</span>
                        </p>
                      </div>
                    </div>
                    <div className="profile-addresses__body">
                      {address.lines.map((line) => (
                        <p key={line}>
                          <span>{line}</span>
                        </p>
                      ))}
                    </div>
                    <div className="profile-addresses__actions">
                      <button
                        type="button"
                        className="profile-addresses__btn"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="profile-addresses__btn"
                        onClick={() => handleCopy(address)}
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        className="profile-addresses__btn"
                        onClick={() =>
                          navigate(`/profile/addresses/${address.id}/edit`)
                        }
                      >
                        Edit
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="profile-addresses__add profile-page__footer-action"
            onClick={() => navigate("/profile/addresses/new")}
          >
            Add a new address
          </button>
        </div>
      )}
    </section>
  );
};

export default ProfileAddresses;
