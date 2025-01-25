import { trpc } from "../utils/trpc";
import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("C.C.");
  const hello = trpc.callOpenAi.useQuery({ text: inputText });

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
        <div className="w-full p-8 border-2 border-dashed border-white/30 rounded-xl hover:border-white/50 transition-all cursor-pointer bg-white/5 mb-8">
          <div className="text-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full max-w-xl p-4 rounded-lg bg-white/20 backdrop-blur-md border-none text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:outline-none text-lg"
              placeholder="Enter text or drop files here..."
            />
            <p className="mt-4 text-white/70">
              Drag and drop your files here, or click to select files
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all transform hover:scale-105 backdrop-blur-sm shadow-lg">
            Get Started
          </button>
        </div>

        {/* API Response Display */}
        {hello.data?.greeting && (
          <div className="mt-6 text-center text-white/90">
            {hello.data.greeting}
          </div>
        )}
      </div>
    </div>
  );
}
