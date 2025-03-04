// AddFiles.tsx
import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, Link as LinkIcon, File, DownloadCloud, PlayCircle, Trash2, Plus } from "lucide-react";

interface URLProcessingResult {
    url: string;
    status: string;
    content_type?: string;
    characters?: number | string;
    filename?: string;
    error?: string;
    file_path?: string;
}

interface NicheOption {
    value: string;
    label: string;
}

const AddFiles = () => {
    const [processLoading, setProcessLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null); // New state for informational messages
    const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);
    const [results, setResults] = useState<URLProcessingResult[]>([]);
    const [mode, setMode] = useState<'process' | 'extract' | 'youtube'>('process');
    const [input, setInput] = useState("");
    const [selectedNiche, setSelectedNiche] = useState("");
    const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
    const [extractedPdfCount, setExtractedPdfCount] = useState(0);
    const [newNicheInput, setNewNicheInput] = useState("");

    const fetchNiches = useCallback(async () => {
        try {
            const response = await fetch("https://ushapangeni.com.np/get-niches");
            const data = await response.json();
            if (data.success) {
                setAvailableNiches(data.niches);
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

    const addNiche = async () => {
        if (!newNicheInput.trim()) {
            setError("Please enter a niche name");
            return;
        }
        try {
            const response = await fetch("https://ushapangeni.com.np/add-niche", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ niche: newNicheInput.trim() }),
            });
            const data = await response.json();
            if (data.success) {
                setAvailableNiches(prev => [
                    ...prev,
                    { value: data.niche, label: data.display_niche }
                ]);
                setNewNicheInput("");
                setError(null);
            } else {
                setError(data.error || "Failed to add niche");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while adding niche");
        }
    };

    const deleteNiche = async (nicheValue: string) => {
        try {
            const response = await fetch("https://ushapangeni.com.np/delete-niche", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ niche: nicheValue }),
            });
            const data = await response.json();
            if (data.success) {
                setAvailableNiches(prev => prev.filter(n => n.value !== nicheValue));
                if (selectedNiche === nicheValue) setSelectedNiche("");
                setError(null);
            } else {
                setError(data.error || "Failed to delete niche");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while deleting niche");
        }
    };

    const syncDocuments = async () => {
        setSyncLoading(true);
        setError(null);
        setLogs([]);
        try {
            const response = await fetch("https://ushapangeni.com.np/process-documents", { method: "POST" });
            const data = await response.json();
            if (data.success) setLogs(data.results.logs);
            else setError(data.error || "An unknown error occurred during document sync.");
        } catch (err: any) {
            setError(err.message || "An error occurred during document sync.");
        } finally {
            setSyncLoading(false);
        }
    };

    const processInput = async () => {
        if (!input.trim()) {
            setError("Please enter input");
            return;
        }
        if (!selectedNiche) {
            setError("Please select a specific niche");
            return;
        }

        setProcessLoading(true);
        setError(null);
        setInfoMessage(null); // Clear any previous info message
        setResults([]);

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
                    setExtractedPdfCount(data.count);
                }
                if (data.results) {
                    setResults(data.results);
                } else {
                    setResults([data]);
                }
            } else {
                setError(data.error || `An unknown error occurred during ${mode} processing.`);
            }
        } catch (err: any) {
            if (mode === 'youtube') {
                setInfoMessage("Seems like you have lots of videos, which may take some time to load in the system!");
            } else {
                setError(err.message || `An error occurred during ${mode} processing.`);
            }
        } finally {
            setProcessLoading(false);
        }
    };

    const placeholderText = () => {
        if (mode === 'process') {
            return "https://example.com/article1\nhttps://example.com/article2\nhttps://example.com/document.pdf";
        } else if (mode === 'extract') {
            return "https://example.com";
        } else if (mode === 'youtube') {
            return "https://www.youtube.com/watch?v=...";
        }
        return "";
    };

    const inputLabel = () => {
        if (mode === 'process') {
            return "Paste URLs (No Limit)";
        } else if (mode === 'extract') {
            return "Enter URL (One at a time)";
        } else if (mode === 'youtube') {
            return "Enter YouTube URLs (No Limit)";
        }
        return "";
    };

    const getIcon = () => {
        if (mode === 'process') return <LinkIcon className="mr-2 h-4 w-4" />;
        if (mode === 'extract') return <DownloadCloud className="mr-2 h-4 w-4" />;
        if (mode === 'youtube') return <PlayCircle className="mr-2 h-4 w-4" />;
        return null;
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
                            <button onClick={() => setMode('extract')} className={`px-6 py-2 rounded-lg transition-colors ${mode === 'extract' ? 'bg-[#1E2A5A] text-white' : 'bg-[#F0F4FF] text-[#1E2A5A] hover:bg-[#B8C5E9]'}`}>PDF Extraction</button>
                            <button onClick={() => setMode('youtube')} className={`px-6 py-2 rounded-lg transition-colors ${mode === 'youtube' ? 'bg-[#1E2A5A] text-white' : 'bg-[#F0F4FF] text-[#1E2A5A] hover:bg-[#B8C5E9]'}`}>YouTube</button>
                        </div>

                        <div className="bg-[#F0F4FF] rounded-lg p-6 border border-[#B8C5E9]/50">
                            <h2 className="text-xl font-semibold text-[#1E2A5A] mb-4">
                                {mode === 'process' ? 'Supports Article, Pdf, Jpg' : mode === 'extract' ? 'Process all pdfs from a page' : 'YouTube Video/Playlist'}
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
                                            {/* Add New Niche Input */}
                                            <div className="p-2 border-b border-[#B8C5E9]">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={newNicheInput}
                                                        onChange={(e) => setNewNicheInput(e.target.value)}
                                                        placeholder="Add new niche"
                                                        className="w-full p-2 border border-[#B8C5E9] rounded-lg"
                                                    />
                                                    <button onClick={addNiche} className="p-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#5B6BA9]">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {availableNiches.map(niche => (
                                                <div key={niche.value} className="flex items-center justify-between px-4 py-2 hover:bg-[#F0F4FF] cursor-pointer">
                                                    <div className="flex items-center" onClick={() => { setSelectedNiche(niche.value); setNicheDropdownOpen(false); }}>
                                                        <div className="w-5 h-5 border border-[#B8C5E9] rounded flex items-center justify-center mr-3">
                                                            {selectedNiche === niche.value && <Check className="w-4 h-4 text-[#5B6BA9]" />}
                                                        </div>
                                                        <span>{niche.label}</span>
                                                    </div>
                                                    <button onClick={() => deleteNiche(niche.value)} className="text-red-600 hover:text-red-800">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
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
                                        disabled={processLoading}
                                        className="w-full min-h-[100px] p-4 rounded-lg border border-[#B8C5E9] bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#5B6BA9] focus:border-transparent resize-none transition-all duration-200 ease-in-out disabled:opacity-50"
                                    />
                                </div>

                                {/* Unified Process Button */}
                                <div className="flex justify-end">
                                    <button onClick={processInput} disabled={processLoading} className="inline-flex items-center px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#5B6BA9] transition-colors disabled:opacity-50">
                                        {processLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : getIcon()}
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
                                disabled={syncLoading}
                                className="inline-flex items-center px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#5B6BA9] transition-colors disabled:opacity-50"
                            >
                                {syncLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Sync Documents
                            </button>
                        </div>

                        {/* Document Processing Logs */}
                        {logs.length > 0 && (
                            <div className="bg-[#F0F4FF] rounded-lg p-4 border border-[#B8C5E9] max-h-60 overflow-y-auto">
                                <h4 className="font-medium text-[#1E2A5A] mb-2">Document Processing Logs:</h4>
                                <ul className="space-y-1">
                                    {logs.map((log, index) => (
                                        <li key={index} className="text-sm text-[#1E2A5A]">{log}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Informational Message Display */}
                        {infoMessage && (
                            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{infoMessage}</span>
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