"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter(); // <--- add this inside your component

  return (
    <div className="bg-white text-black font-sans">
      <div className="flex flex-col lg:flex-row max-w-[1280px] mx-auto px-6 py-10 gap-10">
        {/* Sidebar */}
        <aside className="w-full lg:max-w-[300px] text-left">
          <div className="flex flex-col items-center lg:items-start">
            <Image
              src="/logo.png"
              alt="Profile"
              width={150}
              height={150}
              className="rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold mb-4">Think Throo</h1>
            <p className="text-sm text-gray-800 leading-relaxed mb-4"></p>
            <div className="flex gap-4 text-xl">
              <a
                href="https://www.instagram.com/thinkthroo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="tthroo/images/instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-6 h-6 hover:scale-110 transition-transform duration-300"
                />
              </a>
              <a
                href="https://www.youtube.com/@ramu-narasinga"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="tthroo/images/youtube.svg"
                  alt="YouTube"
                  width={24}
                  height={24}
                  className="w-6 h-6 hover:scale-110 transition-transform duration-300"
                />
              </a>
              <a
                href="https://x.com/thinkthroo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="tthroo/images/twitter.svg"
                  alt="Twitter"
                  width={24}
                  height={24}
                  className="w-6 h-6 hover:scale-110 transition-transform duration-300"
                />
              </a>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 w-full">
          {/* Testimonials */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 w-[825px]">
            <div className="border rounded-xl p-4 flex-1 min-h-[100px]">
              <p className="text-sm">
                That was insightful and practical, thanks.
              </p>
              <a href="https://dev.to/fyodorio/comment/2mc65" target="_blank">
                <p className="underline text-xs text-gray-500 mt-2">
                  @Fyodor on Dev.to
                </p>
              </a>
            </div>
            <div className="border rounded-xl p-4 flex-1 min-h-[100px] ml-2">
              <p className="text-sm">
                This content is really good, please keep it up.
              </p>
              <a
                href="https://youtu.be/fdorKWiW_hQ?si=BtxNPYHTJ2n8RF2f"
                target="_blank"
              >
                <p className="underline text-xs text-gray-500 mt-2">
                  @panchcw on YouTube
                </p>
              </a>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <button className="px-4 py-2 border rounded-xl font-medium text-sm bg-gray-100">
              All
            </button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">
              Enquiry
            </button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">
              Codebase Architecture Review
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-24">

            <Link href={"/consultation/got-question"}>
              <div className="max-w-sm mx-auto">
                <div className="group cursor-pointer w-[400px] h-[250px] bg-white rounded-3xl shadow p-4 space-y-4">
                  {/* Title & Description */}
                  <div className="space-y-2 mb-14 mt-6">
                    <h3 className="text-gray-700 font-bold text-2xl">
                      Got a question? let’s talk.
                    </h3>
                    <p className="text-gray-600">
                      Could be related to our products.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-2">
                    <div className="relative overflow-hidden bg-gray-100 rounded-xl flex items-center justify-between px-4 py-2  group-hover:bg-gray-100">
              
                      {/* Icon + Info */}
                      <div className="flex items-start gap-2 z-10">
                        <img
                          src="/detail/images/calendar.svg"
                          alt="Duration"
                          className="w-8 h-8 mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium">30 Min</div>
                          <div className="text-xs text-gray-500">
                            video Meeting
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="z-10 border border-gray-400 rounded-full flex items-center space-x-2 text-sm font-medium text-gray-800 px-4 py-1 transition duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                        Book a Meeting
                        <svg
                          className="w-3 h-3 ml-2"
                          viewBox="0 0 448 512"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shimmer keyframe */}
                <style jsx>{`
                  @keyframes shimmer {
                    0% {
                      left: -150%;
                    }
                    100% {
                      left: 100%;
                    }
                  }
                `}</style>
              </div>
            </Link>

            <Link href={"/consultation/codebase-architecture-review"}>
              <div className="max-w-sm mx-auto ml-4">
                <div className="group cursor-pointer w-[400px] h-[250px] bg-white rounded-3xl shadow p-4 space-y-4">
                  {/* Title & Description */}
                  <div className="space-y-2 mb-14 mt-6">
                    <h3 className="text-gray-700 font-bold text-2xl">
                      Codebase architecture review.
                    </h3>
                    <p className="text-gray-600">
                      Want me to review your codebase architecture?
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-2">
                    <div className="relative overflow-hidden bg-gray-100 rounded-xl flex items-center justify-between px-4 py-2 transform transition duration-100 group-hover:bg-gray-100">
                      

                      {/* Icon + Info */}
                      <div className="flex items-start gap-2 z-10">
                        <img
                          src="/detail/images/calendar.svg"
                          alt="Duration"
                          className="w-8 h-8 mr-2"
                        />
                        <div>
                          <div className="text-sm font-medium">1 Hour</div>
                          <div className="text-xs text-gray-500">
                            Video Meeting
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="z-10 border border-gray-400 rounded-full flex items-center space-x-2 text-sm font-medium text-gray-800 px-4 py-1 transition duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                        Book a Meeting
                        <svg
                          className="w-3 h-3 ml-2"
                          viewBox="0 0 448 512"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
