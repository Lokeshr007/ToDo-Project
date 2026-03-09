// frontend/src/features/help/pages/Help.jsx
import { BookOpen, Mail, HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Help Center</h1>
        <p className="text-slate-400 mb-8">How can we help you today?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Getting Started */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
              <BookOpen size={24} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Getting Started</h3>
            <p className="text-sm text-slate-400 mb-4">Learn the basics of TaskFlow</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Read documentation →
            </button>
          </div>

          {/* FAQs */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="p-3 bg-yellow-500/20 rounded-lg w-fit mb-4">
              <HelpCircle size={24} className="text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">FAQs</h3>
            <p className="text-sm text-slate-400 mb-4">Find answers to common questions</p>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View FAQs →
            </button>
          </div>

          {/* Contact Support */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="p-3 bg-green-500/20 rounded-lg w-fit mb-4">
              <Mail size={24} className="text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
            <p className="text-sm text-slate-400 mb-4">Get help from our team</p>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium">
              Send message →
            </button>
          </div>

          {/* Quick Tips */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
              <BookOpen size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Use keyboard shortcuts for faster navigation</li>
              <li>• Create projects to organize your tasks</li>
              <li>• Set reminders for important deadlines</li>
              <li>• Try AI Assistant for study plans</li>
            </ul>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Still need help?</h2>
          <p className="text-slate-400 mb-6">Send us a message and we'll get back to you within 24 hours.</p>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Select topic</option>
              <option>Account Issues</option>
              <option>Technical Support</option>
              <option>Billing Questions</option>
              <option>Feature Request</option>
              <option>Other</option>
            </select>
            <textarea
              placeholder="Describe your issue..."
              rows="4"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Help;
