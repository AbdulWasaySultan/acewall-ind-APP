import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

const SearchBox = ({ query, setQuery }) => {
  return (
    <div className="w-full px-3 md:px-0">
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Maths, Biology, Meditation"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-14 text-black font-medium border-2 border-[var(--color-acewall-green)] rounded-full pl-5 pr-12"
        />

        <Search
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-2 w-8 h-8 cursor-pointer transition-colors duration-300 
            ${query.length > 0 ? "bg-[var(--color-acewall-green)] text-white" : "bg-emerald-100 opacity-[0.7]"}`}
        />
      </div>
    </div>
  );
};

export default SearchBox;
