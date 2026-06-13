/* Страница контактов/опций поддержки в разделе профиля. */
import ProfileChatPanel from "../../components/Profile/ProfileChatPanel/ProfileChatPanel";
import "../../styles/profile-page.scss";

/**
 * Страница вариантов связи с поддержкой в разделе профиля.
 */
const ProfileSupport = () => (
  <section className="profile-page profile-chat profile-support">
    <h1 className="profile-page__title">Support</h1>
    <ProfileChatPanel threads={[]} compactThreads />
  </section>
);
export default ProfileSupport;
