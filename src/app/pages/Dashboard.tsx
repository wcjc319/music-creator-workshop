import { motion } from "motion/react";
import { Play, TrendingUp, Clock, Music, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useAudio } from "../context/AudioContext";
import { getLibraryTracks } from "../services/musicApi";

export function Dashboard() {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const recentTracks = getLibraryTracks().slice(0, 3).reverse();

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          欢迎回来，创作者
        </h1>
        <p className="text-white/60 text-lg max-w-2xl">
          准备好创作下一首爆款音乐了吗？使用我们最新的 AI 引擎，只需几句描述，即可生成录音室品质的曲目。
        </p>
      </motion.div>

      {/* Hero Action Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 p-10 mb-16 group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/40 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm mb-6 font-medium border border-white/5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              v2.0 模型已上线
            </div>
            <h2 className="text-3xl font-bold mb-4">开始您的音乐创作</h2>
            <p className="text-white/60 mb-8 max-w-md">
              进入创作工坊，体验由先进 AI 驱动的无缝音乐生成流程。支持多轨分离、情绪控制和自定义乐器。
            </p>
            <Link 
              to="/studio"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              进入创作工坊
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="hidden md:flex flex-col gap-4 w-72">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white/5 border border-white/10 flex items-center px-4 gap-3 relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-white/10 animate-[shimmer_2s_infinite]"
                  style={{ width: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 0.2}s` }}
                />
                <div className="w-6 h-6 rounded-full bg-white/10 relative z-10" />
                <div className="flex-1 h-2 rounded-full bg-white/10 relative z-10" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Tracks */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-white/60" />
            最近生成
          </h3>
          <Link to="/library" className="text-sm text-white/50 hover:text-white transition-colors">
            查看全部
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTracks.length > 0 ? recentTracks.map((track, i) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying;
            
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-xl bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                    <Music className="w-6 h-6 text-white/20" />
                    <button 
                      onClick={() => playTrack(track)}
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlayingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        {isPlayingThis ? <div className="w-3 h-3 bg-black rounded-[2px]" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
                      </div>
                    </button>
                    {isPlayingThis && (
                       <div className="absolute bottom-1 right-1 flex items-end gap-0.5 h-3">
                         {[1,2,3].map(bar => (
                           <motion.div 
                             key={bar}
                             animate={{ height: ["4px", "12px", "4px"] }}
                             transition={{ duration: 0.5, repeat: Infinity, delay: bar * 0.1 }}
                             className="w-1 bg-white rounded-t-sm"
                           />
                         ))}
                       </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h4 className="font-semibold text-white truncate text-base">{track.title}</h4>
                    <p className="text-white/50 text-sm mt-1">{track.genre}</p>
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <Music className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/50">还没有生成过音乐，去创作工坊开始吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
