import { useEffect, useState, useRef, useContext } from "react";
import { Loader, Pen, Trash2 } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import avatar from "@/assets/avatar.png";
import TeacherDocuments from "@/CustomComponent/teacher/TeacherDocuments";
import { GlobalContext } from "@/Context/GlobalProvider";
import DeleteAccountDialog from "@/CustomComponent/DeleteUserModal";

const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const maxSize = 5 * 1024 * 1024;
const MAX_DOCS = 4;

const Account = () => {
  const [user, setUser] = useState({});
  const [deleteLoading, setDeleteLoading] = useState();
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Ref for keyboard triggering of file input
  const { checkAuth, UpdatedUser } = useContext(GlobalContext);
  const navigate = useNavigate();
  const fetchUser = () => {
    axiosInstance
      .get("auth/getUserInfo")
      .then((res) => setUser(res.data.user))
      .catch(console.log);
  };

  useEffect(() => {
    fetchUser();
  }, [loading]);

  console.log(UpdatedUser, "UpdatedUser in account page");

  const handleImg = async () => {
    if (
      !profileImg ||
      !allowedTypes.includes(profileImg.type) ||
      profileImg.size > maxSize
    ) {
      toast.error("Invalid image. Use JPG/PNG/WebP under 5MB.");
      setProfileImg(null);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("profileImg", profileImg);

    try {
      const res = await axiosInstance.put("auth/updateProfileImg", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setProfileImg(null);
      window.location.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    await axiosInstance
      .delete("auth/deleteUserwithData")
      .then((res) => {
        console.log(res);
        checkAuth();
        setDeleteLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setDeleteLoading(false);
      });
  };

  const displayField = (label, value) => (
    <div
      className="space-y-1"
      role="group"
      aria-labelledby={`label-${label.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <p
        id={`label-${label.replace(/\s+/g, "-").toLowerCase()}`}
        className="text-sm font-medium text-gray-500"
      >
        {label}
      </p>
      <p className="text-base text-gray-900 dark:text-white">{value || "—"}</p>
    </div>
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      fileInputRef.current?.click();
    }
  };

  return (
    <main
      className="w-full mx-auto p-4 sm:p-6 space-y-8"
      aria-label="Account Settings"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Account Information
        </h2>

        {UpdatedUser?.role === "student" && (
          <div className="flex items-center justify-between mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-500">
                Current Points
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {UpdatedUser?.referralPoints || 0}{" "}
                  <span className="text-sm font-normal text-gray-500">pts</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {user?.role === "teacher" && user?.isVarified !== undefined && (
          <span
            role="status"
            className={`text-sm px-3 py-1 rounded-full font-semibold ${
              user.isVarified
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.isVarified ? "Verified" : "Not Verified"}
          </span>
        )}
      </div>

      {/* Profile Image Section */}
      <section className="space-y-4" aria-labelledby="profile-image-heading">
        <h3
          id="profile-image-heading"
          className="text-lg font-semibold text-gray-800"
        >
          Profile Image
        </h3>
        <div className="relative w-32 h-32">
          <img
            src={
              profileImg
                ? URL.createObjectURL(profileImg)
                : (user?.profileImg?.url ?? avatar)
            }
            alt={
              user?.firstName
                ? `${user.firstName}'s profile picture`
                : "Profile picture"
            }
            className="w-full h-full object-cover rounded-full shadow-sm border border-gray-300"
          />
          <label
            htmlFor="profile-upload"
            className="absolute bottom-5 right-4 bg-white border rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-100 focus-within:ring-2 focus-within:ring-green-500 transition-all"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label="Change profile picture"
          >
            <Pen className="w-4 h-4 text-gray-600" aria-hidden="true" />
            <input
              id="profile-upload"
              ref={fileInputRef}
              type="file"
              className="sr-only" // Hidden visually but available to screen readers/focus
              accept={allowedTypes.join(",")}
              onChange={(e) => setProfileImg(e.target.files[0])}
            />
          </label>
        </div>

        {profileImg && (
          <div className="flex gap-2">
            <Button
              onClick={handleImg}
              className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
              aria-live="polite"
            >
              {loading ? (
                <Loader
                  className="animate-spin w-4 h-4 mr-2"
                  aria-hidden="true"
                />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <nav className="flex gap-2 justify-end" aria-label="Account actions">
        <Link to={`/${user.role}/account/editGeneralInfo`}>
          <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-600">
            Edit Info <span className="sr-only">for personal details</span>
          </Button>
        </Link>
        <Link to={`/${user.role}/account/editCredentials`}>
          <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-600">
            Edit Credentials <span className="sr-only">for login details</span>
          </Button>
        </Link>

        <DeleteAccountDialog
          loading={deleteLoading}
          setDelete={setDeleteLoading}
          handleDeleteAccount={handleDeleteAccount}
        />

        {UpdatedUser.role === "teacher" ? (
          <Button
            onClick={() => navigate("/teacher/account/stripeSetting")}
            className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-600"
          >
            Stripe Setting
          </Button>
        ) : (
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-green-600"
            onClick={() => navigate("/student/account/purchaseshistory")}
          >
            Purchase History
          </Button>
        )}
      </nav>

      {/* Information Grid Sections */}
      <div className="space-y-10">
        <section aria-labelledby="personal-info-heading">
          <h3
            id="personal-info-heading"
            className="text-lg font-semibold mb-4 border-b pb-2"
          >
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayField("First Name", user?.firstName)}
            {displayField("Middle Name", user?.middleName)}
            {displayField("Last Name", user?.lastName)}
          </div>
        </section>

        <section aria-labelledby="identity-info-heading">
          <h3
            id="identity-info-heading"
            className="text-lg font-semibold mb-4 border-b pb-2"
          >
            Identity Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayField("Preferred Pronouns", user?.pronoun)}
            {displayField("Gender Identity", user?.gender)}
          </div>
        </section>

        <section aria-labelledby="contact-info-heading">
          <h3
            id="contact-info-heading"
            className="text-lg font-semibold mb-4 border-b pb-2"
          >
            Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayField("Email Address", user?.email)}
            {displayField("Phone Number", user?.phone)}
          </div>
        </section>

        <section aria-labelledby="address-info-heading">
          <h3
            id="address-info-heading"
            className="text-lg font-semibold mb-4 border-b pb-2"
          >
            Address Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayField("Home Address", user?.homeAddress)}
            {displayField("Mailing Address", user?.mailingAddress)}
          </div>
        </section>
      </div>

      {/* Teacher Documents Section */}
      {user?.role === "teacher" && (
        <section aria-label="Professional Documents">
          <TeacherDocuments user={user} setUser={setUser} />
        </section>
      )}
    </main>
  );
};

export default Account;
