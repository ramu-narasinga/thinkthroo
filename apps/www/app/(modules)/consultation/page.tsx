'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter(); // <--- add this inside your component

  return (
    <div className="bg-white text-black font-sans">
      <div className="flex flex-col lg:flex-row max-w-[1280px] mx-auto px-6 py-10 gap-10">
        {/* Sidebar */}
        <aside className="w-full lg:max-w-[300px] text-left">
          <div className="flex flex-col items-center lg:items-start">
            <Image
              src="/tthroo/images/ramu.svg"
              alt="Profile"
              width={150}
              height={150}
              className="rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold mb-4">Thinkthroo.com</h1>
            <p className="text-sm text-gray-800 leading-relaxed mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been industry's standard dummy text ever since the 1500s,
              when an unknown printer Lorem Ipsum is simply dummy text of the printing and
              typesetting industry. Lorem Ipsum has been industry's standard dummy text ever
              since the 1500s, when an unknown printer
            </p>
            <div className="flex gap-4 text-xl">
              <a href="https://www.instagram.com/thinkthroo" target="_blank" rel="noopener noreferrer">
                <Image src="tthroo/images/instagram.svg" alt="Instagram" width={24} height={24} className="w-6 h-6 hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.youtube.com/@ramu-narasinga" target="_blank" rel="noopener noreferrer">
                <Image src="tthroo/images/youtube.svg" alt="YouTube" width={24} height={24} className="w-6 h-6 hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://x.com/thinkthroo" target="_blank" rel="noopener noreferrer">
                <Image src="tthroo/images/twitter.svg" alt="Twitter" width={24} height={24} className="w-6 h-6 hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 w-full">
          {/* Testimonials */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="border rounded-xl p-4 flex-1 min-h-[100px]">
              <p className="text-sm">
                Highly praised for detailed, insightful career and visa guidance, especially for UK needs.
              </p>
              <p className="text-xs text-gray-500 mt-2">✨ AI-generated based on testimonials</p>
            </div>
            <div className="border rounded-xl p-4 flex-1 min-h-[100px]">
              <p className="font-semibold">Change the World With Your Time. Come and join us!</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button className="px-4 py-2 border rounded-xl font-medium text-sm bg-gray-100">All</button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">1:1 call</button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">Priority DM</button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">Digital Product</button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">Exclusive Content</button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Have a question?</h2>
              <div className="flex justify-evenly items-center ml-10 mt-6 w-[300px] h-[60px] bg-white border border-gray-400 rounded-lg">
                <div className="text-sm">
                  <p>Replies in 2 days</p>
                  <p className="text-gray-500 text-xs">Priority DM</p>
                </div>
                <button 
                  className="px-4 py-2 border rounded-xl text-sm hover:scale-110 transition-transform duration-300"
                  onClick={() => router.push('/consultation/detail')}
                >
                  ₹499 →
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">CV and Cover Letter Master Class with demo</h2>
              <div className="flex justify-evenly items-center ml-10 mt-6 w-[300px] h-[60px] bg-white border border-gray-400 rounded-lg">
                <p className="text-sm text-gray-600">Digital Product</p>
                <button 
                  className="px-4 py-2 border rounded-xl text-sm hover:scale-110 transition-transform duration-300"
                  onClick={() => router.push('/consultation/detail')}
                >
                  ₹499 →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
