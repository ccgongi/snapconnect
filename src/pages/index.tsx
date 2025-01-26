import { trpc } from "../utils/trpc";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Markdown from "react-markdown";
import Skeleton from "react-loading-skeleton";

export default function Home() {
  const [imageBase64Array, setImageBase64Array] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Limit to 20 images
      const filesToProcess = acceptedFiles.slice(
        0,
        20 - imageBase64Array.length
      );

      filesToProcess.forEach((file) => {
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            setImageBase64Array((prev) => [...prev, base64]);
          };
          reader.readAsDataURL(file);
        }
      });
    },
    [imageBase64Array]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 20,
  });

  // Remove individual images
  const removeImage = (index: number) => {
    setImageBase64Array((prev) => prev.filter((_, i) => i !== index));
  };

  const [analyses, setAnalyses] = useState<string[]>([]);
  const [brief, setBrief] = useState<string>("");

  const generateBrief = trpc.generateMorningBrief.useMutation({
    onSuccess: (data) => {
      setAnalyses(data.analyses);
      setBrief(data.brief);
    },
  });

  const handleSubmit = async () => {
    // pass the imageBase64Array to the mutation
    generateBrief.mutate({ images: imageBase64Array });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Screenshot <span className="text-[hsl(280,100%,70%)]">Analyzer</span>
        </h1>

        {/* Image Preview Area */}
        {imageBase64Array.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center w-full max-w-4xl">
            {imageBase64Array.map((base64, index) => (
              <div key={index} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={base64}
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dropzone - Hide when generating brief */}
        {!generateBrief.isPending && (
          <div
            {...getRootProps()}
            className="w-full p-8 border-2 border-dashed border-white/30 rounded-xl hover:border-white/50 transition-all cursor-pointer bg-white/5 mb-8"
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <p className=" text-white/70">
                {isDragActive
                  ? "Drop the images here..."
                  : `Drag and drop up to ${
                      20 - imageBase64Array.length
                    } images here, or click to select`}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <button
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all transform hover:scale-105 backdrop-blur-sm shadow-lg"
            onClick={handleSubmit}
            disabled={imageBase64Array.length === 0 || generateBrief.isPending}
          >
            {generateBrief.isPending ? "Processing..." : "Generate Brief"}
          </button>
        </div>

        {/* Loading State */}
        {generateBrief.isPending && (
          <div className="mt-8 p-6 bg-white/10 rounded-xl w-full animate-pulse">
            <h2 className="text-2xl font-bold text-white mb-6">
              Analyzing Images...
            </h2>
            <div className="space-y-4">
              <Skeleton
                count={3}
                className="h-4"
                baseColor="#ffffff20"
                highlightColor="#ffffff40"
              />
              <Skeleton
                count={2}
                className="h-4 w-3/4"
                baseColor="#ffffff20"
                highlightColor="#ffffff40"
              />
              <Skeleton
                count={1}
                className="h-4 w-1/2"
                baseColor="#ffffff20"
                highlightColor="#ffffff40"
              />
            </div>
          </div>
        )}

        {/* Results Display */}
        {brief && (
          <div className="mt-8 p-6 bg-white/10 rounded-xl w-full animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">
              Morning Brief
            </h2>
            <div className="prose prose-invert prose-headings:text-white prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-white prose-li:text-gray-200 max-w-none">
              <Markdown>{brief}</Markdown>
            </div>
          </div>
        )}

        {analyses.length > 0 && (
          <div className="mt-8 p-6 bg-white/10 rounded-xl w-full animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">
              Individual Analyses
            </h2>
            <div className="space-y-8">
              {analyses.map((analysis, index) => (
                <div
                  key={index}
                  className="prose prose-invert prose-headings:text-white prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-white prose-li:text-gray-200 max-w-none"
                >
                  <Markdown>{analysis}</Markdown>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
