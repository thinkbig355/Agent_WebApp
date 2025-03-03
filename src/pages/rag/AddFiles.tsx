import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, Link as LinkIcon, File, DownloadCloud, PlayCircle } from "lucide-react";

interface URLProcessingResult {
  url: string;
  status: string;
  content_type?: string;
  characters?: number | string;
  filename?: string;
  error?: string;
  file_path?: string;
  type?: 'sync'; // Add type for sync logs
  log?: string;   // Add log for sync messages
}

interface NicheOption {
  value: string;
  label: string;
}

const AddFiles = () => {
  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]); // Separate sync logs
  const [error, setError] = useState<string | null>(null);
  const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);
  const [results, setResults] = useState<URLProcessingResult[]>([]); // Unified results
  const [mode, setMode] = useState<'process' | 'extract' | 'youtube'>('process');
  const [input, setInput] = useState(""); // Unified input for URLs/YouTube URL
  const [selectedNiche, setSelectedNiche] = useState("");
  const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
  const [extractedPdfCount, setExtractedPdfCount] = useState(0); // Keep count

    const fetchNiches = useCallback(async () => {
    try {
      const response = await fetch("https://ushapangeni.com.np/get-niches");
      const data = await response.json();

      if (data.success) {
        const niches = data.niches.map((niche: string) => ({
          value: niche,
          label: niche.charAt(0).toUpperCase() + niche.slice(1).replace('_', ' ')
        }));
        setAvailableNiches([
          { value: "all", label: "All Niches" },
          ...niches
        ]);
      } else {
        setError(data.error || "Failed to fetch niches");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching niches");
    }
  }, []);

  useEffect(() => {
    fetchNiches();
  }, [fetchNiches]);

  const syncDocuments = async () => {
    setLoading(true);
    setError(null);
    setSyncLogs([]); // Clear previous sync logs
    try {
      const response = await fetch("https://ushapangeni.com.np/process-documents", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setSyncLogs(data.results.logs);
      }
      else setError(data.error || "An unknown error occurred during document sync.");
    } catch (err: any) {
      setError(err.message || "An error occurred during document sync.");
    } finally {
      setLoading(false);
    }
  };

  const processInput = async () => {
    if (!input.trim()) {
      setError("Please enter input");
      return;
    }
    if (!selectedNiche || selectedNiche === "all") {
      setError("Please select a specific niche");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSyncLogs([]); // Clear previous sync logs

    try {
      let endpoint = "";
      let body: any = { niche: selectedNiche };

      if (mode === 'process') {
        endpoint = "https://ushapangeni.com.np/process-urls";
        body.urls = input.split(/[\n,\s]+/).map(url => url.trim()).filter(url => url.length > 0);
      } else if (mode === 'extract') {
        endpoint = "https://ushapangeni.com.np/extract-pdfs";
        body.url = input;
      } else if (mode === 'youtube') {
        endpoint = "https://ushapangeni.com.np/process-youtube";
        body.url = input;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (mode === 'extract') {
          setExtractedPdfCount(data.count)
        }
        // Separate processing results and sync logs
        const processingResults = data.results.filter((result: URLProcessingResult) => !result.type);
        const syncLogs = data.results.filter((result: URLProcessingResult) => result.type === 'sync').map((result: URLProcessingResult) => result.log);

        setResults(processingResults);
        setSyncLogs(syncLogs as string[]);

      } else {
        setError(data.error || `An unknown error occurred during ${mode} processing.`);
      }
    } catch (err: any) {
      setError(err.message || `An error occurred during ${mode} processing.`);
    } finally {
      setLoading(false);
    }
  };
  const placeholderText = () => {
    if (mode === 'process') {
      return "https://example.com/article1\nhttps://example.com/article2\nhttps://example.com/document.pdf";
    } else if (mode === 'extract') {
      return "https://example.com";
    } else if (mode === 'youtube') {
      return "https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/playlist?list=...";
    }
    return ""; // Should never happen, but good practice
  };

  const inputLabel = () => {
    if (mode === 'process') {
      return "Paste URLs (Space-separated, comma-separated, or one URL per line.)";
    } else if (mode === 'extract') {
      return "Enter URL";
    } else if (mode === 'youtube') {
      return "Enter YouTube URLs (Space-separated, comma-separated, or one URL per line)";
    }
    return "";
  };
  const getIcon = () => {
    if (mode === 'process') return <LinkIcon className="mr-2 h-4 w-4" />;
    if (mode === 'extract') return <DownloadCloud className="mr-2 h-4 w-4" />;
    if (mode === 'youtube') return <PlayCircle className="mr-2 h-4 w-4" />;
    return null; // Should never reach here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#B8C5E9] to-[#5B6BA9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E2A5A] to-[#5B6BA9] mb-2">
              Add Files to RAG System
            </h1>
            <p className="text-[#1E2A5A]">Process URLs, PDFs, and YouTube Videos</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 space-y-6 border border-[#B8C5E9]/50">
            {/* Mode Toggle */}
            <div className="flex justify-center space-x-4">
              <button onClick={() => setMode('process')} className={`px-6 py-2 rounded-lg transition-colors ${mode === 'process' ? 'bg-[#1E2A5A] text-white' : 'bg-[#F0F4FF] text-[#1E2A5A] hover:bg-[#B8C5E9]'}`}>Process URLs</button>
              <button onClick={() => setMode('extract')} className={`px-6 py-2 rounded-lg transition-colors ${mode === 'extract' ? 'bg-[#1E2A5A] text-white' : 'bg-[#F0F4FF] text-[#1E2A5A] hover:bg-[#B8C5E9]'}`}>Extract PDFs</button>
              <button onClick={() => setMode('youtube')} className={`px-6 py-2 rounded-lg transition-colors ${mode === 'youtube' ? 'bg-[#1E2A5A] text-white' : 'bg-[#F0F4FF] text-[#1E2A5A] hover:bg-[#B8C5E9]'}`}>YouTube</button>
            </div>

            <div className="bg-[#F0F4FF] rounded-lg p-6 border border-[#B8C5E9]/50">
              <h2 className="text-xl font-semibold text-[#1E2A5A] mb-4">
                {mode === 'process' ? 'Process URLs' : mode === 'extract' ? 'Extract PDFs from URL' : 'YouTube Transcription'}
              </h2>
              <div className="space-y-4">
                {/* Niche Selection */}
                <div className="relative">
                  <label className="block text-[#1E2A5A] mb-2">Select Niche</label>
                  <div className="w-full p-3 border border-[#B8C5E9] rounded-lg bg-white flex items-center justify-between cursor-pointer" onClick={() => setNicheDropdownOpen(!nicheDropdownOpen)}>
                    <span>{selectedNiche ? availableNiches.find(n => n.value === selectedNiche)?.label || selectedNiche : "Select a niche"}</span>
                    <svg className="w-4 h-4 text-[#1E2A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {nicheDropdownOpen && (
                    <div className="absolute mt-1 w-full bg-white border border-[#B8C5E9] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {availableNiches.filter(niche => niche.value !== "all").map(niche => (
                        <div key={niche.value} className="flex items-center px-4 py-2 hover:bg-[#F0F4FF] cursor-pointer"
                          onClick={() => { setSelectedNiche(niche.value); setNicheDropdownOpen(false); }}>
                          <div className="w-5 h-5 border border-[#B8C5E9] rounded flex items-center justify-center mr-3">
                            {selectedNiche === niche.value && <Check className="w-4 h-4 text-[#5B6BA9]" />}
                          </div>
                          <span>{niche.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unified Input */}
                <div>
                  <label className="block text-[#1E2A5A] mb-2">{inputLabel()}</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholderText()}
                    disabled={loading}
                    className="w-full min-h-[100px] p-4 rounded-lg border border-[#B8C5E9] bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#5B6BA9] focus:border-transparent resize-none transition-all duration-200 ease-in-out disabled:opacity-50"
                  />
                </div>

                {/* Unified Process Button */}
                <div className="flex justify-end">
                  <button onClick={processInput} disabled={loading} className="inline-flex items-center px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#5B6BA9] transition-colors disabled:opacity-50">
                    {loading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : getIcon()}
                    {mode === 'process' ? 'Process URLs' : mode === 'extract' ? 'Extract PDFs' : 'Process YouTube Video'}
                  </button>
                </div>

                {/* Unified Results Display */}
                {(results.length > 0) && (
                  <div className="mt-4">
                    <h3 className="font-medium text-[#1E2A5A] mb-2">{mode === 'extract' ? `Extracted PDFs: ${extractedPdfCount}` : "Processing Results:"}</h3>
                    <div className="bg-white rounded-lg border border-[#B8C5E9] overflow-hidden">
                      <table className="min-w-full divide-y divide-[#B8C5E9]">
                        <thead className="bg-[#F0F4FF]">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">
                              URL
                            </th>
                            {(mode !== 'youtube') && <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">Type</th>}

                            {(mode !== 'youtube') && <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">
                              Size
                            </th>}
                            {mode === 'youtube' && <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">File</th>}
                            <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#B8C5E9]">
                          {results.map((result, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-[#1E2A5A] truncate max-w-[200px]">
                                {result.url}
                              </td>

                              {(mode !== 'youtube') && <td className="px-4 py-2 text-sm text-[#1E2A5A]">{result.content_type || "unknown"}</td>}

                              {(mode !== 'youtube') && <td className="px-4 py-2 text-sm text-[#1E2A5A]">
                                {result.characters
                                  ? typeof result.characters === 'number'
                                    ? `${result.characters} chars`
                                    : `${Math.round(parseInt(result.characters as string) / 1024)} KB`
                                  : "unknown"}
                              </td>}
                              {mode === 'youtube' && <td className="px-4 py-2 text-sm text-[#1E2A5A]"><a href={result.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.filename}</a></td>}
                              <td className="px-4 py-2 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${result.status === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                  {result.status === 'success' ? 'Success' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sync Documents Button */}
            <div className="flex justify-end">
              <button
                onClick={syncDocuments}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#5B6BA9] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sync Documents
              </button>
            </div>

             {/* Document Processing Logs */}
                {syncLogs.length > 0 && (
                  <div className="bg-[#F0F4FF] rounded-lg p-4 border border-[#B8C5E9] max-h-60 overflow-y-auto">
                    <h4 className="font-medium text-[#1E2A5A] mb-2">Document Processing Logs:</h4>
                    <ul className="space-y-1">
                      {syncLogs.map((log, index) => (
                        <li key={index} className="text-sm text-[#1E2A5A]">{log}</li>
                      ))}
                    </ul>
                  </div>
                )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFiles;