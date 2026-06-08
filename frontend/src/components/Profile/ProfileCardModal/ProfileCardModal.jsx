import { cloneElement, isValidElement } from "react";
import Modal, { useModalClose } from "../../Modal/Modal";
import "./ProfileCardModal.scss";

const ProfileCardModalContent = ({ children }) => {
  const close = useModalClose();

  if (!isValidElement(children)) {
    return children;
  }

  return cloneElement(children, { onClose: close });
};

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
