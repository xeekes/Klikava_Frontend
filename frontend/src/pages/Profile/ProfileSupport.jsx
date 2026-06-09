import ProfileChatPanel from "../../components/Profile/ProfileChatPanel/ProfileChatPanel";
import "../../styles/profile-page.scss";

const ProfileSupport = () => (
  <section className="profile-page profile-chat profile-support">
    <h1 className="profile-page__title">Support</h1>
    <ProfileChatPanel threads={[]} compactThreads />
  </section>
);

export default ProfileSupport;
