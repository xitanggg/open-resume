import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const CommaInput = ({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addItems = (raw: string) => {
    const newItems = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (newItems.length > 0) {
      onChange([...items, ...newItems]);
      setInputValue("");
    }
  };

  const deleteItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const moveItem = (idx: number, direction: "left" | "right") => {
    const newItems = [...items];
    const swapIdx = direction === "left" ? idx - 1 : idx + 1;
    const temp = newItems[idx];
    newItems[idx] = newItems[swapIdx];
    newItems[swapIdx] = temp;
    onChange(newItems);
  };

  return (
    <div className="mt-1 min-h-[72px] flex flex-wrap gap-1.5 items-start rounded-md border border-gray-300 bg-white p-2 shadow-sm">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-0.5 rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-sm text-gray-800"
        >
          <button
            type="button"
            onClick={() => moveItem(idx, "left")}
            disabled={idx === 0}
            className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-25"
            title="Move left"
          >
            <ChevronLeftIcon className="h-3 w-3" />
          </button>
          <span className="mx-0.5">{item}</span>
          <button
            type="button"
            onClick={() => moveItem(idx, "right")}
            disabled={idx === items.length - 1}
            className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-25"
            title="Move right"
          >
            <ChevronRightIcon className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => deleteItem(idx)}
            className="ml-0.5 p-0.5 text-gray-400 hover:text-red-500"
            title="Remove item"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="min-w-[160px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400 px-1"
        placeholder={items.length === 0 ? (placeholder || "Type a value, press Enter or comma to add") : "Add more…"}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addItems(inputValue);
          }
          if (e.key === "Backspace" && inputValue === "" && items.length > 0) { 
            deleteItem(items.length - 1);
          }
        }}
        onBlur={() => {
          if (inputValue.trim()) addItems(inputValue);
        }}
      />
    </div>
  );
};
