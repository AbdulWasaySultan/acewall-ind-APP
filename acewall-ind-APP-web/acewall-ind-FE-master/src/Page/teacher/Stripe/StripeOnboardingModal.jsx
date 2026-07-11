import React, { useContext, useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader,
} from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { GlobalContext } from "@/Context/GlobalProvider";
import { Button } from "@/components/ui/button";
import Joyride, { STATUS, EVENTS } from "react-joyride";

// ─── Helper: Checklist row ────────────────────────────────────────────────────
function CheckRow({ label, sub }) {
    return (
        <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </span>
            <div>
                <p className="text-sm font-medium text-slate-700 leading-tight">{label}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Helper: Section badge ────────────────────────────────────────────────────
function StepBadge({ number, label, color = "blue" }) {
    const colors = {
        blue:   "bg-blue-100 text-blue-700",
        violet: "bg-violet-100 text-violet-700",
        amber:  "bg-amber-100 text-amber-700",
        green:  "bg-green-100 text-green-700",
        rose:   "bg-rose-100 text-rose-700",
    };
    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${colors[color]}`}>
            <span className="w-4 h-4 rounded-full bg-white/60 flex items-center justify-center text-[10px] font-bold">{number}</span>
            {label}
        </div>
    );
}

// ─── Joyride Steps ────────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
    // ── Step 1: Welcome ──────────────────────────────────────────────────────
    {
        target: ".stripe-modal-header",
        placement: "bottom",
        disableBeacon: true,
        content: (
            <div className="space-y-2">
                <p className="font-bold text-base">Welcome to Stripe Setup 👋</p>
                <p className="text-sm text-slate-600">
                    To receive payouts for your courses you need to complete a one-time
                    Stripe verification. We'll walk you through every step so you know
                    exactly what to prepare.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mt-1">
                    <p className="text-xs text-blue-700 font-medium">⏱ Takes about 5–10 minutes</p>
                </div>
            </div>
        ),
    },

    // ── Step 2: Account ID ───────────────────────────────────────────────────
    {
        target: ".stripe-account-id",
        placement: "bottom",
        content: (
            <div className="space-y-2">
                <p className="font-bold text-base">Your Stripe Account ID</p>
                <p className="text-sm text-slate-600">
                    We automatically created a Stripe Express account for you at signup.
                    This ID permanently links your LMS profile to Stripe — you don't
                    need to do anything with it.
                </p>
            </div>
        ),
    },

    // ── Step 3: Phone number ─────────────────────────────────────────────────
    {
        target: "body",
        placement: "center",
        content: (
            <div className="space-y-3">
                <StepBadge number="1" label="Phone Verification" color="blue" />
                <p className="font-bold text-base leading-tight">Phone Number</p>
                <p className="text-sm text-slate-600">
                    Stripe will first ask you to verify your phone number. Have your
                    mobile ready — they'll send a 6-digit OTP via SMS.
                </p>
                <div className="space-y-1.5 mt-1">
                    <CheckRow label="Mobile phone number" sub="Must be able to receive SMS" />
                    <CheckRow label="6-digit OTP code" sub="Sent to your phone by Stripe" />
                </div>
            </div>
        ),
    },

    // ── Step 4: Personal information ─────────────────────────────────────────
    {
        target: "body",
        placement: "center",
        content: (
            <div className="space-y-3">
                <StepBadge number="2" label="Personal Information" color="violet" />
                <p className="font-bold text-base leading-tight">Identity Details</p>
                <p className="text-sm text-slate-600">
                    Stripe is legally required to verify your identity. Please have the
                    following ready:
                </p>
                <div className="space-y-1.5 mt-1">
                    <CheckRow label="Legal full name" sub="Exactly as it appears on your ID" />
                    <CheckRow label="Email address" sub="Already pre-filled from your account" />
                    <CheckRow label="Date of birth" />
                    <CheckRow label="Home address" sub="Current residential address" />
                    <CheckRow label="Phone number" sub="Can be the same as verification step" />
                    <CheckRow label="SSN or ITIN (last 4 digits)" sub="Social Security or Taxpayer ID number" />
                </div>
            </div>
        ),
    },

    // ── Step 5: Business details ─────────────────────────────────────────────
    {
        target: "body",
        placement: "center",
        content: (
            <div className="space-y-3">
                <StepBadge number="3" label="Business Details" color="amber" />
                <p className="font-bold text-base leading-tight">Business Information</p>
                <p className="text-sm text-slate-600">
                    These details describe how you operate as an educator on this platform.
                    Most fields are pre-filled — just confirm them.
                </p>
                <div className="space-y-1.5 mt-1">
                    <CheckRow
                        label="Industry → select 'Other Educational Services'"
                        sub="Choose this from the industry dropdown"
                    />
                    <CheckRow
                        label="Website"
                        sub="Pre-filled: acewallscholarslearningonline.org"
                    />
                    <CheckRow
                        label="Product description"
                        sub='Pre-filled: "Online courses and live classes sold via LMS platform"'
                    />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-md p-2">
                    <p className="text-xs text-amber-700">
                        💡 You can update the website or description if needed, but the
                        pre-filled values are ready to go.
                    </p>
                </div>
            </div>
        ),
    },

    // ── Step 6: Bank account ─────────────────────────────────────────────────
    {
        target: "body",
        placement: "center",
        content: (
            <div className="space-y-3">
                <StepBadge number="4" label="Bank Account" color="green" />
                <p className="font-bold text-base leading-tight">Payout Bank Details</p>
                <p className="text-sm text-slate-600">
                    Finally, Stripe needs your US bank account to send your earnings.
                    Have these handy:
                </p>
                <div className="space-y-1.5 mt-1">
                    <CheckRow label="Bank routing number" sub="9-digit number (bottom-left of a check)" />
                    <CheckRow label="Account number" sub="Your personal or business checking account" />
                    <CheckRow label="Account type" sub="Checking or savings" />
                </div>
                <div className="bg-green-50 border border-green-100 rounded-md p-2">
                    <p className="text-xs text-green-700">
                        🔒 Stripe uses bank-level encryption — your details are never
                        stored on our servers.
                    </p>
                </div>
            </div>
        ),
    },

    // ── Step 7: Ready to go ──────────────────────────────────────────────────
    {
        target: ".stripe-action-area",
        placement: "top",
        content: (
            <div className="space-y-2">
                <p className="font-bold text-base">You're all set! 🎉</p>
                <p className="text-sm text-slate-600">
                    You know exactly what's needed. Click{" "}
                    <strong>"Complete Onboarding"</strong> below to open Stripe's
                    secure form and complete the process.
                </p>
                <div className="bg-slate-50 border rounded-md p-2 space-y-0.5">
                    <p className="text-xs text-slate-500 font-medium">Quick summary:</p>
                    <p className="text-xs text-slate-500">📱 Phone + OTP → 🪪 Personal info → 🏢 Business details → 🏦 Bank account</p>
                </div>
            </div>
        ),
    },

    // ── Step 8: Footer ───────────────────────────────────────────────────────
    {
        target: ".stripe-footer-note",
        placement: "top",
        content: (
            <div className="space-y-1">
                <p className="font-bold text-base">Auto-closes when done ✅</p>
                <p className="text-sm text-slate-600">
                    Once Stripe confirms your account, this popup closes automatically
                    and payouts are enabled. You can return here anytime from your
                    dashboard if you need to resume.
                </p>
            </div>
        ),
    },
];

// ─── Custom Joyride Tooltip ───────────────────────────────────────────────────
function JoyrideTooltip({
    step,
    index,
    size,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
}) {
    return (
        <div
            {...tooltipProps}
            className="bg-white rounded-xl shadow-xl border p-5 w-80"
            style={{ zIndex: 99999, position: "relative", pointerEvents: "auto" }}
        >
            <div className="mb-3">{step.content}</div>

            {/* Progress dots */}
            <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: size }).map((_, i) => (
                    <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                            i === index
                                ? "w-4 bg-blue-600"
                                : "w-1.5 bg-slate-200"
                        }`}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between gap-2">
                <button
                    {...skipProps}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Skip tour
                </button>

                <div className="flex gap-2">
                    {index > 0 && (
                        <button
                            {...backProps}
                            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button
                        {...primaryProps}
                        className="px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        {isLastStep ? "Got it! 🎉" : "Next →"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StripeOnboardingModal() {
    const { UpdatedUser, fetchUser } = useContext(GlobalContext);
    const [isOpen, setIsOpen]               = useState(false);
    const [loading, setLoading]             = useState(false);
    const [onBoadingLoading, setOnBoadingLoading] = useState(false);
    const [isOnboard, setIsonBoard]         = useState(false);

    // ── Joyride state ──────────────────────────────────────────────────────────
    const [runTour, setRunTour]     = useState(false);
    const [tourStep, setTourStep]   = useState(0);

    // Start tour once the modal is visible and not loading
    useEffect(() => {
        if (isOpen && !onBoadingLoading && !isOnboard) {
            // Small delay so DOM targets are rendered
            const timer = setTimeout(() => setRunTour(true), 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onBoadingLoading, isOnboard]);

    const handleJoyrideCallback = ({ status, type, index }) => {
        // Track step index for progress dots
        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            setTourStep(index + 1);
        }

        const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status);
        if (finished) {
            setRunTour(false);
            setTourStep(0);
        }
    };

    // ── Onboarding check ───────────────────────────────────────────────────────
    const checkOnboarding = useCallback(async (quiet = false) => {
        if (!UpdatedUser?.stripeAccountId) {
            setIsOpen(true);
            return;
        }

        try {
            if (!quiet) setOnBoadingLoading(true);
            const response = await axiosInstance.post("stripe/checkOnboarding", {
                stripeAccountId: UpdatedUser.stripeAccountId,
            });

            const onboarded = response.data.onboarded;
            setIsonBoard(onboarded);
            setIsOpen(!onboarded);
        } catch (error) {
            console.log(error, "error in the check onboarding");
        } finally {
            if (!quiet) setOnBoadingLoading(false);
        }
    }, [UpdatedUser?.stripeAccountId]);

    useEffect(() => {
        if (UpdatedUser?.role === "teacher") {
            checkOnboarding(true);
        }
    }, [UpdatedUser?.role, checkOnboarding]);

    // Periodic re-check every 10 s while modal is open
    useEffect(() => {
        let interval;
        if (isOpen && !isOnboard) {
            interval = setInterval(() => checkOnboarding(true), 10000);
        }
        return () => clearInterval(interval);
    }, [isOpen, isOnboard, checkOnboarding]);

    // ── Stripe actions ─────────────────────────────────────────────────────────
    const handleRedirecting = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("stripe/onboarding");
            const { url } = response.data;
            if (url) window.location.assign(url);
        } catch (err) {
            toast.error("Failed to start onboarding");
            console.error("Onboarding Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStripeAccCreation = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.patch("stripe/createAccount", {
                email: UpdatedUser.email,
            });
            fetchUser();
            toast.success(response?.data?.message || "Stripe account created successfully");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create Stripe account");
            console.error("Stripe Account Creation Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || UpdatedUser?.role !== "teacher") return null;

    return (
        <>
            {/* ── React Joyride Tour ─────────────────────────────────────────── */}
            <Joyride
                steps={ONBOARDING_STEPS}
                run={runTour}
                stepIndex={tourStep}
                continuous
                scrollToFirstStep={false}
                disableScrolling
                disableOverlayClose
                // ❌ removed spotlightClicks — it intercepts pointer events on the tooltip
                floaterProps={{
                    disableAnimation: true,
                    // Ensure the floating tooltip is above the Dialog overlay
                    styles: { floater: { zIndex: 99999 } },
                }}
                tooltipComponent={JoyrideTooltip}
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        // Must be above Shadcn Dialog's z-index (usually ~50 / var --z-dialog)
                        zIndex: 99999,
                        arrowColor: "#ffffff",
                        overlayColor: "rgba(0,0,0,0.3)",
                        spotlightShadow: "0 0 0 3px rgba(59,130,246,0.5)",
                    },
                    overlay: { zIndex: 99998 },
                    spotlight: { zIndex: 99998 },
                    tooltip: { zIndex: 99999 },
                    tooltipContainer: { zIndex: 99999 },
                    buttonNext: { zIndex: 99999 },
                    buttonBack: { zIndex: 99999 },
                    buttonSkip: { zIndex: 99999 },
                }}
            />

            {/* ── Modal ─────────────────────────────────────────────────────── */}
            <Dialog open={isOpen} onOpenChange={() => {}}>
                <DialogContent
                    className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <div className="w-full bg-white rounded-xl shadow-md border overflow-hidden">

                        {/* Header */}
                        <div className="stripe-modal-header p-6 border-b bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-xl font-bold">Stripe Integration</h2>
                                </div>

                                {/* Re-start tour button */}
                                {!runTour && !isOnboard && (
                                    <button
                                        onClick={() => { setTourStep(0); setRunTour(true); }}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Show guide
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Account ID */}
                            <div className="stripe-account-id">
                                <Label className="text-muted-foreground">Current Account ID</Label>
                                <div className="mt-1 p-3 bg-slate-50 border rounded-md font-mono text-sm break-all">
                                    {UpdatedUser?.stripeAccountId
                                        ? UpdatedUser.stripeAccountId
                                        : "No Stripe ID connected"}
                                </div>
                            </div>

                            {/* Action area */}
                            <div className="stripe-action-area flex flex-col gap-4">
                                {onBoadingLoading ? (
                                    <div className="flex justify-center items-center h-10 bg-slate-100 rounded-md">
                                        <Loader className="animate-spin text-slate-500" />
                                    </div>
                                ) : isOnboard ? (
                                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-medium">Your payouts are enabled</span>
                                    </div>
                                ) : UpdatedUser?.stripeAccountId ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-medium">Action Required: Enable Payouts</span>
                                        </div>
                                        <Button
                                            onClick={handleRedirecting}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            disabled={loading}
                                        >
                                            {loading ? "Processing..." : "Complete Onboarding"}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={handleStripeAccCreation}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader className="animate-spin mr-2" /> : null}
                                        Create Stripe Account
                                    </Button>
                                )}
                            </div>

                            {/* Footer note */}
                            <p className="stripe-footer-note text-center text-xs text-slate-400 mt-2">
                                You cannot close this window until onboarding is complete.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}