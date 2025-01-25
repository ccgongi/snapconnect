import { trpc } from "../utils/trpc";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [inputText, setInputText] = useState("C.C.");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const hello = trpc.callOpenAi.useQuery({ text: inputText });
  const analyzeImage = trpc.analyzeImage.useQuery(
    { image: imageBase64 || "" },
    { enabled: !!imageBase64 }
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImageBase64(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Image <span className="text-[hsl(280,100%,70%)]">Analyzer</span>
        </h1>
        <div {...getRootProps()} className="w-full p-8 border-2 border-dashed border-white/30 rounded-xl hover:border-white/50 transition-all cursor-pointer bg-white/5 mb-8">
          <input {...getInputProps()} />
          <div className="text-center">
            {imageBase64 ? (
              <img 
                src={`data:image/jpeg;base64,${imageBase64}`}
                alt="Uploaded preview"
                className="max-h-48 mx-auto mb-4"
              />
            ) : (
              <p className="text-white/70">
                {isDragActive
                  ? "Drop the image here..."
                  : "Drag and drop an image here, or click to select"}
              </p>
            )}
          </div>
        </div>
        {/* API Response Display */}
        {analyzeImage.isLoading && (
          <div className="mt-6 text-center text-white/90">
            Analyzing image...
          </div>
        )}
        {analyzeImage.data && (
          <div className="mt-6 text-center text-white/90">
            {JSON.stringify(analyzeImage.data, null, 2)}

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
    </main>
  );
}
