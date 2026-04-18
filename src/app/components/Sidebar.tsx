import React from 'react';
import { Home, Compass, Library, PlusSquare, Settings, Disc, Search, Headphones } from 'lucide-react';

export function Sidebar() {
  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: '主页', active: true },
    { icon: <Compass className="w-5 h-5" />, label: '探索流派' },
    { icon: <Library className="w-5 h-5" />, label: '我的素材库' },
  ];

  const toolsItems = [
    { icon: <PlusSquare className="w-5 h-5" />, label: '生成音乐' },
    { icon: <Disc className="w-5 h-5" />, label: '分离音轨' },
    { icon: <Search className="w-5 h-5" />, label: '查找相似' },
  ];

  return (
    <div className="w-64 bg-neutral-950 flex flex-col h-full border-r border-neutral-800 hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white mb-8 cursor-pointer">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-lg text-white">
            <Headphones className="w-6 h-6" />
          </div>
          <span>AudioGen Pro</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8">
        <div>
          <h2 className="text-xs uppercase font-semibold text-neutral-500 mb-3 px-3 tracking-wider">我的工作室</h2>
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item.active 
                      ? 'bg-neutral-800 text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs uppercase font-semibold text-neutral-500 mb-3 px-3 tracking-wider">AI 工具</h2>
          <ul className="space-y-1">
            {toolsItems.map((item, index) => (
              <li key={index}>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/20">
          <h3 className="text-sm font-medium text-white mb-2">升级至专业版</h3>
          <p className="text-xs text-neutral-400 mb-3">解锁高质量无损下载和商用授权许可。</p>
          <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors">
            立即升级
          </button>
        </div>
      </div>
    </div>
  );
}