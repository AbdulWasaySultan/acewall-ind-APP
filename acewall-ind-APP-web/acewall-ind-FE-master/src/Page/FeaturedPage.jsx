import React from "react";
import { useNavigate } from "react-router-dom";
import heroimage from "../../src/assets/hero-image.png";
import emp1 from "../../src/assets/landing-page-images/emp-1.png";
import emp2 from "../../src/assets/landing-page-images/emp-2.png";
import emp3 from "../../src/assets/landing-page-images/emp-3.png";
import emp4 from "../../src/assets/landing-page-images/emp-4.png";
import emp5 from "../../src/assets/landing-page-images/emp-5.png";
import emp6 from "../../src/assets/landing-page-images/emp-6.png";
import emp7 from "../../src/assets/landing-page-images/emp-7.png";
import mindfulYoga from "../../src/assets/landing-page-images/Mindful-Yoga.png";
import juniorChef from "../../src/assets/landing-page-images/Junior-Chef.png";
import robotics from "../../src/assets/landing-page-images/Robotics.png";
import codingForKids from "../../src/assets/landing-page-images/Coding-for-Kids.png";
import paintingArts from "../../src/assets/landing-page-images/Painting-&-Arts.png";
import publicSpeaking from "../../src/assets/landing-page-images/Public-Speaking.png";
import storytelling from "../../src/assets/landing-page-images/Storytelling.png";
import photography from "../../src/assets/landing-page-images/Photography.png";
import musicAcademy from "../../src/assets/landing-page-images/Music-Academy.png";
import scienceLab from "../../src/assets/landing-page-images/Science-Lab.png";
import danceStudio from "../../src/assets/landing-page-images/Dance-Studio.png";
import creativeWriting from "../../src/assets/landing-page-images/Creative Writing.png";
import calculus from "../../src/assets/landing-page-images/Calculus.png";
import electricalCircuits from "../../src/assets/landing-page-images/electrical-circuits.png";
import englishReading from "../../src/assets/landing-page-images/english-reading.png";

const FeaturedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#f9f9ff] text-[#191b23] font-sans overflow-x-hidden">
      <style>{`
        .squishy-hover { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .squishy-hover:hover { transform: scale(1.05); }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0, 88, 190, 0.1);
        }
        .btn-3d {
          border-bottom-width: 4px;
          transition: all 0.1s ease-in-out;
        }
        .btn-3d:active {
          border-bottom-width: 0px;
          transform: translateY(4px);
        }
        .bg-wave-gradient {
          background: radial-gradient(circle at top right, rgba(236, 237, 247, 1) 0%, rgba(249, 249, 255, 1) 100%);
        }
        .blob-shape {
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .carousel-container {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .carousel-container::-webkit-scrollbar { 
          display: none;
        }
        .carousel-item {
          scroll-snap-align: center;
        }
      `}</style>



      {/* Hero Section */}
      <header className="relative pb-24 px-5 md:px-16 overflow-hidden bg-wave-gradient min-h-[921px] flex flex-col justify-center">
        <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-400/30 rounded-full blur-2xl blob-shape animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl blob-shape animate-float"></div>
        <div className="absolute top-40 right-1/4 w-16 h-16 bg-red-200/40 rounded-full blur-xl blob-shape animate-bounce"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative ">
          <div className="space-y-8 flex flex-col items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-200 text-blue-900 text-sm font-bold px-4 py-2 rounded-full border border-blue-600/10 shadow-sm squishy-hover">
              <span className="text-lg">★</span>
              #1 Platform for Young Minds
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-300 leading-tight drop-shadow-sm">
              Learning Made <span className="text-yellow-500">Fun</span>, <span className="text-green-600">Safe</span> & <span className="text-red-500">Inspiring</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0">
              Acewall Scholars helps children grow through interactive learning, mentorship, creativity, and confidence-building in a secure, engaging environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mx-auto lg:mx-0 pt-4">
              <button onClick={() => navigate('/home')} className="bg-yellow-400 text-yellow-900 text-sm font-bold px-8 py-4 rounded-full btn-3d border-yellow-600 hover:bg-yellow-500 shadow-lg shadow-yellow-400/30 text-lg flex items-center justify-center gap-2">
                Create an account 
              </button>
              <button onClick={() => navigate('/login')} className="glass-panel text-blue-600 text-sm font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg flex items-center justify-center gap-2 border-2 border-blue-600/20">
                Log in to your Account 
              </button>
            </div>
          </div>
          <div className="relative w-full aspect-square max-w-[900px] mx-auto mt-12 lg:mt-0">
            <img
              alt="Illustration of children learning"
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-blue-600/15 blob-shape border-8 border-white"
              src={heroimage}
            />
            <div className="absolute -left-12 -top-4 glass-panel px-4 py-3 rounded-full flex items-center gap-3 squishy-hover shadow-lg shadow-green-500/10 animate-bounce">
              <div className="bg-green-100 text-green-700 p-2 rounded-full flex items-center justify-center">
                <span className="text-lg">✓</span>
              </div>
              <span className="text-sm font-bold text-gray-800">Safe & Secure</span>
            </div>
            <div className="absolute -right-6 bottom-1/4 glass-panel px-4 py-3 rounded-full flex items-center gap-3 squishy-hover shadow-lg shadow-yellow-400/10 animate-bounce" style={{ animationDelay: '1s' }}>
              <div className="bg-yellow-100 text-yellow-700 p-2 rounded-full flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <span className="text-sm font-bold text-gray-800">Top Mentors</span>
            </div>
          </div>
        </div>
        <svg className="absolute bottom-0 w-full h-24 lg:h-32 text-[#f9f9ff] fill-current" preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </header>

      {/* Programs Section */}
      <section className="py-[120px] px-5 md:px-16 relative bg-gradient-to-br from-[#f9f9ff] to-[#fff0f5] overflow-hidden" id="programs">
        <div className="max-w-7xl mx-auto relative ">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-600 drop-shadow-sm">Discover Our Programs</h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">Explore a rainbow of opportunities designed to nurture every aspect of your child's educational journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📚", title: "Academic Tutoring", desc: "Personalized guidance in core subjects to build strong foundational knowledge.", color: "#f44336", bgColor: "#ffebee", link: "https://www.acewallscholars.org/academic-tutoring" },
              { icon: "📝", title: "Test Prep", desc: "Strategic preparation and practice to boost confidence and scores on essential exams.", color: "#ff9800", bgColor: "#fff3e0", link: "https://www.acewallscholars.org/test-prep" },
              { icon: "👨‍👩‍👧", title: "Parent Aide", desc: "Resources and support systems designed to help parents actively participate in learning.", color: "#4caf50", bgColor: "#e8f5e9", link: "https://www.acewallscholars.org/parent-aide" },
              { icon: "🎓", title: "College Counseling", desc: "Expert advice navigating the college admissions process, from essays to applications.", color: "#2196f3", bgColor: "#e3f2fd", link: "https://www.acewallscholars.org/college-counseling" },
              { icon: "🤝", title: "Mentorship", desc: "One-on-one relationships with inspiring role models who guide personal development.", color: "#9c27b0", bgColor: "#f3e5f5", link: "https://www.acewallscholars.org/mentoring" },
              { icon: "💼", title: "Internship Guidance", desc: "Career exploration and internship placement assistance to prepare for the future.", color: "#009688", bgColor: "#e0f2f1", link: "https://www.acewallscholars.org/internship-" },
            ].map((program, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 squishy-hover shadow-xl border-t-8 flex flex-col h-full group" style={{ borderColor: program.color }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform" style={{ backgroundColor: program.bgColor, color: program.color }}>
                  <span className="text-4xl">{program.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3 flex-grow">{program.title}</h3>
                <p className="text-base text-gray-500 mb-6">{program.desc}</p>
                <a
                  href={program.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full font-bold hover:text-white transition-colors text-center block"
                  style={{ backgroundColor: program.bgColor, color: program.color }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = program.color; e.target.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = program.bgColor; e.target.style.color = program.color; }}
                >
                  Learn More
                </a>
              </div>
            ))}
          </div>
        </div>
        <svg className="absolute bottom-0 w-full h-24 lg:h-32 text-teal-500/5 fill-current" preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,53.3C1120,43,1280,21,1360,10.7L1440,0L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </section>

      {/* Our Students Section */}
      <section className="py-[120px] px-5 md:px-16 relative bg-[#f9f9ff] overflow-hidden" id="students">
        <div className="absolute top-20 right-10 text-orange-500/20 animate-float" style={{ fontSize: '80px' }}>✨</div>
        <div className="absolute bottom-20 left-10 text-purple-500/20 animate-pulse" style={{ fontSize: '100px' }}>🎨</div>

        <div className="max-w-7xl mx-auto relative ">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 drop-shadow-sm">Empowering Young Minds</h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">Helping students discover creativity, confidence, and future-ready skills.</p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="glass-panel px-8 py-6 rounded-2xl text-center min-w-[200px] squishy-hover">
              <h4 className="text-4xl font-bold text-blue-600 mb-1">500+</h4>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Students</p>
            </div>
            <div className="glass-panel px-8 py-6 rounded-2xl text-center min-w-[200px] squishy-hover">
              <h4 className="text-4xl font-bold text-yellow-500 mb-1">25+</h4>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Creative Courses</p>
            </div>
            <div className="glass-panel px-8 py-6 rounded-2xl text-center min-w-[200px] squishy-hover">
              <h4 className="text-4xl font-bold text-green-600 mb-1">95%</h4>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Parent Satisfaction</p>
            </div>
          </div>

          {/* Gallery */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {[
              { img: emp1, label: "Collaborative Learning", color: "blue" },
              { img: emp2, label: "Music Appreciation", color: "purple" },
              { img: emp3, label: "Robotics Lab", color: "teal" },
              { img: emp4, label: "Digital Literacy", color: "orange" },
              { img: emp5, label: "Artistic Expression", color: "red" },
              { img: emp6, label: "Team Projects", color: "green" },
              { img: emp7, label: "Creative Workshops", color: "pink" },
            ].map((item, index) => (
              <div key={index} className="relative group overflow-hidden rounded-3xl shadow-xl">
                <img alt={item.label} className="w-full h-auto transition-transform duration-500 group-hover:scale-110" src={item.img} />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-white text-sm font-bold">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-[120px] px-5 md:px-16 relative bg-gray-50" id="courses">
        <div className="max-w-7xl mx-auto relative ">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-teal-600 drop-shadow-sm">Explore Our Creative Courses</h2>
          </div>



          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Mindful Yoga", desc: "Calm minds and flexible bodies for kids.", img: mindfulYoga, color: "red" },
              { title: "Junior Chef", desc: "Mastering the basics of healthy cooking.", img: juniorChef, color: "yellow" },
              { title: "Robotics", desc: "Build and program your own robots.", img: robotics, color: "blue" },
              { title: "Coding for Kids", desc: "Learn to create games and apps.", img: codingForKids, color: "teal" },
              { title: "Calculus", desc: "Master advanced mathematics concepts.", img: calculus, color: "indigo" },

              { title: "Painting & Arts", desc: "Explore colors and various mediums.", img: paintingArts, color: "purple" },
              { title: "Public Speaking", desc: "Confidence on stage and off.", img: publicSpeaking, color: "yellow" },
              { title: "Storytelling", desc: "Crafting magical worlds with words.", img: storytelling, color: "orange" },
              { title: "Photography", desc: "Capturing moments through the lens.", img: photography, color: "blue" },
              { title: "Music Academy", desc: "Learn guitar, piano, and more.", img: musicAcademy, color: "purple" },
              { title: "Science Lab", desc: "Hands-on experiments for curious minds.", img: scienceLab, color: "teal" },
              { title: "English Reading", desc: "Enhance reading comprehension skills.", img: englishReading, color: "rose" },
              { title: "Dance Studio", desc: "Rhythm and movement for everyone.", img: danceStudio, color: "red" },
              { title: "Creative Writing", desc: "Unlock your literary potential.", img: creativeWriting, color: "orange" },
              { title: "Electrical Circuits", desc: "Learn electronics and circuit design.", img: electricalCircuits, color: "amber" },

            ].map((course, index) => (
              <div key={index} className="glass-panel rounded-2xl flex flex-col overflow-hidden group squishy-hover shadow-lg">
                <img alt={course.title} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500" src={course.img} />
                <div className="p-6 flex flex-col flex-grow items-center text-center">
                  <h4 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h4>
                  <p className="text-sm text-gray-500 mb-6">{course.desc}</p>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-[120px] px-5 md:px-16 relative bg-gradient-to-b from-orange-500/10 to-[#f9f9ff] overflow-hidden" id="stories">
        <div className="absolute top-10 left-10 text-purple-500/20 animate-float" style={{ fontSize: '80px' }}>🎉</div>
        <div className="absolute bottom-10 right-20 text-teal-500/20 animate-[bounce_5s_ease-in-out_infinite]" style={{ fontSize: '96px' }}>😊</div>
        <div className="max-w-7xl mx-auto relative ">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-orange-500 drop-shadow-sm">Success Stories</h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">Hear from our happy scholars and their parents about the magic of learning with us.</p>
          </div>
          <div className="carousel-container gap-8 pb-10 pt-4 px-4">
            {/* Story 1 */}
            <div className="carousel-item min-w-[300px] max-w-[400px] flex-none flex flex-col items-center squishy-hover">
              <div className="bg-[#2196f3] text-white p-6 rounded-3xl shadow-lg border-b-4 border-[#1976d2] mb-8 relative">
                <p className="text-base italic">"I never thought math could be this fun! The games make it easy to understand, and I got an A on my last test!"</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-[#2196f3] overflow-hidden flex items-center justify-center text-3xl shadow-md">
                  🧑🏽‍🎓
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Jordan T.</h4>
                  <p className="text-sm text-gray-500">5th Grade</p>
                </div>
              </div>
            </div>
            {/* Story 2 */}
            <div className="carousel-item min-w-[300px] max-w-[400px] flex-none flex flex-col items-center squishy-hover">
              <div className="bg-[#f44336] text-white p-6 rounded-3xl shadow-lg border-b-4 border-[#d32f2f] mb-8 relative">
                <p className="text-base italic">"The mentors truly care. They helped my daughter build confidence not just in academics, but in herself."</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-[#f44336] overflow-hidden flex items-center justify-center text-3xl shadow-md">
                  👩🏻
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Sarah M.</h4>
                  <p className="text-sm text-gray-500">Parent</p>
                </div>
              </div>
            </div>
            {/* Story 3 */}
            <div className="carousel-item min-w-[300px] max-w-[400px] flex-none flex flex-col items-center squishy-hover">
              <div className="bg-[#4caf50] text-white p-6 rounded-3xl shadow-lg border-b-4 border-[#388e3c] mb-8 relative">
                <p className="text-base italic">"I love the interactive map! Earning trophies makes me want to learn more every day. It's like playing my favorite game."</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-[#4caf50] overflow-hidden flex items-center justify-center text-3xl shadow-md">
                  👦🏿
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Marcus L.</h4>
                  <p className="text-sm text-gray-500">3rd Grade</p>
                </div>
              </div>
            </div>
            {/* Story 4 */}
            <div className="carousel-item min-w-[300px] max-w-[400px] flex-none flex flex-col items-center squishy-hover">
              <div className="bg-[#ff9800] text-white p-6 rounded-3xl shadow-lg border-b-4 border-[#f57c00] mb-8 relative">
                <p className="text-base italic">"The college counseling program was a lifesaver. They guided us step-by-step and reduced all our stress."</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-[#ff9800] overflow-hidden flex items-center justify-center text-3xl shadow-md">
                  👨🏽
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">David R.</h4>
                  <p className="text-sm text-gray-500">Parent of Senior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Learning World Section */}
      <section className="py-[120px] px-5 md:px-16 relative bg-gradient-to-tr from-teal-500/10 via-[#f9f9ff] to-blue-600/10 overflow-hidden" id="interactive-world">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative ">
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-teal-600 drop-shadow-sm">Interactive Learning World</h2>
            <p className="text-lg text-gray-500">Step into a futuristic, gamified learning environment where every milestone unlocked is a reason to celebrate. Track progress, earn achievements, and explore an ever-expanding universe of knowledge.</p>
            <button onClick={() => navigate('/login')} className="bg-teal-600 text-white text-sm font-bold px-8 py-4 rounded-full btn-3d border-teal-800 hover:bg-teal-700 shadow-lg shadow-teal-600/30 text-lg flex items-center justify-center gap-2 mx-auto lg:mx-0">
              Login and Explore <span className="text-xl">🧭</span>
            </button>
          </div>

          <div className="w-full lg:w-1/2 relative h-[500px]">
            <div className="glass-panel w-full h-full rounded-3xl p-6 relative overflow-hidden border-2 border-white/60 shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">A</div>
                  <div>
                    <h4 className="text-sm font-bold text-lg text-blue-600">Alex's Journey</h4>
                    <p className="text-sm text-gray-500">Level 12 Explorer</p>
                  </div>
                </div>
                <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                  <span className="text-sm">★</span> 2,450 XP
                </div>
              </div>

              <div className="flex-grow bg-[#f9f9ff]/50 rounded-2xl relative overflow-hidden border border-white/40">
                <svg className="w-full h-full stroke-teal-600/30" fill="none" strokeDasharray="10 10" strokeWidth="4" viewBox="0 0 400 200">
                  <path d="M 50 150 Q 100 50, 200 100 T 350 50"></path>
                </svg>
                <div className="absolute top-[130px] left-[30px] w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-600/50 animate-float"><span className="text-lg">✓</span></div>
                <div className="absolute top-[80px] left-[180px] w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-600/50 animate-float" style={{ animationDelay: '1s' }}><span className="text-xl">🔬</span></div>
                <div className="absolute top-[30px] left-[330px] w-10 h-10 bg-[#f9f9ff] rounded-full border-4 border-blue-600 flex items-center justify-center text-blue-600 shadow-lg animate-float" style={{ animationDelay: '2s' }}><span className="text-lg">🔒</span></div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="bg-white/80 p-3 rounded-xl flex items-center gap-3 min-w-[150px] shadow-sm border border-white">
                  <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center"><span className="text-lg">🔥</span></div>
                  <div><p className="text-xs font-bold text-gray-800">7 Day Streak!</p></div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl flex items-center gap-3 min-w-[150px] shadow-sm border border-white">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center"><span className="text-lg">🏆</span></div>
                  <div><p className="text-xs font-bold text-gray-800">Math Wizard</p></div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl flex items-center gap-3 min-w-[150px] shadow-sm border border-white">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><span className="text-lg">🚀</span></div>
                  <div><p className="text-xs font-bold text-gray-800">Space Explorer</p></div>
                </div>
              </div>
            </div>

            <div className="absolute -right-10 top-10 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl z-20 animate-bounce">
              <div className="bg-orange-500 text-white p-2 rounded-full flex items-center justify-center">
                <span className="text-lg">🔔</span>
              </div>
              <span className="text-sm font-bold text-gray-800">New Quest Available!</span>
            </div>
            <div className="absolute -left-10 bottom-20 glass-panel p-3 rounded-full flex items-center justify-center shadow-xl z-20 animate-float" style={{ animationDelay: '1.5s' }}>
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        </div>

        <svg className="absolute bottom-0 w-full h-24 lg:h-32 text-[#f9f9ff] fill-current" preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path d="M0,96L80,85.3C160,75,320,53,480,53.3C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </section>

      {/* Why Parents Trust Us */}
      <section className="py-[120px] px-5 md:px-16 bg-[#f9f9ff] relative" id="safety">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 drop-shadow-sm">Why Parents Trust Us</h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">We prioritize your child's well-being above all else, creating a nurturing ecosystem for growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🛡️", title: "Safe Environment", desc: "Secure, monitored virtual classrooms ensuring a protective space for every child." },
              { icon: "🧠", title: "Expert Mentors", desc: "Carefully vetted educators who inspire, guide, and support academic excellence." },
              { icon: "❤️", title: "Mental Health Support", desc: "Integrated wellness checks and positive reinforcement to build emotional resilience." },
              { icon: "✨", title: "Personalized Learning", desc: "Adaptive curriculums tailored to match each student's unique pace and style." },
              { icon: "📊", title: "Progress Tracking", desc: "Transparent, easy-to-read dashboards highlighting milestones and achievements." },
              { icon: "👨‍👩‍👧", title: "Parent Involvement", desc: "Collaborative tools keeping families connected to the learning journey." },
            ].map((feature, index) => (
              <div key={index} className="glass-panel rounded-xl p-8 squishy-hover group">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors shadow-md">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-base text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <svg className="absolute bottom-0 w-full h-24 lg:h-32 text-orange-500/10 fill-current" preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </section>
    </div>
  );
};

export default FeaturedPage;