import { Loader } from "lucide-react";
import React from "react";

const LoadingLoader = () => {
  return (
    <div>
      <section className="flex justify-center items-center h-screen w-screen">
        <Loader size={48} className={"animate-spin"} />
      </section>
    </div>
  );
};

export default LoadingLoader;
