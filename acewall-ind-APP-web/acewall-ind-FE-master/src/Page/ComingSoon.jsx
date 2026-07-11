import { useState } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import acewallscholarslogo from "../assets/acewallscholarslogo.png";
import homebg from "../assets/homebg.png";
import stoke from "../assets/stoke.png";

const ComingSoon = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleWaitlistJoin = async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post("/wishlist/wishlistdone", { email });
            toast.success(response.data.message || "You have successfully joined the waitlist!");
            setEmail("");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to join waitlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center text-center font-sans selection:bg-amber-200">
            
            {/* FULL PAGE BACKGROUND IMAGE */}
            <img
                src={homebg}
                alt="Background"
                className="fixed inset-0 w-full h-full object-cover z-0"
            />

            {/* MAIN CONTENT WRAPPER (Stays above background) */}
            <div className="relative z-10 w-full flex flex-col items-center px-4">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8 w-full pt-20 pb-10 overflow-hidden">
                    <div className="relative">
                        {/* The Stroke Image */}
                        <img
                            src={stoke}
                            alt="Stroke"
                            className="absolute top-7 -left-30 w-100 md:w-120 -z-10 rotate-12"
                        />
                        {/* The Main Logo */}
                        <img
                            src={acewallscholarslogo}
                            alt="Acewall Scholars"
                            className="w-80 md:w-[500px] mb-6 object-contain relative"
                        />
                    </div>
                </div>

                {/* Launch Badge 1 */}
                <div className="mb-12 border border-[#C8A96A] bg-white/40 backdrop-blur-md px-6 py-1.5 rounded-full text-sm font-medium text-[#2E2E2E]">
                    <span className="text-[#C8A96A] font-bold mr-2">New</span> Launching <span className="text-[#C8A96A] font-bold">August 2026</span>
                </div>

                {/* Main Title & Subhead */}
                <div className="max-w-4xl mb-12">
                    <h1 className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] mb-6">
                        Acewall Scholars Learning Vault
                    </h1>
                    <p className="text-lg md:text-xl text-[#555] leading-relaxed">
                        A smart LMS and learning marketplace that combines teacher-built courses, AI-powered features, social media communities and engagement, predictive insights, and AI tutoring to help every learner thrive. From cooking to chemistry, from dance to sign language, our <span className="text-[#C8A96A] font-bold">LMS is a one stop shop for learning and social networking communities.</span>
                    </p>
                </div>

                {/* Launch Badge 2 */}
                <div className="mb-16 border border-[#C8A96A] bg-white/40 backdrop-blur-md px-8 py-2.5 rounded-full text-base font-semibold text-[#2E2E2E] flex items-center gap-2">
                    🚀 Launching <span className="text-[#C8A96A]">August 2026</span>
                </div>

                {/* What is... Section */}
                <div className="max-w-4xl mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-6">
                        What is The Learning Vault?
                    </h2>
                    <p className="text-[#666] text-lg leading-relaxed mb-8">
                        The Learning Vault is a next-generation <span className="text-[#C8A96A] font-bold">smart Learning Management</span> System
                        built to help educators maximize their time through our <span className="text-[#C8A96A] font-bold">AI-Integrated</span> features.
                        Less prep equals more teaching and <span className="text-[#C8A96A] font-bold">student engagement</span>. It is
                        designed to <span className="text-[#C8A96A] font-bold">improve mastery, social engagement</span>, and
                        <span className="text-[#C8A96A] font-bold"> academic outcomes</span> — all in one central marketplace.
                    </p>
                </div>

                {/* Horizontal Divider */}
                <hr className="w-full max-w-4xl border-t border-gray-300 mb-12" />

                {/* Hero Statement */}
                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E]">
                        This is more than an LMS.
                    </h2>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#C8A96A] mt-2 italic">
                        It's a smart learning ecosystem.
                    </h2>
                </div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mb-20 text-white">
                    {/* Schools */}
                    <div className="rounded-3xl border border-gray-200 bg-[#052285]/90 backdrop-blur-sm p-8 flex flex-col items-center shadow-sm">
                        <div className="border border-[#C8A96A] px-6 py-1 rounded-full text-sm font-semibold mb-6">
                            For Schools
                        </div>
                        <h3 className="text-lg font-bold mb-4">
                            <span className="text-[#C8A96A]">Data</span> Driven Digital Campus
                        </h3>
                        <p className="text-sm leading-relaxed mb-6 opacity-90">
                            Unify courses, assessments, analytics, and student engagement
                            in one secure platform.
                        </p>
                        <div className="mt-auto text-xs font-semibold flex items-center gap-2">
                            📊 Track mastery insights
                        </div>
                    </div>

                    {/* Teachers */}
                    <div className="rounded-3xl border border-gray-200 bg-[#052285]/90 backdrop-blur-sm p-8 flex flex-col items-center shadow-sm">
                        <div className="border border-[#C8A96A] px-6 py-1 rounded-full text-sm font-semibold mb-6">
                            For Teachers
                        </div>
                        <h3 className="text-lg font-bold mb-4">
                            <span className="text-[#C8A96A]">Create</span>, <span className="text-[#C8A96A]">Teach</span> & <span className="text-[#C8A96A]">Earn</span>
                        </h3>
                        <p className="text-sm leading-relaxed mb-6 opacity-90">
                            Build your own classes, upload content, and assign work, or earn
                            income from the classes they create.
                        </p>
                        <div className="mt-auto text-xs font-semibold flex items-center gap-2">
                            📦 The Vault storefronts.
                        </div>
                    </div>

                    {/* Students */}
                    <div className="rounded-3xl border border-gray-200 bg-[#052285]/90 backdrop-blur-sm p-8 flex flex-col items-center shadow-sm">
                        <div className="border border-[#C8A96A] px-6 py-1 rounded-full text-sm font-semibold mb-6">
                            For Students
                        </div>
                        <h3 className="text-lg font-bold mb-4">
                            Learn with Support & <span className="text-[#C8A96A]">Community</span>
                        </h3>
                        <p className="text-sm leading-relaxed mb-6 opacity-90">
                            Get personalized <span className="text-[#C8A96A]">AI tutoring</span>, see
                            what you've mastered and salient assessment, <span className="text-[#C8A96A]">"Spill the Tea"</span> social space - and more.
                        </p>
                    </div>
                </div>

                {/* Waitlist Section */}
                <div className="max-w-4xl w-full mb-20">
                    <div className="rounded-3xl border border-[#]/30 bg-[#052285]/90 backdrop-blur-md p-10 shadow-sm text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#C8A96A] mb-6">
                            Be Part of the <span className="text-white">Founding Cohort</span>
                        </h2>
                        <p className="text-[#C8A96A] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                            We're partnering with a small group of schools and educators for our August 2026 launch.
                            Join the waitlist and be among the first to unlock The Learning Vault.
                        </p>

                        {/* Email Input Group */}
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-300 rounded-2xl p-2 max-w-2xl mx-auto shadow-sm">
                            <input
                                type="email"
                                placeholder="Enter your email for launch updates."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleWaitlistJoin()}
                                className="w-full bg-transparent px-4 py-3 outline-none text-[#2E2E2E] placeholder:text-gray-400"
                            />
                            <button
                                onClick={handleWaitlistJoin}
                                disabled={loading}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#C8A96A] to-[#B08D4E] hover:from-[#B08D4E] hover:to-[#96753D] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap mt-2 sm:mt-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        Join the Waitlist
                                        <span className="text-xl">→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Links */}
                <footer className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-gray-500 pb-10">
                    <a href="#" className="flex items-center gap-2 hover:text-[#C8A96A] transition-colors">
                        👤 Contact
                    </a>
                    <span className="text-gray-300">•</span>
                    <a href="#" className="flex items-center gap-2 hover:text-[#C8A96A] transition-colors">
                        ✉️ Privacy
                    </a>
                    <span className="text-gray-300">•</span>
                    <a href="#" className="hover:text-[#C8A96A] transition-colors">Terms</a>
                    <span className="text-gray-300">•</span>
                    <a href="#" className="flex items-center gap-2 hover:text-[#C8A96A] transition-colors">
                        📢 Terms
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default ComingSoon;