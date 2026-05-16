"use client";

import { useState } from "react";

interface GraphSettings {
  showArrows: boolean;
  textOpacity: number;
  nodeSize: number;
  linkThickness: number;
  isAnimating: boolean;
}

interface GraphControlsProps {
  settings: GraphSettings;
  onSettingsChange: (newSettings: GraphSettings) => void;
}

const defaultSettings: GraphSettings = {
  showArrows: false,
  textOpacity: 0.9,
  nodeSize: 6,
  linkThickness: 1.2,
  isAnimating: true,
};

export default function GraphControls({ settings, onSettingsChange }: GraphControlsProps) {
  const [isOpen, setIsOpen] = useState(true);

  const updateSetting = (key: keyof GraphSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="absolute top-4 right-4 bg-[#2d2d2d]/95 backdrop-blur-sm rounded-lg border border-[#404040] shadow-lg z-10 w-56">
      {/* 标题栏 */}
      <div className="px-3 py-2 border-b border-[#404040] flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-medium text-[#e5e7eb] hover:text-white transition-colors"
        >
          <span className="text-[#9ca3af]">{isOpen ? "▼" : "▶"}</span>
          <span>图谱设置</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3">
          {/* 外观设置 */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#9ca3af]">外观</div>
            
            {/* 箭头 */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#d1d5db]">箭头</span>
              <button
                onClick={() => updateSetting("showArrows", !settings.showArrows)}
                className={`w-8 h-4 rounded-full transition-colors ${
                  settings.showArrows ? "bg-[#7c3aed]" : "bg-[#404040]"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    settings.showArrows ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* 文本透明度 */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-xs text-[#d1d5db]">
                <span>文本透明度</span>
                <span>{Math.round(settings.textOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.textOpacity}
                onChange={(e) => updateSetting("textOpacity", parseFloat(e.target.value))}
                className="w-full h-2 accent-[#7c3aed]"
              />
            </div>

            {/* 节点大小 */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-xs text-[#d1d5db]">
                <span>节点大小</span>
                <span>{settings.nodeSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                value={settings.nodeSize}
                onChange={(e) => updateSetting("nodeSize", parseInt(e.target.value))}
                className="w-full h-2 accent-[#7c3aed]"
              />
            </div>

            {/* 连线粗细 */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-xs text-[#d1d5db]">
                <span>连线粗细</span>
                <span>{settings.linkThickness}px</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={settings.linkThickness}
                onChange={(e) => updateSetting("linkThickness", parseFloat(e.target.value))}
                className="w-full h-2 accent-[#7c3aed]"
              />
            </div>

            {/* 播放动画 */}
            <button
              onClick={() => updateSetting("isAnimating", !settings.isAnimating)}
              className={`w-full py-1.5 rounded-md text-xs font-medium transition-colors ${
                settings.isAnimating
                  ? "bg-[#7c3aed] text-white"
                  : "bg-[#404040] text-[#9ca3af]"
              }`}
            >
              {settings.isAnimating ? "⏸ 暂停动画" : "▶ 播放动画"}
            </button>
          </div>


        </div>
      )}
    </div>
  );
}

export { defaultSettings };
export type { GraphSettings };
