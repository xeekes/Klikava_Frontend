/*
 * Лёгкий хук валидации форм на основе схем из utils/validation.
 * Ошибки показываются при blur или после отправки (не при каждом нажатии клавиши).
 */
import { useCallback, useState } from "react";
import { hasValidationErrors, validateForm } from "../utils/validation";

/**
 * Отслеживает состояние валидации полей по карте схемы.
 * @param {object} schema
 * @returns {object}
 */
export const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /** Сбрасывает ошибки, флаги touched и флаг submitted. */
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, []);

  /**
   * Помечает одно поле как touched для условия показа ошибок.
   * @param {string} field
   */
  const touch = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /**
   * Валидирует все поля схемы и помечает форму как отправленную.
   * @param {object} values
   * @returns {boolean}
   */
  const validateAll = useCallback(
    (values) => {
      const nextErrors = validateForm(values, schema);
      setErrors(nextErrors);
      setSubmitted(true);
      return !hasValidationErrors(nextErrors);
    },
    [schema],
  );

  /**
   * Валидирует только указанные поля и объединяет результат с существующими ошибками.
   * @param {object} values
   * @param {string[]} fields
   * @returns {boolean}
   */
  const validateFields = useCallback(
    (values, fields) => {
      const partialSchema = fields.reduce((acc, field) => {
        if (schema[field]) {
          acc[field] = schema[field];
        }
        return acc;
      }, {});
      const nextErrors = validateForm(values, partialSchema);
      setErrors((prev) => {
        const merged = { ...prev };
        fields.forEach((field) => {
          if (nextErrors[field]) {
            merged[field] = nextErrors[field];
          } else {
            delete merged[field];
          }
        });
        return merged;
      });
      return !hasValidationErrors(nextErrors);
    },
    [schema],
  );

  /**
   * Возвращает ошибку поля только после blur или отправки.
   * @param {string} field
   * @returns {string|undefined}
   */
  const getError = useCallback(
    (field) => {
      if (!submitted && !touched[field]) {
        return undefined;
      }
      return errors[field];
    },
    [errors, submitted, touched],
  );

  /**
   * Помечает поле touched и перевалидирует его при blur.
   * @param {object} values
   * @param {string} field
   */
  const handleBlur = useCallback(
    (values, field) => {
      touch(field);
      validateFields(values, [field]);
    },
    [touch, validateFields],
  );

  return {
    errors,
    touched,
    submitted,
    getError,
    touch,
    validateAll,
    validateFields,
    resetValidation,
    setErrors,
  };
};
