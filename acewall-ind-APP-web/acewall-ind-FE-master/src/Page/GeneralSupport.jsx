import React from "react";
import { Link } from "react-router-dom";
import acewallscholarslogo from "../assets/acewallscholarslogo.png";
import acewallshort from "../assets/acewallshort.png";
import Footer from "@/CustomComponent/Footer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Support from "./Support";

const GeneralSupport = () => {
  const topBarTabs = [
    {
      id: 12,
      name: "Home",
      path: "/",
    },
    {
      id: 7,
      name: "More Courses",
      path: "/Courses",
    },
    {
      id: 8,
      name: "Support",
      path: "/Support",
    },
  ];

  return (
    <div >
      <Support />

    </div>
  );
};

export default GeneralSupport;
