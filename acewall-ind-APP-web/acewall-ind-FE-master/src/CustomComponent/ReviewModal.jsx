import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function ReviewModal({ data }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="text-xs text-green-600 hover:underline font-medium"
                >
                    Read more
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar className="w-[14px] h-[14px]">
                            <AvatarImage src="https://cdn1.iconfinder.com/data/icons/logos-brands-in-colors/544/Google__G__Logo-1024.png"
                                alt="
                                Google" />
                        </Avatar>
                        {data.name}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-base">
                    <div className="text-yellow-400 text-sm mb-2">
                        {Array(data.rating).fill(0).map((_, i) => (
                            <span key={i}>★</span>
                        ))}
                    </div>
                    {data.review}
                </p>
            </DialogContent>
        </Dialog>
    );
}
