/* Modal wrapper for flows of adding/editing a map in a profile. */
import { cloneElement, isValidElement } from "react";
import Modal, { useModalClose } from "../../Modal/Modal";
import "./ProfileCardModal.scss";

/**
 * Injects a modal window close handler into the only valid child element.
 */
const ProfileCardModalContent = ({ children }) => {
  const close = useModalClose();
  if (!isValidElement(children)) {
    return children;
  }
  return cloneElement(children, { onClose: close });
};

/**
 * Modal wrapper for flows of adding or editing a map in the profile section.
 */
const ProfileCardModal = ({ title, children, onClose }) => (
  <Modal
    ariaLabel={title}
    onClose={onClose}
    panelClassName="profile-card-modal__panel"
  >
    <div className="profile-card-modal">
      <ProfileCardModalContent>{children}</ProfileCardModalContent>
    </div>
  </Modal>
);
export default ProfileCardModal;
