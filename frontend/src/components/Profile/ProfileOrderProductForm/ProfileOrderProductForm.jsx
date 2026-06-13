/* Поля формы отзыва/возврата, привязанные к конкретному товару заказа. */
import { useRef } from "react";
import { Star } from "../../../iconComponents";
import "./ProfileOrderProductForm.scss";
const MAX_PHOTOS = 4;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Читает файл изображения как data URL после проверки MIME-типа.
 */
const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error("Unsupported file type"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

/**
 * Поля формы отзыва или возврата, привязанные к конкретному товару заказа.
 */
const ProfileOrderProductForm = ({
  product,
  textLabel,
  textValue,
  onTextChange,
  submitLabel,
  onSubmit,
  showRating = false,
  rating = 0,
  onRatingChange,
  textError,
  ratingError,
  photos = [],
  onPhotosChange,
  photoError,
  maxPhotos = MAX_PHOTOS,
}) => {
  const fileInputRef = useRef(null);
  const canUploadPhotos = typeof onPhotosChange === "function";
  const remainingSlots = Math.max(0, maxPhotos - photos.length);
  /**
   * Открывает скрытое поле выбора файла для загрузки фото.
   */
  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };
  /**
   * Читает выбранные файлы изображений и добавляет data URL до лимита фото.
   */
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !canUploadPhotos) {
      return;
    }
    const filesToAdd = files.slice(0, remainingSlots);
    try {
      const urls = await Promise.all(filesToAdd.map(readImageFile));
      onPhotosChange([...photos, ...urls]);
    } catch {
      // пока игнорируем некорректные файлы
    }
  };
  /**
   * Удаляет одно загруженное превью фото по индексу в списке.
   */
  const handleRemovePhoto = (index) => {
    if (!canUploadPhotos) {
      return;
    }
    onPhotosChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };
  return (
    <article className="profile-order-product-form">
      <div className="profile-order-product-form__image-wrap">
        <img
          className="profile-order-product-form__image"
          src={product.image}
          alt={product.title}
        />
      </div>
      <div className="profile-order-product-form__main">
        <div className="profile-order-product-form__field-box">
          <p className="profile-order-product-form__field-label">{textLabel}</p>
          <textarea
            className={`profile-order-product-form__textarea ${
              textError ? "profile-order-product-form__textarea--invalid" : ""
            }`.trim()}
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            aria-invalid={Boolean(textError)}
          />
          {textError ? (
            <p className="profile-order-product-form__error" role="alert">
              {textError}
            </p>
          ) : null}
        </div>
      </div>
      <div className="profile-order-product-form__side">
        {canUploadPhotos ? (
          <div className="profile-order-product-form__field-box profile-order-product-form__field-box--compact">
            <p className="profile-order-product-form__field-label">
              Your photos
            </p>
            <div className="profile-order-product-form__upload-row">
              <button
                type="button"
                className="profile-order-product-form__add-btn"
                onClick={handleAddPhotosClick}
                disabled={remainingSlots === 0}
              >
                Add
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="profile-order-product-form__file-input"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                multiple
                onChange={handleFileChange}
                tabIndex={-1}
                aria-hidden
              />
              <div className="profile-order-product-form__upload-gallery">
                {photos.length ? (
                  photos.map((photo, index) => (
                    <div
                      key={`${photo.slice(0, 24)}-${index}`}
                      className="profile-order-product-form__upload-thumb-wrap"
                    >
                      <img
                        className="profile-order-product-form__upload-thumb"
                        src={photo}
                        alt=""
                      />
                      <button
                        type="button"
                        className="profile-order-product-form__upload-remove"
                        onClick={() => handleRemovePhoto(index)}
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="profile-order-product-form__upload-placeholder">
                    <span>Add up to {maxPhotos} photos</span>
                  </div>
                )}
              </div>
            </div>
            {photoError ? (
              <p className="profile-order-product-form__error" role="alert">
                {photoError}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="profile-order-product-form__field-box profile-order-product-form__field-box--compact">
            <p className="profile-order-product-form__field-label">
              Product Image
            </p>
            <div className="profile-order-product-form__upload-row">
              <button
                type="button"
                className="profile-order-product-form__add-btn"
              >
                Add
              </button>
              <div className="profile-order-product-form__upload-placeholder" />
            </div>
          </div>
        )}
        {showRating ? (
          <div className="profile-order-product-form__rating-row">
            <p className="profile-order-product-form__rating-label">Rating</p>
            <div
              className="profile-order-product-form__stars"
              role="group"
              aria-label="Rating"
            >
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <button
                  key={starIndex}
                  type="button"
                  className="profile-order-product-form__star-btn"
                  onClick={() => onRatingChange(starIndex + 1)}
                  aria-label={`Rate ${starIndex + 1} out of 5`}
                  aria-pressed={rating > 0 && starIndex < rating}
                >
                  <Star
                    className={`profile-order-product-form__star ${
                      rating > 0 && starIndex < rating
                        ? "profile-order-product-form__star--filled"
                        : "profile-order-product-form__star--empty"
                    }`.trim()}
                  />
                </button>
              ))}
            </div>
            {ratingError ? (
              <p className="profile-order-product-form__error" role="alert">
                {ratingError}
              </p>
            ) : null}
            <button
              type="button"
              className="profile-order-product-form__submit"
              onClick={onSubmit}
            >
              {submitLabel}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="profile-order-product-form__submit"
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProfileOrderProductForm;
