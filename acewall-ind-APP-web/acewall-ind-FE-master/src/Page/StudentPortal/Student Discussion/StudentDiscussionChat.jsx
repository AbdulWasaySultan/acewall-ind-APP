import { GlobalContext } from "@/Context/GlobalProvider";
import BackButton from "@/CustomComponent/BackButton";
import ChatBox from "@/CustomComponent/Discussion/ChatBox";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Files } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // <-- useNavigate here

const StudentDiscussionChat = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // <-- initialize navigate
  const [discussion, setDiscussion] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(GlobalContext);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchdiscussion = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`discussion/v2/${id}`);
        setDiscussion(res.data.discussion);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Failed to fetch discussion");
      } finally {
        setLoading(false);
      }
    };
    fetchdiscussion();
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <section className="w-full p-6 bg-white rounded-xl shadow-md">
          <div className="mb-2">
            <BackButton />
          </div>
          <div className="py-4 mb-6 pl-6 rounded-lg bg-blue-600 text-white">
            <p className="text-2xl font-bold">Discussion</p>
          </div>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600 font-semibold">Error:</p>
            <p className="text-red-500">{error}</p>
          </div>
        </section>
      </div>
    );
  }

  const openModal = (file) => {
    setModalContent(file);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <section className="w-full p-6 bg-white rounded-xl shadow-md">
        {/* Correct back button */}
        <button
          onClick={() => navigate(-1)} // <-- use navigate here
          className="mb-4 px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 transition w-fit"
        >
          ← Back
        </button>

        <div className="py-4 mb-6 pl-6 rounded-lg bg-blue-600 text-white">
          <p className="text-2xl font-bold">Discussion</p>
        </div>
        <section className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white mb-4">
          {/* Top Row - Due Date */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-600 font-semibold">
                {!discussion.isExtended ? "Due Date:" : "Original Due Date:"}
              </span>
              <span className="text-gray-500">
                {discussion?.dueDate?.date
                  ? new Date(discussion.dueDate.date).toLocaleDateString()
                  : "N/A"}
              </span>

              <span className="text-gray-400">|</span>

              <span className="text-gray-500">
                {discussion?.dueDate?.time
                  ? discussion.dueDate.time.slice(0, 5)
                  : ""}
              </span>
              {discussion.isExtended && (
                <>
                  <span className="text-gray-600 font-semibold">
                    <p>Extended due date</p>
                  </span>
                  <span className="text-gray-500">
                    {discussion?.extendedDueDate?.date
                      ? new Date(
                          discussion.extendedDueDate.date,
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>

                  <span className="text-gray-400">|</span>

                  <span className="text-gray-500">
                    {discussion?.extendedDueDate?.time
                      ? discussion.extendedDueDate.time.slice(0, 5)
                      : ""}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">📚 Course</p>
              <p className="text-gray-500">
                {discussion?.course?.courseTitle || "Not Assigned"}
              </p>
            </div>

            {discussion?.chapter && (
              <div>
                <p className="text-gray-600 font-semibold">📖 Chapter</p>
                <p className="text-gray-500">
                  {discussion?.chapter?.title || "No Chapter"}
                </p>
              </div>
            )}
            {discussion?.lesson && (
              <div>
                <p className="text-gray-600 font-semibold">📖 Lesson</p>
                <p className="text-gray-500">
                  {discussion?.lesson?.title || "No Lesson"}
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="text-2xl font-semibold mb-2">{discussion.topic}</p>
        <p className="text-lg text-gray-600 mb-6">{discussion.description}</p>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {discussion?.files?.map((file, index) => (
            <button
              key={index}
              onClick={() => openModal(file)}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-gray-50 hover:bg-white"
              type="button"
            >
              {file.type === "application/pdf" ? (
                <>
                  <Files className="h-6 w-6 text-red-500" />
                  <span className="text-sm font-medium text-blue-700 truncate">
                    {file.filename}
                  </span>
                </>
              ) : (
                <>
                  <img
                    src={file.url}
                    alt={`File ${index}`}
                    className="h-10 w-10 object-cover rounded-md"
                  />
                  <span className="text-sm font-medium text-blue-700 truncate">
                    {file.filename}
                  </span>
                </>
              )}
            </button>
          ))}
        </section>
      </section>

      <ChatBox discussionId={id} />

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto"
          >
            <button
              onClick={closeModal}
              className="text-gray-600 hover:text-gray-900 float-right text-xl font-bold mb-2"
              aria-label="Close modal"
            >
              ×
            </button>

            {modalContent.type === "application/pdf" ? (
              <iframe
                src={modalContent.url}
                title={modalContent.filename}
                className="w-full h-[80vh]"
              />
            ) : (
              <img
                src={modalContent.url}
                alt={modalContent.filename}
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDiscussionChat;
