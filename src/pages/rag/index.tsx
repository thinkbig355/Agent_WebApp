// src/pages/rag/index.tsx  (This file stays as it is)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RagIndex = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Add Files page
    navigate("/rag/add-files");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rag-50 to-rag-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-rag-900 mb-2">RAG System Interface</h1>
          <p className="text-rag-600">Redirecting to Add Files page...</p>
        </div>
      </div>
    </div>
  );
};

export default RagIndex;