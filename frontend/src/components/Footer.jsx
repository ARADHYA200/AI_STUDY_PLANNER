import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          <div>
            <h4 className="text-white text-xl font-semibold mb-4">StudyAI</h4>
            <p className="text-sm leading-relaxed">
              AI-powered study planning that helps you learn smarter, stay consistent, and achieve your goals.
            </p>
          </div>

          <div>
            <h4 className="text-white text-lg font-medium mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white transition cursor-pointer">Dashboard</li>
              <li className="hover:text-white transition cursor-pointer">Analytics</li>
              <li className="hover:text-white transition cursor-pointer">Docs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-lg font-medium mb-4">Contact</h4>
            <p className="text-sm">support@studyai.app</p>
            <p className="text-sm mt-2">Built with intention ✨</p>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-sm">
        © {currentYear} StudyAI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;