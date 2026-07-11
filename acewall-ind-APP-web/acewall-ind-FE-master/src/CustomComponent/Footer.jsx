import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Youtube, Mail, ArrowUp } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const { user, setSelectedSubcategoryId } = useContext(GlobalContext);

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/subcategory/get")
      .then((response) => {
        const subs = response.data?.subcategories || [];
        setSubcategories(subs.slice(0, 5));
      })
      .catch((err) => {
        console.error("Failed to fetch subcategories:", err);
        setSubcategories([]);
      });
  }, []);

  const handleSubscribe = async () => {
    if (!email) {
      setError("Email is required");
      setSuccess("");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axiosInstance.post("/newsletter/subscribe", { email });
      setSuccess("Subscribed successfully! Thank you.");
      setEmail("");
    } catch (err) {
      setError("This email is already subscribed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (sub) => {
    setSelectedSubcategoryId(sub._id);
    navigate(`/student/courses/${sub._id}`);
  };

  const usefulLinks = [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
    { name: "Additional Services", url: "/AdditionalServices" },
    { name: "Terms", url: "/terms" },
    { name: "Privacy Policy", url: "/privacyPolicy" },
  ];

  const socialLinks = [
    {
      Icon: FaXTwitter,
      url: "https://twitter.com/AcewallScholars",
      label: "Follow us on X (formerly Twitter)",
    },
    {
      Icon: Facebook,
      url: "https://www.facebook.com/acewallscholars",
      label: "Follow us on Facebook",
    },
    {
      Icon: Instagram,
      url: "https://www.instagram.com/acewallscholarsonline/",
      label: "Follow us on Instagram",
    },
    {
      Icon: Youtube,
      url: "https://youtube.com/channel/UCR7GG6Dvnuf6ckhTo3wqSIQ",
      label: "Visit our YouTube Channel",
    },
    {
      Icon: Mail,
      url: "mailto:contact@acewallscholars.org",
      label: "Send us an Email",
    },
  ];

  return (
    <>
      <footer className="bg-black text-white mt-10" role="contentinfo">
        <div className="container mx-auto px-4 py-12">
          <div
            className={`grid grid-cols-1 md:grid-cols-${isStudent ? 4 : 3
              } gap-8`}
          >
            {/* Column 1: Address */}
            <section aria-labelledby="footer-contact-title">
              <h3
                id="footer-contact-title"
                className="font-semibold text-white mb-4 text-lg"
              >
                Acewall Scholars
              </h3>
              <address className="not-italic space-y-2 text-sm text-gray-300">
                <p>Acewall Scholars</p>
                <p>P.O. Box 445</p>
                <p>Powhatan, VA 23139</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:contact@acewallscholars.org"
                    className="text-green-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    contact@acewallscholars.org
                  </a>
                </p>
              </address>
            </section>

            {/* Column 2: Useful Links */}
            <nav aria-labelledby="footer-links-title">
              <h3
                id="footer-links-title"
                className="font-semibold text-white mb-4 text-lg"
              >
                Useful Links
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {usefulLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.url}
                      className="flex items-center hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-acewall-green)] rounded p-1 transition-colors"
                    >
                      <span className="text-[var(--color-acewall-green)] mr-2" aria-hidden="true">
                        ›
                      </span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
                {isTeacher && (
                  <li>
                    <Link
                      to="/teacher"
                      className="flex items-center hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-acewall-green)] rounded p-1"
                    >
                      <span className="text-[var(--color-acewall-green)] mr-2" aria-hidden="true">
                        ›
                      </span>{" "}
                      Teacher Dashboard
                    </Link>
                  </li>
                )}
                {isStudent && (
                  <li>
                    <Link
                      to="/student"
                      className="flex items-center hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-acewall-green)] rounded p-1"
                    >
                      <span className="text-[var(--color-acewall-green)] mr-2" aria-hidden="true">
                        ›
                      </span>{" "}
                      Student Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Column 3: Categories (Students Only) */}
            {isStudent && (
              <nav aria-labelledby="footer-categories-title">
                <h3
                  id="footer-categories-title"
                  className="font-semibold text-white mb-4 text-lg"
                >
                  Categories
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {subcategories.length > 0 ? (
                    subcategories.map((sub, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => handleSubcategoryClick(sub)}
                          className="flex items-center hover:text-white text-left w-full focus:outline-none focus:ring-2 focus:ring-green-600 rounded p-1"
                        >
                          <span
                            className="text-green-500 mr-2"
                            aria-hidden="true"
                          >
                            ›
                          </span>{" "}
                          {sub.title}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">
                      No subcategories found.
                    </li>
                  )}
                </ul>
              </nav>
            )}

            {/* Column 4: Newsletter */}
            <section aria-labelledby="newsletter-heading">
              <h3
                id="newsletter-heading"
                className="font-semibold text-white mb-4 text-lg"
              >
                Join Our Newsletter
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Stay updated with our latest news and offers.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubscribe();
                }}
                noValidate
              >
                <div className="flex flex-col space-y-2">
                  {/* The label is visually hidden but read by screen readers */}
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>

                  <div className="flex group">
                    <Input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      /* - border-2 border-blue-600: High contrast (9.7:1) against black.
         - focus-visible:ring-offset-black: Ensures the ring is separated from the background.
      */
                      className="rounded-l-md rounded-r-none border-2 border-[var(--color-acewall-green)] bg-black text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[var(--color-acewall-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none h-10"
                      required
                      aria-required="true"
                    />
                    <Button
                      type="submit"
                      /* - bg-blue-600: High contrast against black footer.
         - hover:bg-blue-500: Maintains contrast while providing visual feedback.
      */
                      className="rounded-l-none rounded-r-md border-2 border-[var(--color-acewall-green)] bg-[var(--color-acewall-green)] hover:bg-emerald-600 hover:border-emerald-600 text-black font-bold h-10 focus-visible:ring-2 focus-visible:ring-[var(--color-acewall-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </div>
                </div>
                {/* Live region for feedback */}
                <div aria-live="polite" className="mt-2 min-h-[1.25rem]">
                  {error && (
                    <p
                      role="alert"
                      className="text-sm text-red-400 font-medium"
                    >
                      {error}
                    </p>
                  )}
                  {success && (
                    <p
                      role="alert"
                      className="text-sm text-[var(--color-acewall-green)] font-medium"
                    >
                      {success}
                    </p>
                  )}
                </div>
              </form>
            </section>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="bg-[#0c0c0c] py-6 border-t border-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400 text-center md:text-left">
                © {new Date().getFullYear()}{" "}
                <a
                  href="https://www.acewallscholars.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-acewall-green)] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--color-acewall-green)]"
                >
                  Acewall Scholars
                </a>{" "}
                - All Rights Reserved
              </p>
              <div className="flex space-x-3" aria-label="Social media links">
                {socialLinks.map(({ Icon, url, label }, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--color-acewall-green)] hover:bg-emerald-600 text-white p-2.5 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-fit h-fit bg-[var(--color-acewall-green)] hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 pointer-events-auto"
          aria-label="Scroll to top of the page"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
