/* Модальная обёртка для потоков добавления/редактирования карты в профиле. */
import { cloneElement, isValidElement } from "react";
import Modal, { useModalClose } from "../../Modal/Modal";
import "./ProfileCardModal.scss";

/**
 * Внедряет обработчик закрытия модального окна в единственный допустимый дочерний элемент.
 */
const ProfileCardModalContent = ({ children }) => {
  const close = useModalClose();
  if (!isValidElement(children)) {
    return children;
  }
  return cloneElement(children, { onClose: close });
};

/**
 * Модальная обёртка для потоков добавления или редактирования карты в разделе профиля.
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
