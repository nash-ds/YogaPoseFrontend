
import { Link } from "react-router-dom";
import { Github, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ZenPose<span className="text-primary">Harmony</span></h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Elevate your yoga practice with AI-powered pose guidance, real-time feedback, and personalized audio cues.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Yoga Library
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Practice History
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://github.com/shlok-sm/yoga" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} ZenPoseHarmony. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
