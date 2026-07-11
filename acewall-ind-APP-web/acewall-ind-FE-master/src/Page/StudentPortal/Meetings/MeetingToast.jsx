import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, X, Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const MeetingToast = ({ meeting, onClose, onJoin }) => {
    if (!meeting) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-200/50"
        >
            <div className="relative p-5">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="Close notification"
                >
                    <X size={18} />
                </button>

                <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[var(--color-acewall-green)]">
                        <Video size={24} />
                    </div>

                    <div className="flex-1 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-acewall-green)]">
                                <Bell size={10} className="animate-bounce" /> Live Class Starting
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 leading-tight mb-2">
                            {meeting.topic}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {format(new Date(meeting.scheduledAt), "p")}
                            </span>
                            <span>•</span>
                            <span>{meeting.duration} mins</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <Button
                        onClick={() => onJoin(meeting._id)}
                        className="flex-1 bg-[var(--color-acewall-green)] hover:bg-emerald-700 text-white font-bold"
                    >
                        Join Class Now
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        Dismiss
                    </Button>
                </div>
            </div>

            {/* Animated progress bar at bottom */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="h-1 bg-emerald-500/30"
            />
        </motion.div>
    );
};

export default MeetingToast;
