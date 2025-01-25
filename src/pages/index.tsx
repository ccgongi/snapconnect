import { trpc } from "../utils/trpc";
import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("C.C.");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analyses, setAnalyses] = useState<string[]>([]);
  const [brief, setBrief] = useState<string>("");

  const generateBrief = trpc.generateMorningBrief.useMutation({
    onSuccess: (data) => {
      setAnalyses(data.analyses);
      setBrief(data.brief);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async () => {
    const imagePromises = selectedFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    const base64Images = await Promise.all(imagePromises);
    generateBrief.mutate({ images: base64Images });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      {/* Main content container with glass effect */}
      <div className="w-full max-w-4xl p-8 backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl">
        <h1 className="text-5xl font-bold text-sky-500 text-center mb-6">
          SnapConnect
        </h1>

        <p className="text-xl text-white/90 text-center max-w-2xl mx-auto mb-12">
          An app for C.C. to look cool with tons of screenshots of people
        </p>

        {/* Upload/Input Area */}
        <div 
          className="w-full p-8 border-2 border-dashed border-white/30 rounded-xl hover:border-white/50 transition-all cursor-pointer bg-white/5 mb-8"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="text-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <p className="mt-4 text-white/70">
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} files selected`
                  : "Drag and drop your files here, or click to select files"}
              </p>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button 
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all transform hover:scale-105 backdrop-blur-sm shadow-lg"
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0 || generateBrief.isPending}
          >
            {generateBrief.isPending ? "Processing..." : "Generate Brief"}
          </button>
        </div>

        {/* Results Display */}
        {brief && (
          <div className="mt-8 p-6 bg-white/10 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Morning Brief</h2>
            <div className="prose prose-invert">
              {brief}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
