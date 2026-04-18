import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Download, Trash2, Search, Filter, Music } from "lucide-react";
import { useAudio } from "../context/AudioContext";
import { getLibraryTracks, removeTrackFromLibrary } from "../services/musicApi";

export function Library() {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [searchTerm, setSearchTerm] = useState("");
  const [library, setLibrary] = useState(getLibraryTracks());

  // 当曲库数据变化时更新
  useEffect(() => {
    setLibrary(getLibraryTracks());
  }, []);

  const filteredLibrary = library.filter(track => 
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    track.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理删除操作
  const handleDelete = (trackId: string) => {
    if (window.confirm('确定要删除这首歌曲吗？')) {
      removeTrackFromLibrary(trackId);
      setLibrary(getLibraryTracks());
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">我的曲库</h1>
          <p className="text-white/50 text-lg">您所有生成的音乐都在这里安全保存。</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="搜索曲目或流派..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-sm">
              <th className="font-medium px-6 py-4 w-12 text-center">#</th>
              <th className="font-medium px-6 py-4">曲目标题</th>
              <th className="font-medium px-6 py-4">流派</th>
              <th className="font-medium px-6 py-4">生成日期</th>
              <th className="font-medium px-6 py-4 text-right">时长</th>
              <th className="font-medium px-6 py-4 text-center w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredLibrary.map((track, i) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;
              
              return (
                <motion.tr 
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => playTrack(track)}
                >
                  <td className="px-6 py-4 text-center text-white/40 group-hover:text-white">
                    {isPlayingThis ? (
                      <div className="flex items-end justify-center gap-0.5 h-4">
                        {[1,2,3].map(bar => (
                          <motion.div 
                            key={bar}
                            animate={{ height: ["4px", "16px", "4px"] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: bar * 0.1 }}
                            className="w-1 bg-purple-400 rounded-t-sm"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="group-hover:hidden">{i + 1}</span>
                    )}
                    <Play className={`w-4 h-4 mx-auto text-white ${isPlayingThis ? 'hidden' : 'hidden group-hover:block'}`} fill="currentColor" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0">
                         <Music className="w-4 h-4 text-white/20" />
                      </div>
                      <span className="font-medium text-white group-hover:text-purple-300 transition-colors truncate max-w-[200px] sm:max-w-xs">{track.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">{track.genre}</td>
                  <td className="px-6 py-4 text-white/60 text-sm">{new Date(track.createdAt).toISOString().split('T')[0]}</td>
                  <td className="px-6 py-4 text-right text-white/60 text-sm">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(track.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredLibrary.length === 0 && (
          <div className="py-20 text-center text-white/40">
            未找到匹配的曲目。
          </div>
        )}
      </div>
    </div>
  );
}
