
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t dark:bg-gray-900 dark:border-gray-800">
      <div className="quiz-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">LearnSphere</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The modern platform for creating and taking online quizzes with ease.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-400">
                Email: support@learnsphere.com
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Phone: +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} LearnSphere. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
