import React from 'react';

const ConsultationDetail = () => {
  return (
    <div className="flex min-h-screen bg-white-300">
      <div className="w-full max-w-2xl mx-8 my-8">
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6">
          <div className="bg-white rounded-3xl shadow-xl p-0">
            {/* Mentor Profile */}
            <div id="newInterface" className="bg-[rgb(241, 245, 249)] p-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div>
                  <button className="flex items-center text-gray-600 text-sm hover:text-gray-800 mb-2">
                    <img src="/detail/images/arrow.svg" alt="Back" className="w-4 h-4 mr-1" />
                    Ramu Narasinga
                  </button>
                  <h1 className="text-3xl font-bold leading-tight">1:1 Mentorship</h1>
                </div>
                <img src="/detail/images/ramu.svg" alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mt-3 mb-12 px-6 justify-start">
              <span className="flex items-center gap-2 bg-gray-300 text-sm font-medium rounded-full px-4 py-1">
                <img src="/detail/images/Vector.svg" alt="Mentorship" className="w-4 h-4" />
                1:1 Mentorship
              </span>
              <span className="flex items-center gap-2 bg-gray-300 text-sm font-medium rounded-full px-4 py-1">
                <img src="/detail/images/Vector.svg" alt="Solution Architecture" className="w-4 h-4" />
                Solution Architecture
              </span>
              <span className="flex items-center gap-2 bg-gray-300 text-sm font-medium rounded-full px-4 py-1">
                <img src="/detail/images/Vector.svg" alt="Gen AI" className="w-4 h-4" />
                Gen AI
              </span>
            </div>

            {/* Pricing & Meeting */}
            <div className="grid grid-cols-2 text-center border-t border-gray-200 pt-6 px-6">
              <div className="flex flex-col items-center border-r border-gray-200">
                <p className="text-lg font-bold flex items-center">
                  <img src="/detail/images/currency.svg" alt="Price" className="w-5 h-5 mr-2" />
                  500+
                </p>
                <p className="text-sm text-gray-500">INR</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-lg font-bold flex items-center">
                  <img src="/detail/images/calendar.svg" alt="Duration" className="w-5 h-5 mr-2" />
                  30 min meeting
                </p>
                <p className="text-sm text-gray-500">Session Duration</p>
              </div>
            </div>

            {/* Description */}
            <div className="text-gray-700 space-y-5 text-[15px] px-6 pt-6">
              <p>Feeling unprepared and anxious about your upcoming interview? Don't let stress hold you back. Book a 1:1 mentorship call with me and get actionable strategies tailored to help you confidently ace any interview.</p>
              <p>I'm a seasoned DevOps Engineer with hands-on experience in automating CI/CD pipelines and building robust cloud infrastructures. My expertise includes AWS, Terraform, Linux, Docker, and Jenkins — tools that are crucial in today’s tech world.</p>
              <p>During our session, you'll get:</p>
              <ul className="list-disc list-inside space-y-4">
                <li><strong>Customized Guidance:</strong> Advice tailored to your career goals.</li>
                <li><strong>Practical Strategies:</strong> Tools and techniques to boost your confidence and performance.</li>
                <li><strong>Real-World Insights:</strong> Industry-driven tips for DevOps and cloud roles.</li>
                <li><strong>Interview Mastery:</strong> Help to clearly communicate your skills and experience.</li>
              </ul>
              <p>Imagine walking into your interview prepared, confident, and ready to make a strong impression. Let’s tackle your challenges and turn them into your strengths!</p>
              <p>Ready to unlock your potential? Schedule your 1:1 mentorship session today.</p>
            </div>

            {/* Testimonials */}
            <div className="mt-12 px-6 pb-8">
              <h2 className="text-2xl font-bold mb-6">Testimonials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-2xl p-4 bg-gray-50 text-gray-600">
                  "Thanks for your response, I appreciate it!"
                </div>
                <div className="border rounded-2xl p-4 bg-gray-50 text-gray-600">
                  "He was straightforward and honest about being in a different sector. Appreciated the clarity!"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Empty */}
        <div className="flex-1"></div>
      </div>
    </div>
  );
};

export default ConsultationDetail;
