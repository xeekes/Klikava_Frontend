import { useCallback, useState } from "react";
import { hasValidationErrors, validateForm } from "../utils/validation";

export const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, []);

  const touch = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validateAll = useCallback(
    (values) => {
      const nextErrors = validateForm(values, schema);
      setErrors(nextErrors);
      setSubmitted(true);
      return !hasValidationErrors(nextErrors);
    },
    [schema]
  );

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
    [schema]
  );

  const getError = useCallback(
    (field) => {
      if (!submitted && !touched[field]) {
        return undefined;
      }
      return errors[field];
    },
    [errors, submitted, touched]
  );

  const handleBlur = useCallback(
    (values, field) => {
      touch(field);
      validateFields(values, [field]);
    },
    [touch, validateFields]
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
