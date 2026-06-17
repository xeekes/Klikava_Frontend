/*
 * A lightweight form validation hook based on schemas from utils/validation.
 * Errors are shown when blurring or after sending (not every keypress).
 */
import { useCallback, useState } from "react";
import { hasValidationErrors, validateForm } from "../utils/validation";

/**
 * Monitors field validation status across the schema map.
 * @param {object} schema
 * @returns {object}
 */
export const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /** Resets errors, touched flags and submitted flag. */
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, []);

  /**
   * Marks one field as touched for error condition.
   * @param {string} field
   */
  const touch = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /**
   * Validates all schema fields and marks the form as submitted.
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
   * Validates only the specified fields and merges the result with existing errors.
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
   * Returns a field error only after blur or submit.
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
   * Marks the touched field and re-validates it when blurred.
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
