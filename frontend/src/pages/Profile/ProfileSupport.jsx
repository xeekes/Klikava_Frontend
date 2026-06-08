import {
  PROFILE_CHAT_THREADS,
  PROFILE_SUPPORT_CHAT_DATE,
} from "../../data/profile";
import ProfileChatPanel from "../../components/Profile/ProfileChatPanel/ProfileChatPanel";
import "../../styles/profile-page.scss";

const SUPPORT_THREADS = PROFILE_CHAT_THREADS.filter((thread) => thread.id === "support");

const ProfileSupport = () => (
  <section className="profile-page profile-chat profile-support">
    <h1 className="profile-page__title">Support</h1>
    <ProfileChatPanel
      threads={SUPPORT_THREADS}
      defaultThreadId="support"
      dateSeparator={PROFILE_SUPPORT_CHAT_DATE}
      compactThreads
    />
  </section>
);

export default ProfileSupport;
