
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rag-50 to-rag-100 flex items-center justify-center">
      <Link
        to="/rag"
        className="px-8 py-4 bg-rag-900 text-white rounded-lg text-lg font-medium
                 hover:bg-rag-800 transform transition-all duration-200
                 hover:scale-105 focus:outline-none focus:ring-2 
                 focus:ring-rag-900 focus:ring-offset-2 shadow-lg"
      >
        PC On
      </Link>
    </div>
  );
};

export default Home;
