import { useMemo, useState } from "react";
import { useUserData } from "../../../context/UserDataContext";
import "./ProfileChatPanel.scss";

const ProfileChatPanel = ({
  threads,
  defaultThreadId,
  dateSeparator = null,
  compactThreads = false,
}) => {
  const { chatMessages, sendChatMessage } = useUserData();
  const initialThreadId = defaultThreadId ?? threads[0]?.id;
  const [activeThreadId, setActiveThreadId] = useState(initialThreadId);
  const [message, setMessage] = useState("");

  const activeThread =
    threads.find((thread) => thread.id === activeThreadId) || threads[0];

  const visibleMessages = useMemo(
    () => chatMessages.filter((item) => item.id.startsWith("m-")),
    [chatMessages]
  );

  if (!activeThread) {
    return <p className="profile-page__empty">No conversations yet.</p>;
  }

  return (
    <div className="profile-chat__panel">
      <div className="profile-chat__threads">
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className={[
              "profile-chat__thread",
              compactThreads ? "profile-chat__thread--compact" : "",
              thread.id === activeThreadId ? "profile-chat__thread--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveThreadId(thread.id)}
          >
            <img className="profile-chat__thread-avatar" src={thread.logo} alt="" />
            <div className="profile-chat__thread-body">
              <div className="profile-chat__thread-top">
                <p>
                  <span>{thread.name}</span>
                </p>
                {!compactThreads && thread.time ? (
                  <p>
                    <span>{thread.time}</span>
                  </p>
                ) : null}
              </div>
              {!compactThreads && thread.preview ? (
                <p>
                  <span>{thread.preview}</span>
                </p>
              ) : null}
              {!compactThreads && thread.date ? (
                <p>
                  <span>{thread.date}</span>
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      <div className="profile-chat__conversation">
        <div className="profile-chat__conversation-header">
          <img
            className="profile-chat__conversation-avatar"
            src={activeThread.logo}
            alt=""
          />
          <div className="profile-chat__conversation-meta">
            <p>
              <span>{activeThread.name}</span>
            </p>
            <p>
              <span>{activeThread.subtitle}</span>
            </p>
          </div>
        </div>

        <div className="profile-chat__messages">
          {dateSeparator ? (
            <div className="profile-chat__date-separator">
              <p>
                <span>{dateSeparator}</span>
              </p>
            </div>
          ) : null}

          {visibleMessages.map((item) => (
            <div
              key={item.id}
              className={`profile-chat__message ${
                item.incoming
                  ? "profile-chat__message--incoming"
                  : "profile-chat__message--outgoing"
              }`.trim()}
            >
              {item.incoming ? (
                <div className="profile-chat__bubble">
                  <p>
                    <span>{item.sender}</span>
                  </p>
                  <p>
                    <span>{item.text}</span>
                  </p>
                  <p>
                    <span>{item.time}</span>
                  </p>
                </div>
              ) : (
                <div className="profile-chat__outgoing-wrap">
                  <p>
                    <span>{item.text}</span>
                  </p>
                  <p>
                    <span>{item.time}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          className="profile-chat__composer"
          onSubmit={(event) => {
            event.preventDefault();
            sendChatMessage(message);
            setMessage("");
          }}
        >
          <button type="button" className="profile-chat__attach" aria-label="Attach file">
            <svg
              className="profile-chat__attach-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <input
            type="text"
            className="profile-chat__input"
            placeholder="Enter your message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button type="submit" className="profile-chat__send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileChatPanel;
