import { trpc } from "../utils/trpc";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
// import Markdown from "react-markdown";

interface PersonInfo {
  name: string | null;
  company: string | null;
  role: string | null;
  timestamp: string | null;
  imageUrl: string;
}

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

  const [people, setPeople] = useState<PersonInfo[]>([]);

  const extractPeople = trpc.extractPeople.useMutation({
    onSuccess: (data) => {
      setPeople(data.people);
    },
  });

  const handleSubmit = async () => {
    extractPeople.mutate({ images: imageBase64Array });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Retain <span className="text-[hsl(280,100%,70%)]">AI</span>
        </h1>
        <h2 className="text-lg font-semibold text-white/70 -mt-6">
          {"Upload screenshots of your interactions to find connections"}
        </h2>

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
        {!extractPeople.isPending && (
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
            disabled={imageBase64Array.length === 0 || extractPeople.isPending}
          >
            {extractPeople.isPending ? "Processing..." : "Extract Connections"}
          </button>
        </div>

        {/* Results Display */}
        {people.length > 0 && (
          <div className="mt-8 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Found Connections
            </h2>
            <div className="grid gap-6">
              {people.map((person, index) => (
                <div
                  key={index}
                  className="bg-white/10 p-6 rounded-xl flex items-center gap-6"
                >
                  <div className="flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={person.imageUrl}
                      alt={person.name || "Profile"}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        Found on LinkedIn
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">
                      {person.name || "Unknown"}
                    </h3>
                    {person.role && person.company && (
                      <p className="text-sm text-white/90 mt-1">
                        {person.role} • {person.company}
                      </p>
                    )}
                    {person.timestamp && (
                      <p className="text-sm text-white/60 mt-1">
                        Met on {person.timestamp}
                      </p>
                    )}
                  </div>
                  <a
                    href="https://www.linkedin.com/search/results/all/?keywords=emily%20herrara&origin=GLOBAL_SEARCH_HEADER&sid=-vU"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-white font-medium"
                  >
                    Connect
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {extractPeople.isPending && (
          <div className="mt-8 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Analyzing Screenshots...
            </h2>
            <div className="grid gap-6">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="bg-white/10 p-6 rounded-xl flex items-center gap-6 animate-pulse"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white/20 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-32 h-6 bg-white/20 rounded-full" />
                    </div>
                    <div className="w-48 h-7 bg-white/20 rounded mb-2" />
                    <div className="w-72 h-5 bg-white/20 rounded" />
                  </div>
                  <div className="w-24 h-10 bg-white/20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
