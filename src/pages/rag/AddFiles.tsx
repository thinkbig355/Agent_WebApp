import { useState, useEffect } from "react";
import { Loader2, Check, Link as LinkIcon, File, DownloadCloud } from "lucide-react";

// URL processing results interface
interface URLProcessingResult {
    url: string;
    status: string;
    content_type?: string;
    characters?: number | string;
    filename?: string;
    error?: string;
}

// Niche option interface
interface NicheOption {
    value: string;
    label: string;
}

const AddFiles = () => {
    // State variables for Add Files page
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);

    // URL processing states
    const [urls, setUrls] = useState("");
    const [urlProcessingResults, setUrlProcessingResults] = useState<URLProcessingResult[]>([]);
    const [isProcessingUrls, setIsProcessingUrls] = useState(false);
    const [selectedUrlNiche, setSelectedUrlNiche] = useState("");
    const [urlNicheDropdownOpen, setUrlNicheDropdownOpen] = useState(false);

    // PDF Extraction States
    const [pdfExtractionUrl, setPdfExtractionUrl] = useState("");
    const [isExtractingPdfs, setIsExtractingPdfs] = useState(false);
    const [pdfExtractionResults, setPdfExtractionResults] = useState<URLProcessingResult[]>([]);  // Reuse the same interface
    const [extractedPdfCount, setExtractedPdfCount] = useState(0);
    const [selectedPdfNiche, setSelectedPdfNiche] = useState("");
    const [pdfNicheDropdownOpen, setPdfNicheDropdownOpen] = useState(false);

    // Toggle for switching between modes
    const [mode, setMode] = useState<'process' | 'extract'>('process'); // 'process' for current URL processing, 'extract' for PDF extraction

    // Fetch niches on component mount
    useEffect(() => {
        fetchNiches();
    }, []);

    // Function to fetch niches
    const fetchNiches = async () => {
        try {
            const response = await fetch("https://ushapangeni.com.np/get-niches"); // Changed URL
            const data = await response.json();

            if (data.success) {
                // Create niche options with proper capitalization
                const niches = data.niches.map((niche: string) => ({
                    value: niche,
                    label: niche.charAt(0).toUpperCase() + niche.slice(1).replace('_', ' ')
                }));

                // Add the "All" option
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
    };

    // Function to sync documents
    const syncDocuments = async () => {
        setLoading(true);
        setError(null); // Clear any previous errors
        setLogs([]); // Clear previous logs

        try {
            const response = await fetch("https://ushapangeni.com.np/process-documents", { // Changed URL
                method: "POST",
            });

            const data = await response.json();

            if (data.success) {
                setLogs(data.results.logs);
            } else {
                setError(data.error || "An unknown error occurred during document sync.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during document sync.");
        } finally {
            setLoading(false);
        }
    };

    // Function to process URLs
    const processUrls = async () => {
        // Validate inputs
        if (!urls.trim()) {
            setError("Please enter at least one URL");
            return;
        }

        if (!selectedUrlNiche || selectedUrlNiche === "all") {
            setError("Please select a specific niche for the URLs");
            return;
        }

        setIsProcessingUrls(true);
        setError(null);
        setUrlProcessingResults([]);

        try {
            // Split the URLs by newlines, commas, or spaces
            const urlList = urls
                .split(/[\n,\s]+/)
                .map(url => url.trim())
                .filter(url => url.length > 0);

            const response = await fetch("https://ushapangeni.com.np/process-urls", { // Changed URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    urls: urlList,
                    niche: selectedUrlNiche,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setUrlProcessingResults(data.results);
            } else {
                setError(data.error || "An unknown error occurred during URL processing.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during URL processing.");
        } finally {
            setIsProcessingUrls(false);
        }
    };

    // Function to extract PDFs
    const extractPdfs = async () => {
        if (!pdfExtractionUrl.trim()) {
            setError("Please enter a URL");
            return;
        }
        if (!selectedPdfNiche || selectedPdfNiche === "all") {
          setError("Please select a specific niche for the PDFs");
          return;
        }

        setIsExtractingPdfs(true);
        setError(null);
        setPdfExtractionResults([]);
        setExtractedPdfCount(0);

        try {
            const response = await fetch("https://ushapangeni.com.np/extract-pdfs", { // Changed URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: pdfExtractionUrl,
                    niche: selectedPdfNiche,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setPdfExtractionResults(data.results);
                setExtractedPdfCount(data.count);
            } else {
                setError(data.error || "An unknown error occurred during PDF extraction.");
            }

        } catch (err: any) {
            setError(err.message || "An error occurred during PDF extraction.");
        } finally {
            setIsExtractingPdfs(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#B8C5E9] to-[#5B6BA9] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E2A5A] to-[#5B6BA9] mb-2">Add Files to RAG System</h1>
                        <p className="text-[#1E2A5A]">Process URLs and manage your document collection</p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 space-y-6 border border-[#B8C5E9]/50">

                        {/* Mode Toggle */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setMode('process')}
                                className={`px-6 py-2 rounded-lg transition-colors ${mode === 'process'
                                        ? 'bg-[#1E2A5A] text-white'
                                        : 'bg-[#F0F4FF] text-[#1E2A5A] hover:bg-[#B8C5E9]'
                                    }`}
                            >
                                Process URLs
                            </button>
                            <button
                                onClick={() => setMode('extract')}
                                className={`px-6 py-2 rounded-lg transition-colors ${mode === 'extract'
                                        ? 'bg-[#1E2A5A] text-white'
                                        : 'bg-[#F0F4FF] text-[#1E2A5A] hover:bg-[#B8C5E9]'
                                    }`}
                            >
                                Extract PDFs from URL
                            </button>
                        </div>

                        {/* URL Processing Section */}
                        {mode === 'process' && (
                            <div className="bg-[#F0F4FF] rounded-lg p-6 border border-[#B8C5E9]/50">
                                <h2 className="text-xl font-semibold text-[#1E2A5A] mb-4">Process URLs</h2>
                                <div className="space-y-4">
                                    {/* Niche selection for URLs */}
                                    <div className="relative">
                                        <label className="block text-[#1E2A5A] mb-2">Select Niche for URLs</label>
                                        <div
                                            className="w-full p-3 border border-[#B8C5E9] rounded-lg bg-white flex items-center justify-between cursor-pointer"
                                            onClick={() => setUrlNicheDropdownOpen(!urlNicheDropdownOpen)}
                                        >
                                            <span>
                                                {selectedUrlNiche ?
                                                    availableNiches.find(n => n.value === selectedUrlNiche)?.label || selectedUrlNiche :
                                                    "Select a niche"}
                                            </span>
                                             <svg className="w-4 h-4 text-[#1E2A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {urlNicheDropdownOpen && (
                                           <div className="absolute mt-1 w-full bg-white border border-[#B8C5E9] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                                {availableNiches
                                                    .filter(niche => niche.value !== "all") // Exclude "all" option for URL processing
                                                    .map(niche => (
                                                        <div
                                                            key={niche.value}
                                                            className="flex items-center px-4 py-2 hover:bg-[#F0F4FF] cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedUrlNiche(niche.value);
                                                                setUrlNicheDropdownOpen(false);
                                                            }}
                                                        >
                                                            <div className="w-5 h-5 border border-[#B8C5E9] rounded flex items-center justify-center mr-3">
                                                                {selectedUrlNiche === niche.value && <Check className="w-4 h-4 text-[#5B6BA9]" />}
                                                            </div>
                                                            <span>{niche.label}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* URL input */}
                                    <div>
                                        <label className="block text-[#1E2A5A] mb-2">Paste URLs (Space-separated, comma-separated, or one URL per line.)</label>
                                        <textarea
                                            value={urls}
                                            onChange={(e) => setUrls(e.target.value)}
                                            placeholder="https://example.com/article1
https://example.com/article2
https://example.com/document.pdf"
                                            disabled={isProcessingUrls}
                                            className="w-full min-h-[100px] p-4 rounded-lg border border-[#B8C5E9]
                                   bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2
                                   focus:ring-[#5B6BA9] focus:border-transparent resize-none
                                   transition-all duration-200 ease-in-out
                                   disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Process URLs button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={processUrls}
                                            disabled={isProcessingUrls}
                                            className="inline-flex items-center px-4 py-2 bg-[#1E2A5A] text-white rounded-lg
                             hover:bg-[#5B6BA9] transition-colors disabled:opacity-50"
                                        >
                                            {isProcessingUrls ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <LinkIcon className="mr-2 h-4 w-4" />
                                            )}
                                            Process URLs
                                        </button>
                                    </div>

                                    {/* URL Processing Results */}
                                    {urlProcessingResults.length > 0 && (
                                        <div className="mt-4">
                                            <h3 className="font-medium text-[#1E2A5A] mb-2">Processing Results:</h3>
                                            <div className="bg-white rounded-lg border border-[#B8C5E9] overflow-hidden">
                                                <table className="min-w-full divide-y divide-[#B8C5E9]">
                                                    <thead className="bg-[#F0F4FF]">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">URL</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">Type</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">Size</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                   <tbody className="bg-white divide-y divide-[#B8C5E9]">
                                                        {urlProcessingResults.map((result, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 text-sm text-[#1E2A5A] truncate max-w-[200px]">{result.url}</td>
                                                                <td className="px-4 py-2 text-sm text-[#1E2A5A]">
                                                                    {result.content_type || "unknown"}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-[#1E2A5A]">
                                                                    {result.characters ?
                                                                        typeof result.characters === 'number' ?
                                                                            `${result.characters} chars` :
                                                                            `${Math.round(parseInt(result.characters as string) / 1024)} KB` :
                                                                        "unknown"}
                                                                </td>
                                                                <td className="px-4 py-2 text-sm">
                                                                    <span className={`px-2 py-1 rounded-full text-xs ${result.status === 'success' ?
                                                                            'bg-green-100 text-green-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}>
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
                        )}

                        {/* PDF Extraction Section */}
                        {mode === 'extract' && (
                            <div className="bg-[#F0F4FF] rounded-lg p-6 border border-[#B8C5E9]/50">
                                <h2 className="text-xl font-semibold text-[#1E2A5A] mb-4">Extract PDFs from URL</h2>
                                <div className="space-y-4">
                                    {/* Niche selection for PDFs */}
                                    <div className="relative">
                                        <label className="block text-[#1E2A5A] mb-2">Select Niche for PDFs</label>
                                        <div
                                            className="w-full p-3 border border-[#B8C5E9] rounded-lg bg-white flex items-center justify-between cursor-pointer"
                                            onClick={() => setPdfNicheDropdownOpen(!pdfNicheDropdownOpen)}
                                        >
                                            <span>
                                                {selectedPdfNiche ?
                                                    availableNiches.find(n => n.value === selectedPdfNiche)?.label || selectedPdfNiche :
                                                    "Select a niche"}
                                            </span>
                                           <svg className="w-4 h-4 text-[#1E2A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {pdfNicheDropdownOpen && (
                                            <div className="absolute mt-1 w-full bg-white border border-[#B8C5E9] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                                {availableNiches
                                                    .filter(niche => niche.value !== "all") // Exclude "all"
                                                    .map(niche => (
                                                        <div
                                                            key={niche.value}
                                                            className="flex items-center px-4 py-2 hover:bg-[#F0F4FF] cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedPdfNiche(niche.value);
                                                                setPdfNicheDropdownOpen(false);
                                                            }}
                                                        >
                                                            <div className="w-5 h-5 border border-[#B8C5E9] rounded flex items-center justify-center mr-3">
                                                                {selectedPdfNiche === niche.value && <Check className="w-4 h-4 text-[#5B6BA9]"/>}
                                                            </div>
                                                            <span>{niche.label}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* URL Input for PDF Extraction */}
                                    <div>
                                        <label className="block text-[#1E2A5A] mb-2">Enter URL</label>
                                        <input
                                            type="url"
                                            value={pdfExtractionUrl}
                                            onChange={(e) => setPdfExtractionUrl(e.target.value)}
                                            placeholder="https://example.com"
                                            disabled={isExtractingPdfs}
                                            className="w-full p-4 rounded-lg border border-[#B8C5E9] bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#5B6BA9] focus:border-transparent transition-all duration-200 ease-in-out disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Extract PDFs Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={extractPdfs}
                                            disabled={isExtractingPdfs}
                                            className="inline-flex items-center px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#5B6BA9] transition-colors disabled:opacity-50"
                                        >
                                            {isExtractingPdfs ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <DownloadCloud className="mr-2 h-4 w-4" />
                                            )}
                                            Extract PDFs
                                        </button>
                                    </div>

                                      {/* PDF Extraction Results */}
                                      {pdfExtractionResults.length > 0 && (
                                          <div className="mt-4">
                                              <h3 className="font-medium text-[#1E2A5A] mb-2">Extraction Results:</h3>
                                                <p className="text-[#1E2A5A] mb-2">Extracted PDFs: {extractedPdfCount}</p>
                                              <div className="bg-white rounded-lg border border-[#B8C5E9] overflow-hidden">

                                                  <table className="min-w-full divide-y divide-[#B8C5E9]">
                                                      <thead className="bg-[#F0F4FF]">
                                                          <tr>
                                                              <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">URL</th>
                                                              <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">Type</th>
                                                              <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">Size</th>
                                                              <th className="px-4 py-2 text-left text-xs font-medium text-[#1E2A5A] uppercase tracking-wider">Status</th>
                                                          </tr>
                                                      </thead>
                                                      <tbody className="bg-white divide-y divide-[#B8C5E9]">
                                                          {pdfExtractionResults.map((result, index) => (
                                                              <tr key={index}>
                                                                  <td className="px-4 py-2 text-sm text-[#1E2A5A] truncate max-w-[200px]">{result.url}</td>
                                                                  <td className="px-4 py-2 text-sm text-[#1E2A5A]">
                                                                      {result.content_type || "unknown"}
                                                                  </td>
                                                                  <td className="px-4 py-2 text-sm text-[#1E2A5A]">
                                                                   {result.characters ?
                                                                        typeof result.characters === 'number' ?
                                                                            `${result.characters} chars` :
                                                                            `${Math.round(parseInt(result.characters as string)/1024)} KB` : "unknown"}
                                                                    </td>
                                                                  <td className="px-4 py-2 text-sm">
                                                                      <span className={`px-2 py-1 rounded-full text-xs ${result.status === 'success' ?
                                                                              'bg-green-100 text-green-800' :
                                                                              'bg-red-100 text-red-800'
                                                                          }`}>
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
                        )}

                        {/* Sync Documents Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={syncDocuments}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 bg-[#1E2A5A] text-white rounded-lg
                     hover:bg-[#5B6BA9] transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Sync Documents
                            </button>
                        </div>

                        {/* Document Processing Logs */}
                        {logs.length > 0 && (
                            <div className="bg-[#F0F4FF] rounded-lg p-4 border border-[#B8C5E9] max-h-60 overflow-y-auto">
                                <h4 className="font-medium text-[#1E2A5A] mb-2">Document Processing Logs:</h4>
                                <ul className="space-y-1">
                                    {logs.map((log, index) => (
                                        <li key={index} className="text-sm text-[#1E2A5A]">
                                            {log}
                                        </li>
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