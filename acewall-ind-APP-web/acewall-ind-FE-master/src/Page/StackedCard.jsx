import React from "react";

export const StackedCard = ({ cardsData }) => {
  return (
    <div className="w-full min-h-screen flex justify-center items-start px-4 pb-10">
      <ul
        className="relative flex flex-col items-center w-full gap-10 
        pb-[calc(var(--cards)*var(--cardTopPadding))] p-4 sm:p-6 md:p-10"
      >
        {cardsData.map(({ id, heading, text, bulletPoints }, index) => (
          <li
            key={id}
            id={id} // 👈 ID for smooth scroll target
            className={`sticky top-0 pt-[calc(${index + 1}*var(--cardTopPadding))] 
              w-full max-w-7xl transition-transform duration-300 ease-in-out`}
            style={{ "--cards": cardsData.length, "--cardTopPadding": "2rem" }}
          >
            <div
              className="flex flex-col justify-start items-start 
              bg-white rounded-2xl shadow-sm hover:shadow-lg 
              transition-shadow duration-300 border border-gray-200 
              w-full mx-auto 
              px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-14 
              space-y-10"
            >
              {/* Header Section */}
              <div className="w-full space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {heading}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-5xl">
                  {text}
                </p>
              </div>

              {/* Bullet Points */}
              <div className="w-full ">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
                  {bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-gray-800 font-medium leading-snug">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
