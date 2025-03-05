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
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [availableNiches, setAvailableNiches] = useState<NicheOption[]>([]);
    const [results, setResults] = useState<URLProcessingResult[]>([]);
    const [mode, setMode] = useState<'process' | 'extract' | 'youtube'>('process');
    const [input, setInput] = useState("");
    const [selectedNiche, setSelectedNiche] = useState("");
    const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
    const [extractedPdfCount, setExtractedPdfCount] = useState(0);
    const [newNicheInput, setNewNicheInput] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const fetchNiches = useCallback(async () => {
        try {
            const response = await fetch("https://ushapangeni.com.np/get-niches");
            const data = await response.json();
            if (data.success) setAvailableNiches(data.niches);
            else setError(data.error || "Failed to fetch niches");
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
                setAvailableNiches(prev => [...prev, { value: data.niche, label: data.display_niche }]);
                setNewNicheInput("");
                setError(null);
            } else setError(data.error || "Failed to add niche");
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
            } else setError(data.error || "Failed to delete niche");
        } catch (err: any) {
            setError(err.message || "An error occurred while deleting niche");
        }
    };

    const handleDeleteClick = (nicheValue: string) => {
        setShowDeleteConfirm(nicheValue);
    };

    const confirmDelete = async () => {
        if (showDeleteConfirm) {
            await deleteNiche(showDeleteConfirm);
            setShowDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(null);
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
        setInfoMessage(null);
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
                if (mode === 'extract') setExtractedPdfCount(data.count);
                if (data.results) setResults(data.results);
                else setResults([data]);
            } else setError(data.error || `An unknown error occurred during ${mode} processing.`);
        } catch (err: any) {
            if (mode === 'youtube') setInfoMessage("Seems like you have lots of videos, which may take some time to load in the system!");
            else setError(err.message || `An error occurred during ${mode} processing.`);
        } finally {
            setProcessLoading(false);
        }
    };

    const placeholderText = () => {
        if (mode === 'process') return "https://example.com/article1\nhttps://example.com/article2";
        if (mode === 'extract') return "https://example.com";
        if (mode === 'youtube') return "https://www.youtube.com/watch?v=...";
        return "";
    };

    const inputLabel = () => {
        if (mode === 'process') return "Paste URLs (Separate by line or space)";
        if (mode === 'extract') return "Enter URL to Extract PDFs";
        if (mode === 'youtube') return "Enter YouTube URL(s)";
        return "";
    };

    const getIcon = () => {
        if (mode === 'process') return <LinkIcon className="mr-2 h-4 w-4" />;
        if (mode === 'extract') return <DownloadCloud className="mr-2 h-4 w-4" />;
        if (mode === 'youtube') return <PlayCircle className="mr-2 h-4 w-4" />;
        return null;
    };

    return (
        <div className="min-h-screen bg-[#1A2233] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-[#FFFFFF]">Add Files to RAG System</h1>
                        <p className="text-[#A9B4C2] mt-1">Process URLs, extract PDFs, or add YouTube content effortlessly</p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-[#2A3548] rounded-xl shadow-sm border border-[#3C4A61] p-6 space-y-6">
                        {/* Mode Toggle */}
                        <div className="flex justify-center gap-2 bg-[#3C4A61] p-1 rounded-lg">
                            {(['process', 'extract', 'youtube'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === m ? 'bg-[#1E2D4D] text-white' : 'text-[#A9B4C2] hover:bg-[#4A5A73]'}`}
                                >
                                    {m === 'process' ? 'Process URLs' : m === 'extract' ? 'Extract PDFs' : 'YouTube'}
                                </button>
                            ))}
                        </div>

                        {/* Input Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Niche Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#FFFFFF]">Select Niche</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setNicheDropdownOpen(!nicheDropdownOpen)}
                                        className="w-full p-3 border border-[#3C4A61] rounded-lg bg-[#3C4A61] text-left text-[#A9B4C2] flex justify-between items-center"
                                    >
                                        <span>{selectedNiche ? availableNiches.find(n => n.value === selectedNiche)?.label : "Choose a niche"}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {nicheDropdownOpen && (
                                        <div className="absolute w-full mt-1 bg-[#3C4A61] border border-[#4A5A73] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                            <div className="p-2 border-b border-[#4A5A73]">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newNicheInput}
                                                        onChange={(e) => setNewNicheInput(e.target.value)}
                                                        placeholder="New niche"
                                                        className="flex-1 p-2 border border-[#4A5A73] rounded-lg text-sm bg-[#2A3548] text-[#A9B4C2]"
                                                    />
                                                    <button onClick={addNiche} className="p-2 bg-[#3A9BA4] text-white rounded-lg hover:bg-[#308C93]">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {availableNiches.map(niche => (
                                                <div key={niche.value} className="flex items-center justify-between p-2 hover:bg-[#4A5A73]">
                                                    <button
                                                        onClick={() => { setSelectedNiche(niche.value); setNicheDropdownOpen(false); }}
                                                        className="flex items-center w-full text-left"
                                                    >
                                                        <div className="w-5 h-5 border border-[#4A5A73] rounded mr-2 flex items-center justify-center">
                                                            {selectedNiche === niche.value && <Check className="w-4 h-4 text-[#3A9BA4]" />}
                                                        </div>
                                                        <span className="text-[#A9B4C2]">{niche.label}</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(niche.value)} className="text-red-400 hover:text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#FFFFFF]">{inputLabel()}</label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={placeholderText()}
                                    disabled={processLoading}
                                    className="w-full h-32 p-3 border border-[#3C4A61] rounded-lg bg-[#3C4A61] text-[#A9B4C2] focus:outline-none focus:ring-2 focus:ring-[#3A9BA4] disabled:opacity-50 resize-none"
                                />
                            </div>
                        </div>

                        {/* Process Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={processInput}
                                disabled={processLoading}
                                className="inline-flex items-center px-4 py-2 bg-[#3A9BA4] text-white rounded-lg hover:bg-[#308C93] transition-colors disabled:opacity-50"
                            >
                                {processLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : getIcon()}
                                {mode === 'process' ? 'Process URLs' : mode === 'extract' ? 'Extract PDFs' : 'Process YouTube'}
                            </button>
                        </div>

                        {/* Results */}
                        {results.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-[#FFFFFF]">{mode === 'extract' ? `Extracted PDFs: ${extractedPdfCount}` : "Results"}</h3>
                                <div className="overflow-x-auto border border-[#3C4A61] rounded-lg">
                                    <table className="min-w-full divide-y divide-[#3C4A61]">
                                        <thead className="bg-[#4A5A73]">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-[#A9B4C2] uppercase">URL</th>
                                                {mode !== 'youtube' && <th className="px-4 py-2 text-left text-xs font-medium text-[#A9B4C2] uppercase">Type</th>}
                                                {mode !== 'youtube' && <th className="px-4 py-2 text-left text-xs font-medium text-[#A9B4C2] uppercase">Size</th>}
                                                {mode === 'youtube' && <th className="px-4 py-2 text-left text-xs font-medium text-[#A9B4C2] uppercase">File</th>}
                                                <th className="px-4 py-2 text-left text-xs font-medium text-[#A9B4C2] uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[#2A3548] divide-y divide-[#3C4A61]">
                                            {results.map((result, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 text-sm text-[#A9B4C2] truncate max-w-xs">{result.url}</td>
                                                    {mode !== 'youtube' && <td className="px-4 py-2 text-sm text-[#A9B4C2]">{result.content_type || "unknown"}</td>}
                                                    {mode !== 'youtube' && (
                                                        <td className="px-4 py-2 text-sm text-[#A9B4C2]">
                                                            {result.characters
                                                                ? typeof result.characters === 'number'
                                                                    ? `${result.characters} chars`
                                                                    : `${Math.round(parseInt(result.characters as string) / 1024)} KB`
                                                                : "unknown"}
                                                        </td>
                                                    )}
                                                    {mode === 'youtube' && (
                                                        <td className="px-4 py-2 text-sm text-[#A9B4C2]">
                                                            <a href={result.file_path} target="_blank" rel="noopener noreferrer" className="text-[#3A9BA4] hover:underline">
                                                                {result.filename}
                                                            </a>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-2 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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

                        {/* Sync Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={syncDocuments}
                                disabled={syncLoading}
                                className="inline-flex items-center px-4 py-2 bg-[#1E2D4D] text-white rounded-lg hover:bg-[#2D3E5D] transition-colors disabled:opacity-50"
                            >
                                {syncLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Sync Documents
                            </button>
                        </div>

                        {/* Logs */}
                        {logs.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-[#FFFFFF]">Processing Logs</h4>
                                <div className="bg-[#4A5A73] p-4 rounded-lg border border-[#3C4A61] max-h-40 overflow-y-auto">
                                    <ul className="space-y-1 text-sm text-[#A9B4C2]">
                                        {logs.map((log, index) => <li key={index}>{log}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        {infoMessage && (
                            <div className="bg-[#2F445E] border border-[#3A9BA4] text-[#3A9BA4] p-3 rounded-lg">
                                {infoMessage}
                            </div>
                        )}
                        {error && (
                            <div className="bg-[#4A5A73] border border-red-400 text-red-300 p-3 rounded-lg">
                                <strong>Error: </strong>{error}
                            </div>
                        )}

                        {/* Delete Confirmation Popup */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-[#2A3548] p-6 rounded-lg border border-[#3C4A61]">
                                    <h3 className="text-lg font-medium text-[#FFFFFF] mb-4">Are you sure you want to delete this niche?</h3>
                                    <p className="text-[#A9B4C2] mb-6">
                                        {availableNiches.find(n => n.value === showDeleteConfirm)?.label}
                                    </p>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={cancelDelete}
                                            className="px-4 py-2 bg-[#4A5A73] text-[#A9B4C2] rounded-lg hover:bg-[#5A6A83]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                        >
                                            Yes, Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFiles;