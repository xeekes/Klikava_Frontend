/* Support chat UI; messages are saved locally for each user. */
import ProfileChatPanel from "../../components/Profile/ProfileChatPanel/ProfileChatPanel";
import "../../styles/profile-page.scss";

/**
 * Support chat UI with locally saved messages for each user.
 */
const ProfileChat = () => (
  <section className="profile-page profile-chat">
    <h1 className="profile-page__title">Chat</h1>
    <ProfileChatPanel threads={[]} />
  </section>
);
export default ProfileChat;
