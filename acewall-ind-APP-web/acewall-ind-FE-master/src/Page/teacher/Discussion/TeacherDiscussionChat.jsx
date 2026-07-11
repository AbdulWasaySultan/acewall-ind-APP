import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // <-- import useNavigate
import { GlobalContext } from "@/Context/GlobalProvider";
import ChatBox from "@/CustomComponent/Discussion/ChatBox";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Files, Settings } from "lucide-react";
import EditDiscussionDialog from "@/CustomComponent/CreateCourse/EditDiscussion";
import { Button } from "@/components/ui/button";

const TeacherDiscussionChat = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // <-- initialize navigate
  const [discussion, setDiscussion] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(GlobalContext);

  // New state for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const fetchdiscussion = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`discussion/v2/${id}`);
      setDiscussion(res.data.discussion);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdiscussion();
  }, [id]);

  // Open modal with file content
  const openModal = (file) => {
    setModalContent(file);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 transition w-fit"
      >
        ← Back
      </button>

      <section className="w-full p-6 bg-white rounded-xl shadow-md">
        <div className="py-4 mb-6 pl-6 rounded-lg bg-green-600 text-white flex justify-between items-center">
          <p className="text-2xl font-bold">Discussion</p>
          <div className="mr-2">
            <EditDiscussionDialog
              discussion={discussion}
              fetchDiscussion={fetchdiscussion}
            />
            <Link to={`/teacher/discussions/${id}/settings`}>
              <Button className="ml-2 text-white" variant="ghost" size="sm">
                <Settings /> Settings
              </Button>
            </Link>
          </div>
        </div>
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <p className="text-gray-600 font-bold">Due Date:</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-500">
                {new Date(discussion?.dueDate?.date).toLocaleDateString()}
              </p>
              <p className="text-gray-500">
                {discussion?.dueDate?.time?.slice(0, 5)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <p className="text-gray-600 font-bold">Total Marks:</p>
            <p className="text-gray-500">{discussion.totalMarks}</p>
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

      <ChatBox discussionId={id} discussion={discussion} />

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

export default TeacherDiscussionChat;
