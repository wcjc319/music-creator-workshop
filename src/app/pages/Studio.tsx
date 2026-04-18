import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Music, Loader2, Play, Download, Wand2, Mic2, FileText, ClipboardCopy } from "lucide-react";
import {
  generateMusic,
  writeLyrics,
  generateAiSinging,
  generateThreeStageCompleteSong,
  saveTrackToLibrary,
  GenerationResult,
  LyricsResult,
  AiSingingResult,
  ThreeStagePipelineResult,
} from "../services/musicApi";
import { useAudio } from "../context/AudioContext";

const GENRES = ["流行 (Pop)", "电子 (Electronic)", "嘻哈 (Hip-Hop)", "古典 (Classical)", "环境音 (Ambient)", "摇滚 (Rock)", "爵士 (Jazz)", "电影配乐 (Cinematic)"];
const MOODS = ["史诗 (Epic)", "悲伤 (Sad)", "快乐 (Happy)", "放松 (Relaxing)", "充满活力 (Energetic)", "神秘 (Mysterious)"];
const LYRIC_STYLES = ["抒情 (Ballad)", "流行 (Pop)", "说唱 (Rap)", "热血 (Energetic)", "摇滚 (Rock)"];
const VOICE_STYLES = ["男声 (Male)", "女声 (Female)", "童声 (Kids)", "电音人声 (Vocal Synth)"];

export function Studio() {
  const { playTrack } = useAudio();
  const [activeMode, setActiveMode] = useState<"music" | "lyrics" | "singing" | "pipeline">("music");

  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [duration, setDuration] = useState(30);
  const [instrumental, setInstrumental] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const [lyricsPrompt, setLyricsPrompt] = useState("");
  const [lyricsStyle, setLyricsStyle] = useState(LYRIC_STYLES[0]);
  const [lyricsLength, setLyricsLength] = useState(4);
  const [lyricsResult, setLyricsResult] = useState<LyricsResult | null>(null);

  const [singerLyrics, setSingerLyrics] = useState("");
  const [voiceStyle, setVoiceStyle] = useState(VOICE_STYLES[1]);
  const [singingDuration, setSingingDuration] = useState(30);
  const [singerResult, setSingerResult] = useState<AiSingingResult | null>(null);
  const [useReferenceAudio, setUseReferenceAudio] = useState(true);

  const [pipelineResult, setPipelineResult] = useState<ThreeStagePipelineResult | null>(null);
  const [useAudioForLyrics, setUseAudioForLyrics] = useState(false);

  const getApiKey = () => localStorage.getItem("music_api_key") || undefined;

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);
    setLyricsResult(null);
    setSingerResult(null);

    try {
      // 从本地存储获取 API Key（如果在设置中配置了）
      const apiKey = getApiKey();
      
      const res = await generateMusic({
        prompt,
        genre,
        mood,
        duration,
        instrumental
      }, apiKey);
      
      setResult(res);
    } catch (error) {
      console.error("生成失败:", error);
      // 可以在此处添加 Toast 错误提示
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWriteLyrics = async () => {
    if (!lyricsPrompt.trim() && !useAudioForLyrics) return;
    setIsGenerating(true);
    setLyricsResult(null);
    setSingerResult(null);

    try {
      const apiKey = getApiKey();
      const res = await writeLyrics(
        {
          prompt: lyricsPrompt,
          style: lyricsStyle,
          length: lyricsLength,
          audioUrl: useAudioForLyrics ? result?.url : undefined,
        },
        apiKey
      );
      setLyricsResult(res);
    } catch (error) {
      console.error("歌词谱写失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSinging = async () => {
    if (!singerLyrics.trim()) return;
    setIsGenerating(true);
    setSingerResult(null);

    try {
      const apiKey = getApiKey();
      const res = await generateAiSinging(
        {
          lyrics: singerLyrics,
          voiceStyle,
          duration: singingDuration,
          // 根据用户选择决定是否传递参考音频
          referenceAudioUrl: useReferenceAudio ? result?.url : undefined,
        },
        apiKey
      );
      setSingerResult(res);
    } catch (error) {
      console.error("AI 助唱失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThreeStagePipeline = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setPipelineResult(null);
    setLyricsResult(null);
    setSingerResult(null);

    try {
      const res = await generateThreeStageCompleteSong({
        prompt,
        genre,
        mood,
        duration,
        lyricsStyle,
      });
      setPipelineResult(res);
      setActiveMode("pipeline");
    } catch (error) {
      console.error("三段式生成失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // 当用户切到“AI助唱”且还没填入歌词时，把上一轮歌词直接带过去
    if (activeMode === "singing" && lyricsResult?.lyrics && !singerLyrics.trim()) {
      setSingerLyrics(lyricsResult.lyrics);
    }
    
    // 当用户切到“歌词谱写”且生成了音乐时，提示可以使用音频生成歌词
    if (activeMode === "lyrics" && result?.url) {
      setUseAudioForLyrics(true);
    }
  }, [activeMode, lyricsResult, singerLyrics, result]);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 xl:gap-12">
      {/* Configuration Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full xl:w-2/3 space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">创作工坊</h1>
          <p className="text-white/50 text-lg">通过描述构建属于你的独特音乐体验。</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveMode("music")}
            className={`px-4 py-2 rounded-xl text-sm transition-all border ${
              activeMode === "music"
                ? "bg-purple-500/20 border-purple-500/50 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Music className="w-4 h-4 inline-block mr-2" />
            音乐生成
          </button>
          <button
            onClick={() => setActiveMode("lyrics")}
            className={`px-4 py-2 rounded-xl text-sm transition-all border ${
              activeMode === "lyrics"
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            歌词谱写
          </button>
          <button
            onClick={() => setActiveMode("singing")}
            className={`px-4 py-2 rounded-xl text-sm transition-all border ${
              activeMode === "singing"
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Mic2 className="w-4 h-4 inline-block mr-2" />
            AI 助唱
          </button>
          <button
            onClick={() => setActiveMode("pipeline")}
            className={`px-4 py-2 rounded-xl text-sm transition-all border ${
              activeMode === "pipeline"
                ? "bg-amber-500/20 border-amber-500/50 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Wand2 className="w-4 h-4 inline-block mr-2" />
            一键三段式
          </button>
        </div>

        <div
          className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl ${
            activeMode !== "music" ? "hidden" : ""
          }`}
        >
          {/* Prompt Input */}
          <div className="mb-8 relative">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              提示词描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：一首赛博朋克风格的合成器波浪，带有强烈的鼓点和霓虹灯氛围..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
            />
            <div className="absolute bottom-4 right-4 text-xs text-white/30 font-mono">
              {prompt.length} / 500
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                音乐流派
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.slice(0, 6).map(g => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      genre === g 
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                情感氛围
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      mood === m 
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="pt-6 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  生成时长
                </label>
                <span className="text-white/40 text-xs">较长的音频需要更多生成时间</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-mono w-12 text-right">{duration}s</span>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-48 accent-purple-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  纯器乐 (Instrumental)
                </label>
                <span className="text-white/40 text-xs">不包含人声轨道</span>
              </div>
              <button 
                onClick={() => setInstrumental(!instrumental)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  instrumental ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  instrumental ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className={`flex justify-end ${activeMode !== "music" ? "hidden" : ""}`}>
          <button
            onClick={handleGenerateMusic}
            disabled={isGenerating || !prompt.trim()}
            className="group relative overflow-hidden bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="flex items-center gap-3 relative z-10">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  开始生成
                </>
              )}
            </div>
          </button>
        </div>

        {/* Lyrics Writing Panel */}
        <div
          className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl ${
            activeMode !== "lyrics" ? "hidden" : ""
          }`}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">把想法写成歌词</h2>
            <p className="text-white/50 text-sm">输入主题/氛围，生成可演唱歌词结构。</p>
          </div>

          {result?.url && (
            <div className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-white">检测到已生成的音乐</p>
                  <p className="text-xs text-white/60">可以基于此音频生成匹配的歌词</p>
                </div>
                <button
                  onClick={() => setUseAudioForLyrics(!useAudioForLyrics)}
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    useAudioForLyrics
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {useAudioForLyrics ? '使用音频' : '使用文本'}
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              歌词主题 / 提示词
            </label>
            <textarea
              value={lyricsPrompt}
              onChange={(e) => setLyricsPrompt(e.target.value)}
              placeholder="例如：失而复得的爱情，在雨夜重逢，副歌要有记忆点..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
            />
            <div className="absolute bottom-4 right-4 text-xs text-white/30 font-mono">
              {lyricsPrompt.length} / 500
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                歌词风格
              </label>
              <div className="flex flex-wrap gap-2">
                {LYRIC_STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setLyricsStyle(s)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      lyricsStyle === s
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                歌词长度
              </label>
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-mono w-12 text-right">{lyricsLength}</span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={lyricsLength}
                  onChange={(e) => setLyricsLength(Number(e.target.value))}
                  className="w-48 accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`flex justify-end ${activeMode !== "lyrics" ? "hidden" : ""}`}>
          <button
            onClick={handleWriteLyrics}
            disabled={isGenerating || !lyricsPrompt.trim()}
            className="group relative overflow-hidden bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="flex items-center gap-3 relative z-10">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  谱写中...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  生成歌词
                </>
              )}
            </div>
          </button>
        </div>

        {/* AI Singing Panel */}
        <div
          className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl ${
            activeMode !== "singing" ? "hidden" : ""
          }`}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">把歌词变成助唱</h2>
            <p className="text-white/50 text-sm">支持粘贴歌词，选择人声风格后生成音轨。</p>
          </div>

          {result?.url && (
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-white">检测到已生成的音乐</p>
                  <p className="text-xs text-white/60">可以基于此音频生成匹配的助唱</p>
                </div>
                <button
                  onClick={() => setUseReferenceAudio(!useReferenceAudio)}
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    useReferenceAudio
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {useReferenceAudio ? '使用参考音频' : '不使用参考音频'}
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-emerald-400" />
              歌词文本
            </label>
            <textarea
              value={singerLyrics}
              onChange={(e) => setSingerLyrics(e.target.value)}
              placeholder="把刚才生成的歌词粘贴到这里..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
            />
            <div className="absolute bottom-4 right-4 text-xs text-white/30 font-mono">
              {singerLyrics.length} / 2000
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                人声风格
              </label>
              <div className="flex flex-wrap gap-2">
                {VOICE_STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setVoiceStyle(s)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      voiceStyle === s
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                助唱时长
              </label>
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-mono w-12 text-right">{singingDuration}s</span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="10"
                  value={singingDuration}
                  onChange={(e) => setSingingDuration(Number(e.target.value))}
                  className="w-48 accent-emerald-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {lyricsResult?.lyrics && (
            <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
              <ClipboardCopy className="w-4 h-4" />
              已检测到“上一轮歌词”，将自动同步到此处（可手动编辑）。
            </div>
          )}
        </div>

        <div className={`flex justify-end ${activeMode !== "singing" ? "hidden" : ""}`}>
          <button
            onClick={handleGenerateSinging}
            disabled={isGenerating || !singerLyrics.trim()}
            className="group relative overflow-hidden bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="flex items-center gap-3 relative z-10">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  助唱生成中...
                </>
              ) : (
                <>
                  <Mic2 className="w-5 h-5" />
                  开始助唱
                </>
              )}
            </div>
          </button>
        </div>

        {/* Pipeline Panel */}
        <div
          className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl ${
            activeMode !== "pipeline" ? "hidden" : ""
          }`}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">一键三段式生成</h2>
            <p className="text-white/50 text-sm">
              先生成纯音乐 demo，再用多模态模型生成歌词，最后把歌词与歌曲合成为完整音乐。
            </p>
          </div>

          <div className="mb-8 relative">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              提示词描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：一首赛博朋克风格的合成器纯音乐，霓虹律动强，节奏清晰..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
            />
            <div className="absolute bottom-4 right-4 text-xs text-white/30 font-mono">
              {prompt.length} / 500
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">音乐流派</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.slice(0, 6).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      genre === g
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">情感氛围</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      mood === m
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">歌词风格（给 Qwen3）</label>
              <div className="flex flex-wrap gap-2">
                {LYRIC_STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setLyricsStyle(s)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                      lyricsStyle === s
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">生成时长</label>
                <span className="text-white/40 text-xs">越长，生成任务耗时通常越高</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-mono w-12 text-right">{duration}s</span>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-48 accent-purple-500 bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`flex justify-end ${activeMode !== "pipeline" ? "hidden" : ""}`}>
          <button
            onClick={handleThreeStagePipeline}
            disabled={isGenerating || !prompt.trim()}
            className="group relative overflow-hidden bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="flex items-center gap-3 relative z-10">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  开始三段式生成
                </>
              )}
            </div>
          </button>
        </div>
      </motion.div>

      {/* Results Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full xl:w-1/3 flex flex-col"
      >
        <div className="sticky top-10 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/10 rounded-3xl bg-black/20 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isGenerating && activeMode === "music" && !result && (
              <motion.div
                key="empty-music"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-8"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">等待灵感降临</h3>
                <p className="text-white/40 text-sm">您的音乐创作结果将显示在这里</p>
              </motion.div>
            )}

            {!isGenerating && activeMode === "lyrics" && !lyricsResult && (
              <motion.div
                key="empty-lyrics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-8"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">等待歌词生成</h3>
                <p className="text-white/40 text-sm">让 AI 把主题写成可演唱的歌词</p>
              </motion.div>
            )}

            {!isGenerating && activeMode === "singing" && !singerResult && (
              <motion.div
                key="empty-singing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-8"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic2 className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">等待助唱音轨</h3>
                <p className="text-white/40 text-sm">把歌词变成 AI 人声演唱</p>
              </motion.div>
            )}

            {!isGenerating && activeMode === "pipeline" && !pipelineResult && (
              <motion.div
                key="empty-pipeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-8"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wand2 className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">等待三段式生成</h3>
                <p className="text-white/40 text-sm">先做纯音乐 demo，再生成歌词，最后合成完整歌曲</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center w-full max-w-sm px-8"
              >
                <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-500 animate-spin-slow" />
                  <Wand2 className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {activeMode === "music"
                    ? "AI 正在合成音轨"
                    : activeMode === "lyrics"
                      ? "AI 正在谱写歌词"
                      : activeMode === "singing"
                        ? "AI 正在合成助唱"
                        : "三段式生成进行中"}
                </h3>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-1/2 animate-[progress_2s_ease-in-out_infinite]" />
                </div>
                <p className="text-white/40 text-xs mt-4 animate-pulse">
                  {activeMode === "music" ? (
                    <>正在应用 {genre} 风格与 {mood} 情绪...</>
                  ) : activeMode === "lyrics" ? (
                    <>正在解析“{lyricsPrompt.trim() ? lyricsPrompt.trim().slice(0, 18) : "主题"}”并生成结构...</>
                  ) : activeMode === "singing" ? (
                    <>正在应用 {voiceStyle} 人声风格...</>
                  ) : (
                    <>正在执行 1) 纯音乐 demo 2) 多模态歌词 3) 完整歌曲合成...</>
                  )}
                </p>
              </motion.div>
            )}

            {activeMode === "music" && result && !isGenerating && (
              <motion.div
                key="result-music"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-8 flex flex-col bg-gradient-to-b from-purple-900/20 to-transparent relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-32 h-32 bg-neutral-900 rounded-2xl mx-auto mb-8 shadow-2xl flex items-center justify-center relative group overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20" />
                    <Music className="w-12 h-12 text-white/50" />

                    <button
                      onClick={() => playTrack(result)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform">
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                      </div>
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-center mb-2 line-clamp-2">{result.title}</h3>
                  <div className="flex items-center justify-center gap-2 mb-8 text-sm">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">{genre}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">{duration}s</span>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => playTrack(result)}
                      className="flex-1 bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                      播放
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(result.url);
                          const blob = await response.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${result.title}.mp3`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('下载失败:', error);
                        }
                      }}
                      className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                    <button 
                      onClick={() => {
                        saveTrackToLibrary(result, genre, mood, instrumental);
                        alert('已保存到曲库');
                      }}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                    >
                      <Music className="w-4 h-4" />
                      保存到曲库
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeMode === "lyrics" && lyricsResult && !isGenerating && (
              <motion.div
                key="result-lyrics"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-8 flex flex-col bg-gradient-to-b from-indigo-900/20 to-transparent relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex-1 flex flex-col">
                  <div className="w-32 h-32 bg-neutral-900 rounded-2xl mx-auto mb-6 shadow-2xl flex items-center justify-center relative overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                    <FileText className="w-12 h-12 text-white/50" />
                  </div>

                  <h3 className="text-2xl font-bold text-center mb-4 line-clamp-2">{lyricsResult.title}</h3>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 min-h-[260px] overflow-hidden">
                    <pre className="text-sm text-white/75 whitespace-pre-wrap leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
                      {lyricsResult.lyrics}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}

            {activeMode === "singing" && singerResult && !isGenerating && (
              <motion.div
                key="result-singing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-8 flex flex-col bg-gradient-to-b from-emerald-900/20 to-transparent relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-32 h-32 bg-neutral-900 rounded-2xl mx-auto mb-8 shadow-2xl flex items-center justify-center relative group overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                    <Mic2 className="w-12 h-12 text-white/50" />

                    <button
                      onClick={() => playTrack(singerResult)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform">
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                      </div>
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-center mb-2 line-clamp-2">{singerResult.title}</h3>
                  <div className="flex items-center justify-center gap-2 mb-8 text-sm">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">{voiceStyle}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/80">{singerResult.duration}s</span>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => playTrack(singerResult)}
                      className="flex-1 bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                      播放
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(singerResult.url);
                          const blob = await response.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${singerResult.title}.mp3`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('下载失败:', error);
                        }
                      }}
                      className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                    <button 
                      onClick={() => {
                        saveTrackToLibrary(singerResult, genre, mood, false);
                        alert('已保存到曲库');
                      }}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                    >
                      <Music className="w-4 h-4" />
                      保存到曲库
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeMode === "pipeline" && pipelineResult && !isGenerating && (
              <motion.div
                key="result-pipeline"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-8 flex flex-col gap-6 bg-gradient-to-b from-amber-900/20 to-transparent relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex-1 flex flex-col">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold mb-2">三段式生成完成</h3>
                    <p className="text-white/50 text-sm">上：纯音乐 demo | 中：多模态歌词 | 下：完整歌曲</p>
                  </div>

                  {/* Demo */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-white/50" />
                        <span className="text-white/80 font-medium">纯音乐 demo</span>
                      </div>
                      <button
                        onClick={() =>
                          playTrack({
                            id: pipelineResult.demoAudioUrl,
                            url: pipelineResult.demoAudioUrl,
                            title: "Demo",
                            duration: duration,
                          })
                        }
                        className="px-3 py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors"
                      >
                        播放
                      </button>
                    </div>
                  </div>

                  {/* Lyrics */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 flex-1 min-h-[180px] overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-indigo-300" />
                      <span className="text-white/80 font-medium">生成歌词</span>
                    </div>
                    <pre className="text-sm text-white/75 whitespace-pre-wrap leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
                      {pipelineResult.lyrics}
                    </pre>
                  </div>

                  {/* Full */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-white/50" />
                        <span className="text-white/80 font-medium">完整歌曲</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            playTrack({
                              id: pipelineResult.fullAudioUrl,
                              url: pipelineResult.fullAudioUrl,
                              title: "完整音乐",
                              duration: duration,
                            })
                          }
                          className="px-3 py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors"
                        >
                          播放
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              const response = await fetch(pipelineResult.fullAudioUrl);
                              const blob = await response.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = "完整音乐.mp3";
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            } catch (error) {
                              console.error('下载失败:', error);
                            }
                          }}
                          className="px-3 py-2 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                        >
                          下载
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
