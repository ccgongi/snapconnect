import { trpc } from "../utils/trpc";
import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("C.C.");
  const hello = trpc.callOpenAi.useQuery({ text: inputText });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Icon - you'll need to import your icon or use an image */}
      <div className="mb-6">
        {/* Replace with your actual icon/image */}
        <div className="w-16 h-16 bg-blue-500 rounded-lg"></div>
      </div>

      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="mb-4 p-2 border rounded-lg w-64"
        placeholder="Enter text..."
      />

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        SnapConnect: {hello.data?.greeting}
      </h1>

      <p className="text-lg text-gray-600 text-center max-w-md mb-8">
        An app for C.C. to look cool with tons of screenshots of people
      </p>

      <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
        Get Started
      </button>
    </div>
  );
}
