import { useState, useEffect, useContext } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, Mail, MessageCircle, Copy, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";

export const CourseShareDropdown = ({ courseId, courseTitle, className }) => {
    const { user } = useContext(GlobalContext);
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [globalCampaign, setGlobalCampaign] = useState(null);
    const [courseCampaign, setCourseCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log(user, "user in dropdown")

    useEffect(() => {
        const fetchActiveCampaign = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(`campaigns/active?courseId=${courseId}`);
                setActiveCampaign(res.data.campaign);
                setGlobalCampaign(res.data.globalCampaign);
                setCourseCampaign(res.data.courseCampaign);
            } catch (err) {
                console.error("Error fetching active campaign:", err);
                setActiveCampaign(null);
                setGlobalCampaign(null);
                setCourseCampaign(null);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchActiveCampaign();
        }
    }, [courseId]);

    const baseUrl = `${window.location.origin}/course/share/${courseId}/${user?.referralCode || "no-ref"}`;
    const isCampaignActive = !!activeCampaign;
    const hasGlobalCampaign = !!globalCampaign;
    const hasCourseCampaign = !!courseCampaign;

    const getFullUrl = (params = {}) => {
        const url = new URL(baseUrl);

        // Auto-include referral code for students
        if (user?.role === "student" && user?.referralCode) {
            url.searchParams.append("referralCode", user.referralCode);
        }

        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });
        return url.toString();
    };

    const handleCopyLink = () => {
        const shareUrl = getFullUrl();
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                toast.success("Course link copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                toast.error("Failed to copy link");
            });
    };

    const handleEmailShare = () => {
        const campaignName = activeCampaign?.name || "course_launch";
        const params = {
            utm_source: "email",
            utm_medium: "share",
            utm_campaign: campaignName,
        };
        const shareUrl = getFullUrl(params);
        const subject = encodeURIComponent(`Check out this course: ${courseTitle}`);
        const body = encodeURIComponent(`Hi,\n\nI thought you might be interested in this course: ${courseTitle}\n\nYou can find it here: ${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleWhatsAppShare = () => {
        const campaignName = activeCampaign?.name || "course_launch";
        const params = {
            utm_source: "whatsapp",
            utm_medium: "chat",
            utm_campaign: campaignName,
        };
        const shareUrl = getFullUrl(params);
        const text = encodeURIComponent(`Check out this course: ${courseTitle}\n${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const handleCampaignCopy = (campaign) => {
        if (!campaign) return;

        const params = {
            utm_campaign: campaign.name,
        };
        const shareUrl = getFullUrl(params);
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                toast.success(`"${campaign.name}" campaign link copied!`);
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                toast.error("Failed to copy link");
            });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={`flex items-center gap-2 border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold shadow-sm ${className}`}
                >
                    <Share2 className="w-4 h-4" />
                    Share Course
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel className="p-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-tight flex items-center justify-between">
                    <span>Share Course</span>
                    {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                </DropdownMenuLabel>

                {isCampaignActive && (
                    <div className="px-2 py-1 mb-1 flex flex-wrap gap-1">
                        {hasGlobalCampaign && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                Global: {globalCampaign.name}
                            </span>
                        )}
                        {hasCourseCampaign && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                Course: {courseCampaign.name}
                            </span>
                        )}
                    </div>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer gap-2 py-2.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">Email</span>
                        <span className="text-[10px] text-muted-foreground font-normal font-sans">Sends mailto: with UTMs</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer gap-2 py-2.5">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">WhatsApp</span>
                        <span className="text-[10px] text-muted-foreground font-normal font-sans">Direct message via WhatsApp</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer gap-2 py-2.5">
                    <Link2 className="w-4 h-4 text-purple-600" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">Copy Link</span>
                        <span className="text-[10px] text-muted-foreground font-normal font-sans">Copy URL to clipboard</span>
                    </div>
                </DropdownMenuItem>

                <div title={!isCampaignActive && !loading ? "No active campaign" : ""}>
                    {hasGlobalCampaign && (
                        <DropdownMenuItem
                            onClick={() => handleCampaignCopy(globalCampaign)}
                            disabled={loading}
                            className="cursor-pointer gap-2 py-2.5"
                        >
                            <Copy className="w-4 h-4 text-blue-600" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium">Global Campaign Link</span>
                                <span className="text-[10px] text-muted-foreground font-normal font-sans">
                                    Copy "{globalCampaign.name}" link
                                </span>
                            </div>
                        </DropdownMenuItem>
                    )}
                    {hasCourseCampaign && (
                        <DropdownMenuItem
                            onClick={() => handleCampaignCopy(courseCampaign)}
                            disabled={loading}
                            className="cursor-pointer gap-2 py-2.5"
                        >
                            <Copy className="w-4 h-4 text-purple-600" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium">Course Campaign Link</span>
                                <span className="text-[10px] text-muted-foreground font-normal font-sans">
                                    Copy "{courseCampaign.name}" link
                                </span>
                            </div>
                        </DropdownMenuItem>
                    )}
                    {!hasGlobalCampaign && !hasCourseCampaign && (
                        <DropdownMenuItem
                            disabled
                            className="cursor-not-allowed opacity-50 gap-2 py-2.5"
                        >
                            <Copy className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium">Campaign Link</span>
                                <span className="text-[10px] text-muted-foreground font-normal font-sans">
                                    No active campaign
                                </span>
                            </div>
                        </DropdownMenuItem>
                    )}
                </div>

                <DropdownMenuSeparator />
                <div className="px-2 py-2 text-[10px] text-muted-foreground italic leading-tight font-sans">
                    Tracking params will be saved automatically for analytics.
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
