"use client";

interface ViewToggleProps {
  currentView: "categories" | "original";
  onViewChange: (view: "categories" | "original") => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onViewChange("categories")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === "categories"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        分类视图
      </button>
      <button
        onClick={() => onViewChange("original")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === "original"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        原始视图
      </button>
    </div>
  );
}
