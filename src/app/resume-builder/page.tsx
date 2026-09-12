"use client";
import { Provider } from "react-redux";
import { store } from "lib/redux/store";
import { ResumeForm } from "components/ResumeForm";
import { Resume } from "components/Resume";
import { AISidebar } from "components/AI/AISidebar";
import { AIFloatingChat } from "components/AI/AIFloatingChat";

export default function Create() {
  return (
    <Provider store={store}>
      <main className="relative h-full w-full overflow-hidden bg-gray-50">
        <div className="flex">
          {/* Left: Form Editor */}
          <div className="w-full shrink-0 md:w-[38%] lg:w-[35%]">
            <ResumeForm />
          </div>
          {/* Center: Resume Preview */}
          <div className="hidden flex-1 md:block">
            <Resume />
          </div>
          {/* Right: AI Sidebar */}
          <div className="hidden w-[280px] shrink-0 lg:block xl:w-[320px]">
            <AISidebar />
          </div>
        </div>
        <AIFloatingChat />
      </main>
    </Provider>
  );
}
