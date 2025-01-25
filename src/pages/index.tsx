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
          </div>
        )}
      </div>
    </main>
  );
}
