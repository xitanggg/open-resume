"use client";

import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { Resume } from "components/Resume";
import { useState } from "react";
import { Expand, Shrink } from "lucide-react";

export default function Create() {
  const [isCompactView, setIsCompactView] = useState(true);

  return (
    <Provider store={store}>
      <main className="relative min-h-screen w-full bg-gray-50">
        <div className="flex flex-col lg:flex-row">
          <div 
            className={`w-full overflow-y-auto border-b lg:border-b-0 lg:border-r transition-all duration-300 ease-in-out ${
              isCompactView ? 'lg:w-8/12' : 'lg:w-1/2'
            }`}
          >
            <ResumeForm />
          </div>
          <div 
            className={`w-full lg:overflow-y-auto transition-all duration-300 ease-in-out ${
              isCompactView ? 'lg:w-4/12' : 'lg:w-1/2'
            }`}
          >
            <div className="h-full p-4 pb-20 lg:pb-4"> {/* Added bottom padding */}
              <Resume />
            </div>
          </div>
        </div>
        <button
          className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-lg transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setIsCompactView(!isCompactView)}
        >
          {isCompactView ? (
            <>
              <Expand className="h-4 w-4" />
              <span className="hidden sm:inline">Expand Resume</span>
            </>
          ) : (
            <>
              <Shrink className="h-4 w-4" />
              <span className="hidden sm:inline">Compact View</span>
            </>
          )}
        </button>
      </main>
    </Provider>
  );
}