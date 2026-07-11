import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

export function CustomDatePicker({ selectedDate, onChange }) {
  return (
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={onChange}
          dateFormat="MM/dd/yyyy"
          className="w-full h-10 px-4 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md transition-all bg-white"
          placeholderText="Select a date"
          popperClassName="react-datepicker-popper"
          calendarClassName="react-datepicker-calendar"
        />
        <Calendar
          className="absolute right-4  top-1/2 transform -translate-y-1/2 text-gray-700 pointer-events-none"
          size={20}
        />
      </div>
      <style>
        {`
          .react-datepicker {
            font-size: 0.9rem !important;
            padding:  !important;
            border-radius: 10px !important;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1) !important;
            width: 350px !important
            ;
          }
          .react-datepicker__header {
            background-color: white !important;
            border-bottom: none !important;
            padding: 0.8rem !important;
          }
          .react-datepicker__current-month,
          .react-datepicker__day-name {
            color: black !important;
            font-weight: 500 !important;
            text-transform: uppercase;
          }
          .react-datepicker__month-container {
            width: 100% !important;
          }
          .react-datepicker__month {
            display: grid !important;
            grid-template-columns: repeat(7, 1fr) !important;
            gap: 0.5rem !important;
          }
          .react-datepicker__day {
            margin: 0 !important;
            width: 2.2rem !important;
            height: 2.2rem !important;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50% !important;
            font-weight: 500 !important;
            color: #333 !important;
          }
          .react-datepicker__day--selected,
          .react-datepicker__day--keyboard-selected {
            background-color: green !important;
            color: white !important;
            border-radius: 50%;
          }
          .react-datepicker__day:hover {
            background-color: lightgreen !important;
            color: black !important;
            border-radius: 50%;
          }
          .react-datepicker__day--outside-month {
            color: #d1d5db !important;
          }
        `}
      </style>
    </div>
  );
}