import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about A7Satta.co - India's fastest platform for live A7 Satta results.",
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">About A7Satta.co</h1>

        <div className="space-y-5 text-sm md:text-base text-gray-600 leading-relaxed">
          <p>
            <strong className="text-gray-900">A7Satta.co</strong> is one of the fastest and most reliable platforms for checking live A7 Satta results online. We provide real-time updates for over 100+ games including Gali, Desawar, Ghaziabad, Faridabad, Shri Ganesh, Delhi Bazar and many more regional markets.
          </p>

          <h2 className="text-xl font-bold text-gray-900 pt-2">Our Mission</h2>
          <p>
            Our goal is to provide accurate, instant, and free access to A7 Satta results. We understand that timing matters, which is why our platform is built to deliver results the exact moment they are officially declared.
          </p>

          <h2 className="text-xl font-bold text-gray-900 pt-2">What We Offer</h2>
          <ul className="list-none space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
              <span><strong className="text-gray-900">Live Results:</strong> Real-time updates for 100+ games across India.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
              <span><strong className="text-gray-900">Chart Records:</strong> Comprehensive monthly chart records from 2015 to {new Date().getFullYear()}.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
              <span><strong className="text-gray-900">Mobile Friendly:</strong> Optimized for all devices — smartphones, tablets, and desktops.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">&#10003;</span>
              <span><strong className="text-gray-900">100% Free:</strong> No registration, no hidden charges, no ads blocking your results.</span>
            </li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 pt-2">Our Technology</h2>
          <p>
            A7Satta.co is powered by modern web technologies that ensure lightning-fast page loads and real-time data updates. Our automated systems continuously monitor official sources and update results within seconds of their declaration.
          </p>

          <h2 className="text-xl font-bold text-gray-900 pt-2">Important Notice</h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            A7Satta.co is strictly an informational website. We do not operate, promote, or facilitate any form of gambling, betting, or lottery. All data displayed is for informational and educational purposes only. Please follow the laws applicable in your region.
          </div>
        </div>
      </div>
    </div>
  );
}
