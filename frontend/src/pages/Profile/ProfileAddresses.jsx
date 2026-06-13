/* CRUD адресов доставки (API или локальный mock). */
import { Navigate, useMatch, useNavigate } from "react-router-dom";
import ProfileAddressFormFields from "../../components/Profile/ProfileAddressFormFields/ProfileAddressFormFields";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileAddresses.scss";

/**
 * Список адресов доставки с созданием, редактированием, удалением и копированием.
 */
const ProfileAddresses = () => {
  const navigate = useNavigate();
  const addMatch = useMatch("/profile/addresses/new");
  const editMatch = useMatch("/profile/addresses/:addressId/edit");
  const { addresses, deleteAddress, addAddress, updateAddress } = useUserData();
  const editingAddress = editMatch?.params.addressId
    ? addresses.find((item) => item.id === editMatch.params.addressId)
    : null;
  const isFormView = Boolean(addMatch || editMatch);

  /**
   * Копирует отформатированные строки адреса в буфер обмена, если API доступен.
   * @param {object} address
   */
  const handleCopy = async (address) => {
    const text = `${address.fullName}\n${address.phone}\n${address.lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* Clipboard API может быть недоступен в некоторых браузерах. */
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
                await addAddress(form);
                navigate("/profile/addresses");
              }}
            />
          ) : null}
          {editMatch && editingAddress ? (
            <ProfileAddressFormFields
              mode="edit"
              addressId={editingAddress.id}
              submitLabel="Save"
              onSubmit={async (form) => {
                await updateAddress(editingAddress.id, form);
                navigate("/profile/addresses");
              }}
              onDelete={async () => {
                await deleteAddress(editingAddress.id);
                navigate("/profile/addresses");
              }}
            />
          ) : null}
        </div>
      ) : (
        <>
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
                        onClick={() => {
                          deleteAddress(address.id);
                        }}
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
        </>
      )}
    </section>
  );
};

export default ProfileAddresses;
