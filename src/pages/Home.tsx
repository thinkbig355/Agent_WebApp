import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Power, Loader2, CheckCircle, XCircle, Activity, Terminal } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const Home: React.FC = () => {
  const [pcStatus, setPcStatus] = useState<"unknown" | "on" | "off">("unknown");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [turningOn, setTurningOn] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const checkPcStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch("https://ushapangeni.com.np/pc_status");
      if (response.ok) {
        setPcStatus("on");
      } else {
        setPcStatus("off");
      }
    } catch (error) {
      setPcStatus("off");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkPcStatus(); // Check status on initial load
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Notification disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePcOnOff = async () => {
    setTurningOn(true);

    // --- Supabase Update (FIRST) ---
    try {
      const { data, error } = await supabase
        .from("PC_status")
        .upsert({ id: 1, pc_status: true })
        .eq("id", 1)
        .select();

      if (error) {
        console.error("Supabase Error:", error.message);
        setTurningOn(false); // Stop loading if Supabase update fails
        setNotification({ message: "Failed to communicate with PC. Try again!", type: "error" });
        return;
      }

      if (!data || data.length === 0) {
        console.warn("Update/Insert returned no data.");
        setTurningOn(false);
        setNotification({ message: "Failed to communicate with PC. Try again!", type: "error" });
        return;
      }
      console.log("Status updated:", data[0].pc_status);

    } catch (err) {
      console.error("Unexpected error:", err);
      setTurningOn(false);
      setNotification({ message: "Failed to communicate with PC. Try again!", type: "error" });
      return;
    }

    // --- THEN, wait 35 seconds, and THEN start repeated checks ---
    setTimeout(() => {
        let checkCount = 0;
        const totalChecks = (60-35)/5 + 1;

        const intervalId = setInterval(async () => {
            checkCount++;

            if(checkCount > totalChecks) {
                clearInterval(intervalId);
                setTurningOn(false);
                 if (pcStatus !== "on") { // Only show error if still off after all checks
                    setNotification({ message: "Failed to turn on PC after multiple attempts.", type: "error" });
                    setPcStatus("off")
                }
                return;
            }

            try{
                const response = await fetch("https://ushapangeni.com.np/pc_status");
                if(response.ok){
                    setPcStatus("on");
                    setNotification({message: "PC is On!", type: "success"});
                    clearInterval(intervalId);
                    setTurningOn(false);
                } else {
                    if(checkCount === totalChecks){
                        setPcStatus("off");
                    }
                }
            } catch (error){
                if(checkCount === totalChecks){
                        setPcStatus("off");
                    }
            }

        }, 5000);

    }, 35000); // Wait 35 seconds *before* starting the interval
  };

  // Pulse animation for the status indicator
  const pulseVariants = {
    on: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    off: {
      scale: 1,
      opacity: 0.7
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#B8C5E9] to-[#5B6BA9] to-[#1E2A5A] font-sans p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-[#4B63C8]/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-[#2D3A8C]/20 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 bg-[#1A2140]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#2D3A8C]/20 p-8 md:p-12 text-center space-y-10 w-full max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A5B4FC] to-[#818CF8]">
              The backend server is PC-hosted; ensure it's running.
            </p>
          </motion.div>

          <div className="flex flex-col items-center space-y-8">
            {/* Status indicator */}
            <motion.div
              className="flex items-center justify-center space-x-4 bg-[#111633]/80 backdrop-blur-md px-8 py-4 rounded-2xl border border-[#2D3A8C]/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex items-center">
                <motion.div
                  variants={pulseVariants}
                  animate={pcStatus === "on" ? "on" : "off"}
                  className={`h-4 w-4 rounded-full mr-3 ${
                    pcStatus === "on"
                      ? "bg-[#4ADE80]"
                      : pcStatus === "off"
                      ? "bg-[#F87171]"
                      : "bg-[#9CA3AF]"
                  }`}
                />
                <span className="text-xl font-medium text-[#E2E8F0]">
                  Status: {" "}
                  <span
                    className={`font-semibold ${
                      pcStatus === "on"
                        ? "text-[#4ADE80]"
                        : pcStatus === "off"
                        ? "text-[#F87171]"
                        : "text-[#9CA3AF]"
                    }`}
                  >
                    {pcStatus === "on" ? "Online" : pcStatus === "off" ? "Offline" : "Unknown"}
                  </span>
                </span>
              </div>
              {loadingStatus && (
                <Loader2 className="animate-spin h-5 w-5 text-[#A5B4FC]" />
              )}
            </motion.div>

            {/* Power button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-[#5B6BA9]/70 to-[#6366F1]/70 rounded-full opacity-50 blur-lg"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [0.95, 1, 0.95]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" }}
                whileTap={{
                  scale: 0.95,
                  boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                onClick={handlePcOnOff}
                disabled={turningOn}
                className="relative z-10 px-10 py-5 bg-gradient-to-br from-[#6366F1]/80 to-[#4F46E5]/80 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ mixBlendMode: "overlay" }}
                />
                <motion.div className="relative z-10 flex items-center">
                  {turningOn ? (
                    <>
                      <Loader2 className="animate-spin h-6 w-6 mr-3" />
                      <span className="font-medium tracking-wide">INITIALIZING...</span>
                    </>
                  ) : (
                    <>
                      <Power className="h-6 w-6 mr-3" />
                      <span className="font-medium tracking-wide">Power On/Off</span>
                    </>
                  )}
                </motion.div>
              </motion.button>
            </motion.div>

            {/* System metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-[#111633]/80 backdrop-blur-md rounded-xl p-4 border border-[#2D3A8C]/30">
                <Activity className="h-5 w-5 text-[#A5B4FC] mb-2" />
                <p className="text-sm text-[#A5B4FC]">System</p>
                <p className="text-lg font-medium text-[#E2E8F0]">{pcStatus === "on" ? "Active" : "Standby"}</p>
              </div>
              <div className="bg-[#111633]/80 backdrop-blur-md rounded-xl p-4 border border-[#2D3A8C]/30">
                <Activity className="h-5 w-5 text-[#A5B4FC] mb-2" />
                <p className="text-sm text-[#A5B4FC]">Connection</p>
                <p className="text-lg font-medium text-[#E2E8F0]">{pcStatus === "on" ? "Secure" : "Waiting"}</p>
              </div>
              <div className="bg-[#111633]/80 backdrop-blur-md rounded-xl p-4 border border-[#2D3A8C]/30">
                <Activity className="h-5 w-5 text-[#A5B4FC] mb-2" />
                <p className="text-sm text-[#A5B4FC]">Services</p>
                <p className="text-lg font-medium text-[#E2E8F0]">{pcStatus === "on" ? "Running" : "Offline"}</p>
              </div>
            </motion.div>
          </div>

          {/* Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -20, x: "-50%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`fixed top-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl z-50 flex items-center ${
                  notification.type === "success"
                    ? "bg-gradient-to-r from-[#059669]/90 to-[#10B981]/90 text-white"
                    : "bg-gradient-to-r from-[#DC2626]/90 to-[#EF4444]/90 text-white"
                } backdrop-blur-md border border-white/10`}
              >
                {notification.type === "success"
                  ? <CheckCircle className="h-5 w-5 mr-2" />
                  : <XCircle className="h-5 w-5 mr-2" />
                }
                <span className="font-medium">{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;