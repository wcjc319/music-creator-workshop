import { Outlet, NavLink, useNavigate } from "react-router";
import { Music, LayoutDashboard, Mic2, Library as LibraryIcon, Settings as SettingsIcon, Play, Pause, SkipForward, SkipBack, FileText, LogOut, User } from "lucide-react";
import { AudioProvider, useAudio } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Button } from "./ui/button";

function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlayPause, progress, seek } = useAudio();

  if (!currentTrack) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 h-16 md:h-24 bg-neutral-900 md:bg-neutral-950 border-t border-white/10 px-4 md:px-6 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none"
    >
      <div className="flex items-center gap-3 md:gap-4 w-1/2 md:w-1/4">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
           <Music className="w-5 h-5 md:w-6 md:h-6 text-white/40" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white font-medium truncate text-xs md:text-sm">{currentTrack.title}</span>
          <span className="text-white/50 text-[10px] md:text-xs mt-0.5 truncate">{currentTrack.artist || 'AI Generated'}</span>
        </div>
      </div>

      {/* PC Player Controls */}
      <div className="hidden md:flex flex-col items-center flex-1 max-w-xl px-8">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-white/50 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>
          <button 
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
          </button>
          <button className="text-white/50 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>
        </div>
        <div className="w-full flex items-center gap-3">
          <span className="text-xs text-white/50 font-medium w-10 text-right">0:00</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * 100);
          }}>
            <div 
              className="h-full bg-white rounded-full transition-all duration-100 ease-linear relative group"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
          <span className="text-xs text-white/50 font-medium w-10">{currentTrack.duration ? `0:${currentTrack.duration}` : '-:--'}</span>
        </div>
      </div>

      {/* Mobile Player Controls */}
      <div className="flex md:hidden items-center justify-end gap-4 w-1/2">
        <button 
          onClick={togglePlayPause}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform shrink-0"
        >
          {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
        </button>
      </div>

      <div className="hidden md:flex w-1/4 justify-end">
        {/* Volume controls could go here */}
      </div>

      {/* Mobile progress bar (tiny one on top of the player) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 md:hidden">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "仪表盘" },
  { path: "/studio", icon: Mic2, label: "创作工坊" },
  { path: "/score-converter", icon: FileText, label: "曲谱转换" },
  { path: "/library", icon: LibraryIcon, label: "我的曲库" },
  { path: "/settings", icon: SettingsIcon, label: "API 设置" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <AudioProvider>
      <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white/20">
        <div className="flex flex-1 overflow-hidden h-[100dvh]">
          {/* Sidebar (PC only) */}
          <nav className="hidden md:flex w-64 border-r border-white/10 bg-black flex-col pt-8 pb-28">
            <div className="px-8 mb-12 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Music className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight">SonicForge AI</span>
            </div>

            <div className="flex flex-col gap-2 px-4">
              {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              ))}
            </div>
            
            {/* User Profile */}
            <div className="mt-auto px-4 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <User className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {user?.name || '未登录'}
                    </span>
                    <span className="text-xs text-white/50">
                      {user?.email || '点击登录'}
                    </span>
                  </div>
                </div>
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    登录
                  </Button>
                )}
              </div>
            </div>
          </nav>

          {/* Bottom Nav (Mobile only) */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 z-[60] pb-safe">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                    isActive ? "text-white" : "text-white/50 hover:text-white/80"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pb-40 md:pb-32 bg-neutral-950/50">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center gap-3 p-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Music className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold tracking-tight">SonicForge AI</span>
            </div>
            <Outlet />
          </main>
        </div>

        {/* Player */}
        <GlobalPlayer />
      </div>
    </AudioProvider>
  );
}
