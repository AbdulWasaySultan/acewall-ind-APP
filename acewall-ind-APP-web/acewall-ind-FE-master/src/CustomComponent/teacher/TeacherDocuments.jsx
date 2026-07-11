import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader, Trash2 } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

const categoryLimits = {
  universityTranscripts: { label: "University Transcripts", limit: 4 },
  teacherLicenses: { label: "Teacher Licenses / Certifications", limit: 4 },
  ids: {
    label: "Identification Documents (Passport, ID, etc.)",
    limit: 2,
    description: "Accepted: Passport, Driver’s License, Birth Certificate, etc.",
  },
  resume: { label: "Resume / CV", limit: 2 },
  portfolio: { label: "Portfolio", limit: 1 },
};

const badgeClass = (status) => ({
  verified: "bg-green-100 text-green-800",
  not_verified: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
}[status]);

const getDocIndex = (name) => {
  const match = name.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
};

const TeacherDocuments = ({ user, setUser }) => {
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, doc: null, category: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  const isCategoryFull = (cat) =>
    (user.documents?.[cat]?.length || 0) >= categoryLimits[cat]?.limit;

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = Array.from(e.target.document.files);
    const category = e.target.category.value;

    if (!files.length || !category) return toast.error("Both file(s) and category are required");

    const currentCount = user.documents?.[category]?.length || 0;
    const limit = categoryLimits[category]?.limit || 0;
    const availableSlots = limit - currentCount;

    if (availableSlots <= 0) {
      return toast.error(`Upload limit reached for ${categoryLimits[category].label}`);
    }

    const filesToUpload = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast.warning(`Only ${availableSlots} file(s) allowed for this category. Excess ignored.`);
    }

    setUploading(true);

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("category", category);

      try {
        const res = await axiosInstance.post("/auth/uploadDocument", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setUser((prev) => ({
          ...prev,
          documents: res.data.documents,
        }));

        toast.success(`Uploaded: ${file.name}`);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    e.target.reset();
  };

  const confirmDelete = async () => {
    const { doc, category } = deleteModal;
    if (!doc || !category) return;

    setDeletingId(doc._id);

    try {
      const res = await axiosInstance.delete(`/auth/teacher/document/${doc._id}?category=${category}`);
      toast.success(res.data.message);
      setUser((prev) => ({ ...prev, documents: res.data.documents }));
      setDeleteModal({ show: false, doc: null, category: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6 mt-20">
      <h3 className="text-2xl font-bold">Uploaded Documents</h3>

      {!user?.isVarified && (
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select name="category" className="border p-2 rounded" required>
              <option value="">Select Document Category</option>
              {Object.entries(categoryLimits).map(([value, { label, limit }]) => (
                <option key={value} value={value} disabled={isCategoryFull(value)}>
                  {label} (max {limit}) {isCategoryFull(value) ? "— Limit reached" : ""}
                </option>
              ))}
            </select>

            <input
              type="file"
              name="document"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              className="border p-2 rounded"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={uploading}
            className="text-white bg-green-500 hover:bg-green-600"
          >
            {uploading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : "Upload Document(s)"}
          </Button>
        </form>
      )}

      {/* Dropdown Accordion for Categories */}
      <div className="space-y-4">
        {user?.documents &&
          Object.entries(user.documents).map(([category, docs]) => {
            const { label, limit, description } = categoryLimits[category] || {
              label: category,
              limit: 0,
            };

            const sortedDocs = [...docs].sort((a, b) => getDocIndex(a.name) - getDocIndex(b.name));
            const isOpen = openCategory === category;

            return (
              <div key={category} className="border rounded-md">
                <button
                  type="button"
                  onClick={() =>
                    setOpenCategory(isOpen ? null : category)
                  }
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 transition font-semibold"
                >
                  <span>{label} ({docs.length}/{limit})</span>
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {isOpen && (
                  <div className="px-4 py-3 space-y-2">
                    {description && <p className="text-xs text-gray-500">{description}</p>}

                    {sortedDocs.length > 0 ? (
                      sortedDocs.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <span className="font-medium">{doc.name}</span>
                            {doc.url ? (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400">No URL</span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${badgeClass(doc.verificationStatus)}`}>
                              {doc.verificationStatus.replace("_", " ")}
                            </span>
                          </div>

                          {!user?.isVarified && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteModal({ show: true, doc, category })}
                            >
                              {deletingId === doc._id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No documents uploaded in this category.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Delete Modal */}
      {!user?.isVarified && deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <strong>{deleteModal.doc?.name}</strong> from{" "}
              <strong className="capitalize">
                {deleteModal.category?.replace(/([A-Z])/g, " $1")}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteModal({ show: false, doc: null, category: "" })}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deletingId === deleteModal.doc?._id}
              >
                {deletingId === deleteModal.doc?._id ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeacherDocuments;
