import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormContext, useController } from "react-hook-form";
import { format } from "date-fns";

export default function StrictDatePicker({ name, minDate, maxDate }) {
  const { control, setValue } = useFormContext();

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: {
      date: "",
      time: "",
      dateTime: null,
    },
    rules: {
      required: "Due date is required",
      validate: (val) =>
        val?.dateTime ? true : "Due date and time must be selected",
    },
  });

  const handleDateChange = (selectedDate) => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, "mm-dd-yyyy");
    const formattedTime = format(selectedDate, "HH:mm");

    // update nested keys
    setValue(`${name}.date`, formattedDate);
    setValue(`${name}.time`, formattedTime);
    setValue(`${name}.dateTime`, selectedDate.toISOString());

    // notify form about the change
    onChange({
      date: formattedDate,
      time: formattedTime,
      dateTime: selectedDate.toISOString(),
    });
  };

  return (
    <div className="space-y-1">
      <DatePicker
        selected={value?.dateTime ? new Date(value.dateTime) : null}
        onChange={handleDateChange}
        showTimeSelect
        dateFormat="Pp"
        placeholderText="Select due date and time"
        minDate={minDate}
        maxDate={maxDate}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
      />
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
