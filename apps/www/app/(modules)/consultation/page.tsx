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
              src="/logo.png"
              alt="Profile"
              width={150}
              height={150}
              className="rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold mb-4">Think Throo</h1>
            <p className="text-sm text-gray-800 leading-relaxed mb-4">
              
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
              That was insightful and practical, thanks.
              </p>
              <a href="https://dev.to/fyodorio/comment/2mc65" target="_blank"><p className="underline text-xs text-gray-500 mt-2">@Fyodor on Dev.to</p></a>
            </div>
            <div className="border rounded-xl p-4 flex-1 min-h-[100px]">
              <p className="text-sm">
              This content is really good, please keep it up.
              </p>
              <a href="https://youtu.be/fdorKWiW_hQ?si=BtxNPYHTJ2n8RF2f" target="_blank"><p className="underline text-xs text-gray-500 mt-2">@panchcw on YouTube</p></a>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button className="px-4 py-2 border rounded-xl font-medium text-sm bg-gray-100">All</button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">Enquiry</button>
            <button className="px-4 py-2 border rounded-xl font-medium text-sm">Codebase Analysis</button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Have a question?</h2>
              <div className="flex flex-col justify-evenly items-center ml-10 mt-6 bg-white border border-gray-400 rounded-lg">
                <div className="text-sm">
                  <p>30 mins</p>
                  <p className="text-gray-500 text-xs">Video Meeting</p>
                </div>
                <button 
                  className="px-4 py-2 border rounded-xl text-sm hover:scale-110 transition-transform duration-300"
                  onClick={() => router.push('/consultation/detail')}
                >
                  Book a meeting
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Codebase Analysis</h2>
              <div className="flex justify-evenly items-center ml-10 mt-6 w-[300px] h-[60px] bg-white border border-gray-400 rounded-lg">
                <p className="text-sm text-gray-600">Tech debt piled up? let's talk.</p>
                <button 
                  className="px-4 py-2 border rounded-xl text-sm hover:scale-110 transition-transform duration-300"
                  onClick={() => router.push('/consultation/detail')}
                >
                  $1000+ →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
