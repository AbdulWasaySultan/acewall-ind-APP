import React, { useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewModal from '../ReviewModal';

const ReviewsSlider = () => {
  const reviews = [
    {
      name: "Consuela Gregory",
      review: "Very well organized and implemented tutoring service!",
      time: "9 days ago",
      image: "https://via.placeholder.com/32",
      rating: 5
    },
    {
      name: "Futures Treasures",
      review: "Patrick loves Ms. Kiesha",
      time: "16 days ago",
      image: "https://via.placeholder.com/32",
      rating: 5

    },
    {
      name: "Frank Carrillo",
      review: "Very professional and down to earth",
      time: "1 month ago",
      image: "https://via.placeholder.com/32",
      rating: 5

    },
    {
      name: "Kelly Douglas",
      review:
        "Acewall Scholars is an amazing program they have helped me with a lot of subjects and made me feel confident in my studies.",
      time: "3 months ago",
      image: "https://via.placeholder.com/32",
      rating: 5

    },
    {
      name: "Jean Charles",
      review: "I would highly recommend Acewall Scholars!!!",
      time: "11 months ago",
      image: "https://via.placeholder.com/32",
      rating: 5
    },
  ];

  const openModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReview(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="w-full md:w-1/2 relative">
        {/* Section Header */}
        <div className="bg-green-600 py-4 rounded-t-lg text-center">
          <h2 className="text-white text-xl font-semibold">
            Students love Acewall Scholars
          </h2>
        </div>

        {/* Custom Navigation Buttons */}
        <button
          className="swiper-button-prev absolute top-1/2 left-[-12px] md:left-[-20px] lg:left-[-24px] z-10 transform -translate-y-1/2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center shadow"
        >
          <ChevronLeft className="w-3 h-3 md:w-5 md:h-5 lg:w-6 lg:h-6" />
        </button>

        <button
          className="swiper-button-next absolute top-1/2 right-[-12px] md:right-[-20px] lg:right-[-24px] z-10 transform -translate-y-1/2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center shadow"
        >
          <ChevronRight className="w-3 h-3 md:w-5 md:h-5 lg:w-6 lg:h-6" />
        </button>

        {/* Swiper Slider */}
        <div className="bg-white rounded-b-lg text-center shadow-md p-4">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev"
            }}
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
            }}
          >
            {reviews.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="bg-gray-50 p-4 rounded-lg border shadow w-full h-[240px] flex flex-col justify-between">
                  <div>
                    <div className="text-yellow-400 text-sm mb-2">
                      {Array(item.rating).fill(0).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>

                    <p className="text-gray-700 text-sm mb-2 line-clamp-3">{item.review}</p>

                    <div className="flex justify-center mb-4">
                      <ReviewModal data={item} />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-auto">
                    <img
                      src="https://cdn1.iconfinder.com/data/icons/logos-brands-in-colors/544/Google__G__Logo-1024.png"
                      alt={`${item.name}'s avatar`}
                      className=" rounded-full w-[14px] h-[14px]  "
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                      </p>


                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

    </>
  );
};

export default ReviewsSlider;
