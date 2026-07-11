import React from "react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto  py-4 max-w-6xl">
        {/* Our History Section */}
        <div className="grid lg:grid-cols-2 gap-10 px-2 py-10 rounded-lg">
          <div>
            <img
              src="https://lirp.cdn-website.com/6602115c/dms3rep/multi/opt/shutterstock_2439625087-696w.jpg"
              alt="Group of people with arms around each other"
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-green-700 mb-4">
                Our History
              </h2>
              <p className="text-gray-700 mb-6 text-justify">
                Acewall Scholars was originally formed in 2006 as a non-profit in home and online tutoring company. Acewall Scholars was formed with an unwavering yearning to improve the academic performance of students in the math and sciences. Acewall Scholars is designed to offer students a curriculum that provides remediation, enrichment, and mastery. With a growing awareness that many academic deficiencies stem from problematic areas beyond the classroom, in 2010, Acewall Scholars began to take a more holistic approach to education and the overall personal growth of each student. To do this, the program Kids Going Green was developed which tied together classroom performance with overall diet.


              </p>
              <p className="text-gray-700 mb-6 text-justify">
                Reorganized in 2015 as a for-profit educational and mentoring organization, Acewall Scholars has adopted a more comprehensive method to reach more students in the most effective and permanent way. Our assistance goes beyond the classroom now. We assist our clients with not just academic growth, but social, spiritual, and physical growth. We know that every child wants to succeed in life. It is our goal to give them the space to see that they can, and the tenacity to determine their own definition of success. Collectively we are determined to build relationships and positively affect the lives of all the students and families that we touch.


              </p>
            </div>
          </div>
        </div>

        {/* Our Mission Section */}
      </div>
      <section className="relative overflow-hidden min-h-screen px-2 flex items-center">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(https://irp.cdn-website.com/6602115c/dms3rep/multi/section+background.jpg)",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.2, // Adjust background image opacity here
          }}
        ></div>

        {/* Overlay for subtle darkening */}
        <div className="absolute inset-0 bg-white/60 z-0"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-6">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-between p-10 bg-[#e3e9e3]/90 rounded-md shadow-lg">
            <div>
              <h2 className="text-3xl font-bold text-green-700 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-700 text-justify">
                Acewall Scholars LLC is an organization holistically designed
                to engage and meet the needs of each child. We promote the
                enrichment of the mind, body, and spirit. It is our position
                that academics and social success are intricately connected to
                the overall belief in one’s capability and the depth of exposure
                to the different facets of our society, as well as the cultures
                within it. It is with this belief that we look to broaden the
                vision of each child and obtain improvements in their academic
                and social life.
              </p>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 text-white w-fit mt-6">
              Contact Us
            </Button>
          </div>

          {/* Right: Image */}
          <div>
            <img
              src="https://lirp.cdn-website.com/6602115c/dms3rep/multi/opt/about+us+1-696w.jpg"
              alt="Group of people with arms around each other"
              className="w-full h-full object-cover rounded-md shadow-md"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
