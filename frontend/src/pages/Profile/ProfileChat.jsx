import ProfileChatPanel from "../../components/Profile/ProfileChatPanel/ProfileChatPanel";
import "../../styles/profile-page.scss";

const ProfileChat = () => (
  <section className="profile-page profile-chat">
    <h1 className="profile-page__title">Chat</h1>
    <ProfileChatPanel threads={[]} />
  </section>
);

export default ProfileChat;
