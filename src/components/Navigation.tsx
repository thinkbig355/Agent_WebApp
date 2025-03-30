import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const Navigation = () => {
  const location = useLocation();
  const [ragDropdownOpen, setRagDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const isRagActive = () => location.pathname.startsWith("/rag");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRagDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when navigating
  useEffect(() => {
    setRagDropdownOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-[#0F1522]/80 backdrop-blur-sm border-b border-[#2D3A8C]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                isActive("/")
                  ? "border-[#A5B4FC] text-[#FFFFFF]"
                  : "border-transparent text-[#A9B4C2] hover:text-[#FFFFFF] hover:border-[#3A9BA4]"
              }`}
            >
              Home
            </Link>

            {/* RAG dropdown section */}
            <div className="relative inline-block" ref={dropdownRef}>
              <div
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors cursor-pointer ${
                  isRagActive()
                    ? "border-[#A5B4FC] text-[#FFFFFF]"
                    : "border-transparent text-[#A9B4C2] hover:text-[#FFFFFF] hover:border-[#3A9BA4]"
                }`}
                onMouseEnter={() => setRagDropdownOpen(true)}
                onClick={() => setRagDropdownOpen(!ragDropdownOpen)}
              >
                RAG
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${ragDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {ragDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-[#1A2233] border border-[#2D3A8C]/20 rounded-md shadow-lg z-10">
                  <Link
                    to="/rag/add-files"
                    className={`block px-4 py-2 text-sm text-[#A9B4C2] hover:bg-[#2A3548] hover:text-[#FFFFFF] ${
                      isActive("/rag/add-files") ? "bg-[#2A3548] text-[#FFFFFF]" : ""
                    }`}
                  >
                    Add Files
                  </Link>
                  <Link
                    to="/rag/chat"
                    className={`block px-4 py-2 text-sm text-[#A9B4C2] hover:bg-[#2A3548] hover:text-[#FFFFFF] ${
                      isActive("/rag/chat") ? "bg-[#2A3548] text-[#FFFFFF]" : ""
                    }`}
                  >
                    Chat
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/browser-use"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                isActive("/browser-use")
                  ? "border-[#A5B4FC] text-[#FFFFFF]"
                  : "border-transparent text-[#A9B4C2] hover:text-[#FFFFFF] hover:border-[#3A9BA4]"
              }`}
            >
              Browser Use
            </Link>

            <Link
              to="/sounds"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                isActive("/sounds")
                  ? "border-[#A5B4FC] text-[#FFFFFF]"
                  : "border-transparent text-[#A9B4C2] hover:text-[#FFFFFF] hover:border-[#3A9BA4]"
              }`}
            >
              Sounds
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;