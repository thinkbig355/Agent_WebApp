// Home.tsx
import { supabase } from "../lib/supabaseClient";

const Home = () => {
  const updateStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("PC_status")
        .upsert({ id: 1, pc_status: true }) // Use upsert
        .eq("id", 1) // Keep .eq() for consistency
        .select(); // Keep .select() to get the updated/inserted row


      if (error) {
        console.error("Supabase Error:", error.message);
        console.error("Error Code:", error.code);
        console.error("Error Details:", error.details);
        console.error("Error Hint:", error.hint);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("Update/Insert returned no data. This should not happen with the service role key.");
        return;
      }

      console.log("Status updated:", data[0].pc_status); // Log updated status

    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rag-50 to-rag-100 flex items-center justify-center">
      <button
        onClick={updateStatus}
        className="px-8 py-4 bg-rag-900 text-white rounded-lg text-lg font-medium
                   hover:bg-rag-800 transform transition-all duration-200
                   hover:scale-105 focus:outline-none focus:ring-2 
                   focus:ring-rag-900 focus:ring-offset-2 shadow-lg"
      >
        PC On
      </button>
    </div>
  );
};

export default Home;