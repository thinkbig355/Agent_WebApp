
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-rag-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                isActive("/")
                  ? "border-rag-900 text-rag-900"
                  : "border-transparent text-rag-600 hover:text-rag-900 hover:border-rag-300"
              }`}
            >
              RAG
            </Link>
            <Link
              to="/browser-use"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                isActive("/browser-use")
                  ? "border-rag-900 text-rag-900"
                  : "border-transparent text-rag-600 hover:text-rag-900 hover:border-rag-300"
              }`}
            >
              Browser Use
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
