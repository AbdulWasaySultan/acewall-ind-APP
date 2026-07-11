// src/components/BackButton.jsx

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path if needed

const BackButton = ({ label = "Back", className = "" }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 bg-[#10B981] text-white border-none hover:bg-[#10B981] ${className}`}
      aria-label={`${label} to previous page`}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      {label}
    </Button>
  );
};

export default BackButton;