import { useState } from "react";
import { Star } from "../../iconComponents";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileFeedback.scss";

const ProfileFeedback = () => {
  const { feedback, updateFeedback, deleteFeedback } = useUserData();
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState("");

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraftText(item.text);
  };

  return (
    <section className="profile-page profile-feedback">
      <h1 className="profile-page__title">Your feedback</h1>

      {feedback.length === 0 ? (
        <p className="profile-page__empty">No feedback yet.</p>
      ) : (
      <div className="profile-feedback__grid">
        {feedback.map((item) => (
          <article key={item.id} className="profile-feedback__card">
            <div className="profile-feedback__media">
              <img className="profile-feedback__image" src={item.image} alt="" />
              <div className="profile-feedback__attached">
                <p>
                  <span>Your attached photos</span>
                </p>
                <div className="profile-feedback__thumbs">
                  {item.photos.map((photo, index) => (
                    <img key={index} src={photo} alt="" />
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-feedback__content">
              <p className="profile-feedback__title">
                <span>{item.productTitle}</span>
              </p>
              {editingId === item.id ? (
                <textarea
                  className="profile-feedback__edit-area"
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  rows={4}
                />
              ) : (
                <p className="profile-feedback__text">
                  <span>{item.text}</span>
                </p>
              )}

              <div className="profile-feedback__footer">
                <div className="profile-feedback__rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`profile-feedback__star ${
                        index < item.rating ? "profile-feedback__star--filled" : ""
                      }`.trim()}
                    />
                  ))}
                </div>

                <div className="profile-feedback__actions">
                  {editingId === item.id ? (
                    <button
                      type="button"
                      className="profile-feedback__btn"
                      onClick={() => {
                        updateFeedback(item.id, { text: draftText });
                        setEditingId(null);
                      }}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="profile-feedback__btn"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    className="profile-feedback__btn"
                    onClick={() => deleteFeedback(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      )}
    </section>
  );
};

export default ProfileFeedback;
