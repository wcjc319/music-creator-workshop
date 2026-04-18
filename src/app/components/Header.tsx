import React from 'react';
import { Bell, Search, User, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 flex-shrink-0 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="搜索流派、乐器、情绪..." 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-full py-2 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-neutral-800/50 rounded-full px-3 py-1.5 border border-neutral-700/50">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-neutral-300">2,450 积分</span>
        </div>
        
        <button className="p-2 text-neutral-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-neutral-900"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-neutral-500 transition-colors shadow-sm relative group overflow-hidden">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}