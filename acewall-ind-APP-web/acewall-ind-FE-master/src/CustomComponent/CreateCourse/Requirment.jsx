import React, { useState, useId } from "react";
import { AlertCircle, Trash2 } from "lucide-react";

const RequirementInput = React.memo(
  ({ field, index, remove, error, register, requirementsFields }) => {
    // State to track the input value length
    const [inputValue, setInputValue] = useState(field.value || "");

    // Generate unique IDs for accessibility
    const inputId = useId();
    const errorId = useId();
    const charCountId = useId();
    const fieldNumber = String(index + 1).padStart(2, "0");
    const isOnlyField = requirementsFields.length === 1;
    const remainingChars = 120 - inputValue.length;
    const isNearLimit = remainingChars <= 20;

    // Handle change to update input value length
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    // Handle remove with disabled state check
    const handleRemove = () => {
      if (isOnlyField) {
        return;
      }
      remove(index);
    };

    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
        {/* Field number and label */}
        <div className="flex items-baseline mb-3">
          <span
            className="text-sm font-bold text-gray-600 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
            aria-label={`Requirement ${fieldNumber}`}
          >
            {fieldNumber}
          </span>
          <label
            htmlFor={inputId}
            className="ml-3 text-sm font-medium text-gray-700"
          >
            Requirement{" "}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
        </div>

        {/* Input and remove button container */}
        <div className="flex gap-2 w-full">
          <div className="flex-1 relative">
            <input
              id={inputId}
              {...register(`requirements.${index}.value`)}
              placeholder="What is your course requirement..."
              maxLength={120}
              value={inputValue}
              onChange={handleInputChange}
              aria-describedby={`${charCountId} ${error ? errorId : ""}`}
              aria-label={`Requirement ${fieldNumber} content`}
              aria-invalid={!!error}
              className={`w-full px-3 py-2 bg-gray-50 border-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400"
              } ${isNearLimit ? "border-yellow-500" : ""}`}
            />
            {/* Character count indicator inside input */}
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                remainingChars <= 10
                  ? "text-red-500"
                  : isNearLimit
                  ? "text-yellow-600"
                  : "text-gray-400"
              }`}
              aria-hidden="true"
            >
              {remainingChars}
            </span>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isOnlyField}
            aria-label={`Remove requirement ${fieldNumber}`}
            aria-disabled={isOnlyField}
            className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 ${
              isOnlyField
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
            }`}
            title={
              isOnlyField
                ? "Cannot remove the last requirement"
                : "Remove this requirement"
            }
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Remove</span>
          </button>
        </div>

        {/* Character count description */}
        <div
          id={charCountId}
          className="text-xs mt-2 text-gray-600 font-medium"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={isNearLimit ? "text-yellow-600" : ""}>
            {remainingChars} of 120 characters remaining
          </span>
          {remainingChars <= 10 && (
            <span className="block text-red-600 mt-1">
              Character limit almost reached
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            id={errorId}
            className="mt-2 flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200"
            role="alert"
          >
            <AlertCircle
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-xs text-red-600 font-medium">{error.message}</p>
          </div>
        )}
      </div>
    );
  }
);

RequirementInput.displayName = "RequirementInput";

export default RequirementInput;
