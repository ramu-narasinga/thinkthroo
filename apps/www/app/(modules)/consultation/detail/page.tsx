import React from "react";
import GotQuestion from "@/components/interfaces/consultation/got-question"

const ConsultationDetail = () => {
  return (
    <div className="flex min-h-screen bg-secondary p-8">
      <div className="flex flex-wrap md:flex-nowrap w-full gap-6">
      <div className="w-full md:w-1/2">
        <div className="bg-white border border-gray-300 rounded-3xl shadow-md p-6 ml-6 mt-6 mb-6">
          <div className="bg-white rounded-3xl shadow-xl p-0">
            {/* Mentor Profile */}
            <div id="newInterface" className="bg-secondary border p-6 rounded-3xl mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <button className="flex items-center text-gray-600 text-sm hover:text-gray-800 mb-2">
                    <img
                      src="/detail/images/arrow.svg"
                      alt="Back"
                      className="w-4 h-4 mr-1"
                    />
                    Ramu Narasinga
                  </button>
                  <h1 className="cursor-pointer text-3xl font-bold leading-tight">
                    1:1 Mentorship
                  </h1>
                </div>
                <img
                  src="/detail/images/ramu.svg"
                  alt="Profile"
                  className="cursor-pointer w-24 h-24 rounded-full object-cover"
                />
              </div>
            

            {/* Tags */}
            <div className="flex flex-wrap gap-4 px-2 justify-start bg-secondary">
              <span className="cursor-pointer flex items-center gap-2 bg-secondary text-xs font-medium border rounded-full px-2 py-2">
                <img
                  src="/detail/images/Vector.svg"
                  alt="Mentorship"
                  className="w-4 h-4"
                />
                1:1 Mentorship
              </span>
              <span className="cursor-pointer flex items-center gap-2 text-xs font-medium border rounded-full px-2 py-2">
                <img
                  src="/detail/images/Vector.svg"
                  alt="Solution Architecture"
                  className="w-4 h-4"
                />
                Solution Architecture
              </span>
              <span className="cursor-pointer flex items-center gap-2 text-xs font-medium border rounded-full px-2 py-2">
                <img
                  src="/detail/images/Vector.svg"
                  alt="Gen AI"
                  className="w-4 h-4"
                />
                Gen AI
              </span>
            </div>
            </div>
            {/* Pricing & Meeting */}
            <div className="grid grid-cols-2 text-center border-t border-gray-200 pt-6 px-6">
              <div className="flex flex-col items-center border-r border-gray-200">
                <p className="text-lg font-bold flex items-center pt-4">
                  <img
                    src="/detail/images/currency.svg"
                    alt="Price"
                    className="w-5 h-5 mr-2"
                  />
                  500+
                </p>
                <p className="text-sm text-gray-500">INR</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-lg font-bold flex items-center pt-4">
                  <img
                    src="/detail/images/calendar.svg"
                    alt="Duration"
                    className="w-5 h-5 mr-2"
                  />
                  30 min meeting
                </p>
                <p className="text-sm text-gray-500">Session Duration</p>
              </div>
            </div>

            {/* Description */}
            <div className="text-gray-700 space-y-5 text-[15px] px-2 pt-8">
              <p>
                Feeling unprepared and anxious about your upcoming interview?
                Don't let stress hold you back. Book a 1:1 mentorship call with
                me and get actionable strategies tailored to help you
                confidently ace any interview.
              </p>
              <p className='pt-4'>
                I'm a seasoned DevOps Engineer with hands-on experience in
                automating CI/CD pipelines and building robust cloud
                infrastructures. My expertise includes AWS, Terraform, Linux,
                Docker, and Jenkins — tools that are crucial in today’s tech
                world.
              </p>
              <p  className='pt-4 pb-4'>During our session, you'll get:</p>
              <ul className="list-disc list-inside space-y-4 px-4">
                <li>
                  <strong>Customized Guidance:</strong> Advice tailored to your
                  career goals.
                </li>
                <li>
                  <strong>Practical Strategies:</strong> Tools and techniques to
                  boost your confidence and performance.
                </li>
                <li>
                  <strong>Real-World Insights:</strong> Industry-driven tips for
                  DevOps and cloud roles.
                </li>
                <li>
                  <strong>Interview Mastery:</strong> Help to clearly
                  communicate your skills and experience.
                </li>
              </ul>
              <p  className='pt-4 pb-4'>
                Imagine walking into your interview prepared, confident, and
                ready to make a strong impression. Let’s tackle your challenges
                and turn them into your strengths!
              </p>
              <p>
                Ready to unlock your potential? Schedule your 1:1 mentorship
                session today.
              </p>
            </div>

            {/* Testimonials */}
            <div className="mt-6 px-2 pb-8">
              <h2 className="text-2xl font-bold mb-6">Testimonials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-3xl p-4 bg-secondary text-gray-600">
                  "Thanks for your response, I appreciate it!"
                </div>
                <div className="border rounded-3xl p-4 bg-secondary text-gray-600">
                  "He was straightforward and honest about being in a different
                  sector. Appreciated the clarity!"
                </div>
                
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Right Side - Empty */}
        <div className="flex-1 h-full">
          <div className="w-full h-full">
          <GotQuestion />
        </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetail;
