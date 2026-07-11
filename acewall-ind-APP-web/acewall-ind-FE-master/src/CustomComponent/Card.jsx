import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import avatar from "../assets/avatar.png";

// Helper function to handle key press for clicks
const handleKeyPress = (e, callback) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault(); // Prevent default scroll for space key
    callback();
  }
};

// 1. DeshboardAnnouncementCard
function DeshboardAnnouncementCard({ mainHeading, data, link, height }) {
  return (
    <Card
      className={`bg-gray-100 border-0 my-auto py-0 gap-2 rounded h-full`}
      style={{ height: height || "100%" }}
      role="region"
      aria-labelledby={`heading-${mainHeading
        .toLowerCase()
        .replace(/\s/g, "-")}`}
    >
      <CardHeader className="flex-row justify-between items-center bg-slate-500 py-3 rounded">
        {/* Use H2 as the main heading for this dashboard card */}
        <h2
          className="text-lg text-white"
          id={`heading-${mainHeading.toLowerCase().replace(/\s/g, "-")}`}
        >
          {mainHeading}
        </h2>
        <Link
          to={link}
          className="text-white text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded"
          aria-label={`View All ${mainHeading}`}
        >
          View All
        </Link>
      </CardHeader>

      <CardContent
        className="p-0 overflow-auto max-h-[390px]"
        role="list"
        aria-label={`List of latest ${mainHeading}`}
      >
        <div className="divide-y divide-gray-100">
          {data?.length > 0 ? (
            data?.map((item, index) => (
              <div
                key={index}
                className="px-6 py-4 flex items-start justify-between transition"
                role="listitem"
              >
                <div className="flex-1">
                  {/* Link wraps the content */}
                  <Link
                    to={`${link}/${item?.course?._id}`}
                    className="block hover:bg-gray-200 transition p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label={`Go to announcement: ${item.title} for course ${item.course.courseTitle}`}
                  >
                    <p className="font-semibold text-md">{item.title}</p>
                    <p className="text-sm text-gray-500 mb-2 mt-1">
                      {item.course.courseTitle}
                    </p>
                  </Link>
                </div>

                <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                  {item.createdAt && (
                    <time dateTime={new Date(item.createdAt).toISOString()}>
                      <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                    </time>
                  )}
                  {item.time && <p>{item.time}</p>}
                </div>
              </div>
            ))
          ) : (
            <div
              className="text-center text-sm text-gray-500 py-10"
              role="status"
              aria-live="polite"
            >
              No data available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 2. DeshBoardCourseCard
function DeshBoardCourseCard({ mainHeading, data, link, height }) {
  return (
    <Card
      className={`bg-gray-100 border-0 my-auto py-0 gap-2 rounded h-full`}
      style={{ height: height || "100%" }}
      role="region"
      aria-labelledby={`heading-${mainHeading
        .toLowerCase()
        .replace(/\s/g, "-")}`}
    >
      <CardHeader className="flex-row justify-between items-center bg-slate-500 py-3 rounded">
        {/* Use H2 as the main heading for this dashboard card */}
        <h2
          className="text-lg text-white"
          id={`heading-${mainHeading.toLowerCase().replace(/\s/g, "-")}`}
        >
          {mainHeading}
        </h2>
        <Link
          to={link}
          className="text-white text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded"
          aria-label={`View All ${mainHeading}`}
        >
          View All
        </Link>
      </CardHeader>

      <CardContent
        className="p-0 overflow-auto max-h-[390px]"
        role="list"
        aria-label={`List of enrolled courses`}
      >
        <div className="divide-y divide-gray-100">
          {data?.length > 0 ? (
            data?.map((item, index) => (
              <div
                key={index}
                className="px-6 py-4 flex items-start justify-between transition"
                role="listitem"
              >
                <div className="flex-1">
                  <Link
                    to={`/student/mycourses/${item?._id}?courseId=${item?.course?._id}`}
                    className="block hover:bg-gray-200 transition p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label={`Go to course: ${
                      item?.course?.courseTitle ||
                      item?.course?.title ||
                      "Untitled Course"
                    }`}
                  >
                    {item?.course?.courseTitle ? (
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item?.course?.courseTitle}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-800">
                          {item?.course}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item?.course?.title}
                        </p>
                      </>
                    )}
                  </Link>
                </div>

                <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                  {item?.enrolledAt ? (
                    <div>
                      <p>Enrolled at</p>
                      <time dateTime={new Date(item?.enrolledAt).toISOString()}>
                        <p>{new Date(item?.enrolledAt).toLocaleDateString()}</p>
                      </time>
                    </div>
                  ) : item.course.createdAt ? (
                    <time
                      dateTime={new Date(item?.course?.createdAt).toISOString()}
                    >
                      <p>
                        {new Date(item?.course?.createdAt).toLocaleDateString()}
                      </p>
                    </time>
                  ) : null}
                  {item?.course?.time && <p>{item?.course?.time}</p>}
                </div>
              </div>
            ))
          ) : (
            <div
              className="text-center text-sm text-gray-500 py-10"
              role="status"
              aria-live="polite"
            >
              No data available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 3. Assignment
function Assignment({ mainHeading, data, bgcolor, height }) {
  return (
    <Card
      className={`bg-gray-100 border-0 my-auto py-0 gap-2 rounded h-full`}
      style={{ height: height || "100%" }}
      role="region"
      aria-labelledby="assignment-due-heading"
    >
      <CardHeader className="flex-row justify-between items-center bg-slate-500 py-3 rounded">
        {/* Use H2 as the main heading for this dashboard card */}
        <h2 className="text-lg text-white" id="assignment-due-heading">
          Assessment Due
        </h2>
        <Link
          to="assignment"
          className="text-white text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded"
          aria-label="View All Due Assessments"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent
        className={`p-0 ${bgcolor}`}
        role="list"
        aria-label="List of upcoming assessments"
      >
        <Link
          to="assignment"
          className="block"
          aria-label="Go to assessments page"
        >
          <div className={`divide-y`}>
            {data.map((assignment, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-200 transition rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                role="listitem"
                tabIndex={0} // Make the div focusable for keyboard navigation within the link
                onKeyDown={(e) =>
                  handleKeyPress(e, () =>
                    document.getElementById(`assignment-link-${index}`).click(),
                  )
                }
              >
                <Link
                  to="assignment"
                  id={`assignment-link-${index}`}
                  className="block focus:outline-none"
                  aria-label={`${assignment.Assignment} due for ${assignment.course} on ${assignment.dueDate}`}
                >
                  <div className="flex justify-between">
                    <h3 className="hover:font-semibold font-semibold transition-all duration-300 cursor-pointer">
                      {assignment.course}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Due:{" "}
                      <time dateTime={assignment.dueDate}>
                        {assignment.dueDate}
                      </time>
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2 transition-all duration-300 cursor-pointer">
                    {assignment.Assignment}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

// 4. AnnouncementCard (Accordion Style)
function AnnouncementCard({ data }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Card
      className="w-full mx-auto rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-200"
      role="region"
      aria-label="List of Announcements"
    >
      <CardContent className="p-0 divide-y divide-gray-200" role="list">
        {data?.map((announcement, index) => {
          const isOpen = openIndex === index;
          const panelId = `announcement-panel-${index}`;

          return (
            <div key={index} className="px-6 py-4" role="listitem">
              {/* Title and Date (Toggle Button) */}
              <button
                className="flex justify-between items-center w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-1 -m-1"
                onClick={() => toggleOpen(index)}
                onKeyDown={(e) => handleKeyPress(e, () => toggleOpen(index))}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`${
                  isOpen ? "Hide" : "Show"
                } details for announcement: ${announcement.title} in course ${
                  announcement.course
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2">
                  <time
                    dateTime={announcement.date}
                    className="text-sm text-gray-500"
                  >
                    {announcement.date}
                  </time>
                  {isOpen ? (
                    <ChevronUp
                      className="text-gray-500"
                      size={20}
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="text-gray-500"
                      size={20}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>

              {/* Course Info */}
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium text-gray-800">Course:</span>{" "}
                <span role="definition">{announcement.course}</span>
              </p>

              {/* Dropdown content */}
              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={`announcement-title-${index}`}
                  className="mt-3 space-y-2"
                >
                  <p className="text-gray-700">{announcement.message}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Time:</span>{" "}
                    <time dateTime={announcement.time}>
                      {announcement.time}
                    </time>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// 5. CoursesCard (Used in other contexts, generic for listing courses)
function CoursesCard({ course, link }) {
  // Use H3 as the course title heading
  const courseTitleId = `course-title-${course.id}`;

  return (
    <Link
      key={course.id}
      to={link}
      className="block"
      aria-labelledby={courseTitleId}
    >
      <Card className="w-full overflow-hidden cursor-pointer gap-0 py-0 focus-within:ring-2 focus-within:ring-green-500 transition">
        <AspectRatio ratio={16 / 9}>
          <img
            src={course.image || "/placeholder.svg"}
            // Essential: Descriptive alt text for the image
            alt={`Thumbnail image for course ${course.course}`}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
        <div className="p-4">
          <div
            className="uppercase text-indigo-600 bg-indigo-100 text-xs font-medium mb-2 w-fit px-2"
            role="region"
            aria-label="Course category"
          >
            {course.category || "Developments"}
          </div>
          <h3
            className="text-xl font-bold text-gray-900 mb-4"
            id={courseTitleId}
          >
            {course.course}
          </h3>
          <div
            className="text-xl font-bold text-green-500 mb-3"
            aria-label={`Price: $${course.Prise || "24.00"}`}
          >
            ${course.Prise || "24.00"}
          </div>

          <div className="flex items-center gap-4 mb-4" role="status">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1" aria-hidden="true">
                ★
              </span>
              <span
                className="font-medium"
                aria-label={`Rating: ${course.rating || "4.9"} out of 5 stars`}
              >
                {course.rating || "4.9"}
              </span>
            </div>
            <div className="flex items-center text-gray-500">
              {/* SVG icon hidden from screen readers as text conveys meaning */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              <span
                aria-label={`${course.students || "982,941"} students enrolled`}
              >
                {course.students || "982,941"} students
              </span>
            </div>
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            aria-label={`Add ${course.course} to cart`}
          >
            Add To Cart
          </Button>
        </div>
      </Card>
    </Link>
  );
}

// 6. StudentCard

// 7. TransactionCard (Table structure)
const TransactionCard = ({ title, data }) => (
  <Card className="h-fit p-0 gap-3 rounded mt-5">
    <CardContent className="px-3 py-0">
      <Table role="grid" aria-label={`Table of ${title}`}>
        {/* Added caption for table context */}
        <caption className="sr-only">{title} transaction details</caption>
        <TableHeader>
          <TableRow className="border-gray-100">
            {/* Added scope="col" for semantic column headers */}
            <TableHead
              scope="col"
              className="text-xs font-medium text-gray-500 py-3"
            >
              Date
            </TableHead>
            <TableHead
              scope="col"
              className="text-xs font-medium text-gray-500 py-3"
            >
              Time
            </TableHead>
            <TableHead
              scope="col"
              className="text-xs font-medium text-gray-500 py-3 text-center"
            >
              Earnings
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction, index) => (
            <TableRow key={index} className="border-t border-gray-100">
              {/* Using <time> for semantic dates */}
              <TableCell className="text-sm text-gray-700 py-4" scope="row">
                <time dateTime={transaction.date}>{transaction.date}</time>
              </TableCell>
              <TableCell className="text-sm text-gray-700 py-4">
                {transaction.time}
              </TableCell>
              <TableCell className="text-sm text-green-600 py-4 text-center">
                {transaction.type === "Earning"
                  ? `$${transaction.amount}`
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// 8. EarningStateCard
const EarningStateCard = ({ data }) => (
  // Use H3 as the card title, and role="status" for the dynamic value
  <Card
    className="h-full"
    role="status"
    aria-labelledby={`stat-desc-${data.description}`}
  >
    <CardContent className="flex items-center px-6 h-full">
      <div
        className={`h-12 w-12 rounded-lg flex ${data.bgColor} items-center justify-center mr-4`}
      >
        {/* Icon is decorative, assuming data.icon is a component like <DollarSign /> */}
        {data.icon && React.cloneElement(data.icon, { "aria-hidden": true })}
      </div>
      <div className="h-full">
        <p className="text-xl font-bold" aria-live="polite">
          {data.value}
        </p>
        <p
          className="text-sm text-muted-foreground"
          id={`stat-desc-${data.description}`}
        >
          {data.description}
        </p>
      </div>
    </CardContent>
  </Card>
);

// 9. LandingPageCard
const LandingPageCard = ({ name, description, imageUrl, buttonUrl }) => (
  <Card
    className="pb-6 pt-0 overflow-hidden cursor-pointer h-full border flex flex-col gap-4"
    role="article"
    aria-labelledby={`landing-card-title-${name}`}
  >
    <AspectRatio ratio={16 / 5}>
      <img
        src={imageUrl}
        alt={`Image promoting ${name}`}
        className="object-cover w-full h-full"
      />
    </AspectRatio>
    <CardHeader>
      <p className="text-md font-bold" id={`landing-card-title-${name}`}>
        {name}
      </p>
    </CardHeader>
    <CardContent className="flex flex-col flex-1">
      <div className="flex flex-col flex-1 gap-6">
        <p className="text-muted-foreground text-xs">{description}</p>
        {/* Use <a> tag for external link, and add aria-label */}
        <a
          href={buttonUrl}
          className="inline-flex items-center justify-center w-full px-3 py-2 mt-auto text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-500 transition"
          aria-label={`Learn more about ${name} (opens in new window)`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
          {/* SVG icon hidden from screen readers */}
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </a>
      </div>
    </CardContent>
  </Card>
);

// 10. StudentProfileCourseCard

function StudentProfileCourseCard({ course }) {
  const courseTitleId = `profile-course-title-${course._id}`;

  return (
    <Card
      className="p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-md rounded-xl border hover:border-primary transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
      role="group"
      aria-labelledby={courseTitleId}
      tabIndex={0} // Make the card keyboard focusable
    >
      {/* Thumbnail */}
      <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={course?.thumbnail?.url}
          alt={`Thumbnail image for ${
            course?.courseTitle || "Untitled Course"
          }`}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Course Info */}
      <div className="flex-1 w-full text-center sm:text-left">
        <h3 className="text-lg font-semibold text-gray-900" id={courseTitleId}>
          {course?.courseTitle || "Untitled Course"}
        </h3>
      </div>
    </Card>
  );
}

// 11. StudentProfileStatCard
function StudentProfileStatCard({ title, value, icon }) {
  return (
    <Card
      className="p-6 flex items-center w-full gap-4 shadow-sm"
      role="status"
      aria-label={`${title}: ${value}`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center`}
      >
        {/* Icon is decorative */}
        {icon && React.cloneElement(icon, { "aria-hidden": true })}
      </div>
      <div>
        <p className="text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-center" aria-live="polite">
          {value}
        </p>
      </div>
    </Card>
  );
}

// 12. MyCoursesCard
const MyCoursesCard = ({ course }) => {
  // Assuming this card is always wrapped in a <Link> from the parent component
  const courseTitle = course?.course?.courseTitle || "Untitled Course";
  const categoryTitle = course?.course?.category?.title || "General";
  const language = course?.course?.language || "Not Specified";
  const thumbnailUrl = course?.course?.thumbnail?.url || "/placeholder.svg";
  const courseId = `my-course-title-${course?.course?._id || "id"}`;

  return (
    <Card
      className="pb-6 pt-0 w-full overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-green-500 transition"
      role="article"
      aria-labelledby={courseId}
    >
      <AspectRatio ratio={16 / 9}>
        <img
          src={thumbnailUrl}
          alt={`Thumbnail image for course ${courseTitle}`}
          className="object-cover w-full h-full"
        />
      </AspectRatio>
      <CardHeader>
        <div
          className="uppercase text-indigo-600 bg-indigo-100 text-xs font-medium mb-2 w-fit px-2"
          role="region"
          aria-label="Course Category"
        >
          {categoryTitle}
        </div>
        <CardTitle className="flex justify-between flex-col gap-2">
          <span id={courseId} className="text-lg font-semibold">
            {courseTitle}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Language: </span>{" "}
            <span role="definition">{language}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// 13. DiscussionCard
const DiscussionCard = ({ discussion, link }) => {
  const discussionTitleId = `discussion-title-${discussion._id}`;

  return (
    <Link
      key={discussion._id}
      to={link}
      className="border border-gray-300 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 p-4 bg-white block focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
      role="article"
      aria-labelledby={discussionTitleId}
      aria-label={`Go to discussion: ${discussion?.topic} for course ${discussion?.course?.courseTitle}`}
    >
      <div className="overflow-hidden rounded-md mb-2">
        <img
          src={discussion.course.thumbnail.url}
          alt={`Thumbnail for discussion topic: ${
            discussion.topic || "Untitled"
          }`}
          className="w-full h-40 object-cover transform group-hover:scale-105 transition duration-300 ease-in-out"
        />
      </div>

      {discussion.dueDate && (
        <div className="flex items-center gap-2 text-xs mt-1">
          <p className="text-gray-600 font-bold">Due Date:</p>
          <div className="flex items-center gap-2">
            <time
              dateTime={
                discussion.dueDate.date
                  ? new Date(discussion.dueDate.date).toISOString()
                  : ""
              }
              className="text-gray-500"
            >
              {discussion.dueDate.date
                ? new Date(discussion.dueDate.date).toLocaleDateString()
                : "N/A"}
            </time>
            <p className="text-gray-500">
              {discussion.dueDate.time
                ? discussion.dueDate.time.slice(0, 5)
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* Type Badge */}
      <div
        className={`border w-fit px-2 py-1 rounded-full border-gray-200 m-2 bg-indigo-600`}
      >
        <p className="text-xs text-white" role="definition">
          {discussion?.type}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex justify-between items-center mt-3">
        <h2
          className="font-semibold text-lg text-gray-800 truncate"
          id={discussionTitleId}
        >
          {discussion?.topic}
        </h2>
        <time
          dateTime={
            discussion?.createdAt
              ? new Date(discussion.createdAt).toISOString()
              : ""
          }
          className="text-xs text-gray-500"
        >
          {new Date(discussion?.createdAt).toLocaleDateString()}
        </time>
      </div>

      <p className="text-sm text-indigo-700 font-medium">
        {discussion?.course?.courseTitle}
      </p>

      <p className="text-sm text-gray-700 line-clamp-2">
        {discussion?.description}
      </p>
    </Link>
  );
};

export default Card; // Exporting Card as the default component

export {
  DeshboardAnnouncementCard,
  DeshBoardCourseCard,
  Assignment,
  AnnouncementCard,
  CoursesCard,
  TransactionCard,
  EarningStateCard,
  LandingPageCard,
  StudentProfileCourseCard,
  StudentProfileStatCard,
  MyCoursesCard,
  DiscussionCard,
};
