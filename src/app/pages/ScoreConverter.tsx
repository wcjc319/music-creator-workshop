import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileAudio, FileCode2, FileText, Download, 
  ArrowRight, Loader2, Music, CheckCircle2, 
  Settings2, Wand2, Upload 
} from "lucide-react";
import { getLibraryTracks } from "../services/musicApi";

type ConversionStep = 'idle' | 'analyzing' | 'midi' | 'jianpu' | 'done';
type AudioSource = 'library' | 'local';

export function ScoreConverter() {
  const [library, setLibrary] = useState(getLibraryTracks());
  const [selectedTrack, setSelectedTrack] = useState<typeof library[0] | null>(null);
  const [audioSource, setAudioSource] = useState<AudioSource>('library');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [step, setStep] = useState<ConversionStep>('idle');
  const [progress, setProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<{midi: string, pdf: string, txt: string} | null>(null);

  // 当曲库数据变化时更新
  useEffect(() => {
    setLibrary(getLibraryTracks());
  }, []);

  const handleStartConversion = async () => {
    if (audioSource === 'library' && !selectedTrack) return;
    if (audioSource === 'local' && !localFile) return;
    
    setStep('analyzing');
    setProgress(0);
    
    try {
      // 创建FormData
      const formData = new FormData();
      
      if (audioSource === 'library' && selectedTrack) {
        // 从曲库选择
        const audioResponse = await fetch(selectedTrack.url);
        const audioBlob = await audioResponse.blob();
        formData.append('audio', audioBlob, `${selectedTrack.id}.wav`);
      } else if (audioSource === 'local' && localFile) {
        // 本地文件上传
        formData.append('audio', localFile, localFile.name);
      }
      
      // 发送请求到后端服务器
      const response = await fetch('http://localhost:3001/api/convert', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConversionResult({
          midi: result.midi,
          pdf: result.pdf,
          txt: result.txt
        });
        
        // 模拟处理过程
        setTimeout(() => {
          setStep('midi');
          setProgress(33);
        }, 1000);

        setTimeout(() => {
          setStep('jianpu');
          setProgress(66);
        }, 2000);

        setTimeout(() => {
          setStep('done');
          setProgress(100);
        }, 3000);
      } else {
        throw new Error(result.error || '转换失败');
      }
    } catch (error) {
      console.error('转换失败:', error);
      alert(`转换失败: ${(error as Error).message}`);
      setStep('idle');
    }
  };

  const getStepStatus = (currentStep: ConversionStep, targetStep: ConversionStep) => {
    const steps: ConversionStep[] = ['idle', 'analyzing', 'midi', 'jianpu', 'done'];
    const currentIndex = steps.indexOf(currentStep);
    const targetIndex = steps.indexOf(targetStep);
    
    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 xl:gap-12">
      {/* Configuration Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full xl:w-1/2 space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">曲谱转换</h1>
          <p className="text-white/50 text-lg">将 AI 生成的音频转换为 MIDI 和数字简谱。</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <label className="block text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            选择要转换的音轨
          </label>
          
          {/* 音频来源选择 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setAudioSource('library');
                setStep('idle');
                setLocalFile(null);
              }}
              className={`flex-1 py-3 rounded-xl transition-all ${audioSource === 'library' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-black/40 border border-white/5 text-white/70 hover:bg-white/5'}`}
            >
              从曲库选择
            </button>
            <button
              onClick={() => {
                setAudioSource('local');
                setStep('idle');
                setSelectedTrack(null);
              }}
              className={`flex-1 py-3 rounded-xl transition-all ${audioSource === 'local' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300' : 'bg-black/40 border border-white/5 text-white/70 hover:bg-white/5'}`}
            >
              上传本地文件
            </button>
          </div>
          
          {/* 曲库选择 */}
          {audioSource === 'library' && (
            <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {library.length > 0 ? library.map((track) => (
                <div 
                  key={track.id}
                  onClick={() => {
                    setStep('idle');
                    setSelectedTrack(track);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedTrack?.id === track.id
                      ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedTrack?.id === track.id ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 text-white/50'
                    }`}>
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${selectedTrack?.id === track.id ? 'text-white' : 'text-white/80'}`}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-white/40 mt-1">{track.genre} • {track.duration}s</p>
                    </div>
                  </div>
                  {selectedTrack?.id === track.id && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                    <FileAudio className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/50 text-sm">还没有生成过音乐，去创作工坊开始吧！</p>
                </div>
              )}
            </div>
          )}
          
          {/* 本地文件上传 */}
          {audioSource === 'local' && (
            <div className="mb-8">
              <div 
                onClick={() => document.getElementById('localFileInput')?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  localFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <input 
                  id="localFileInput"
                  type="file" 
                  accept="audio/*" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLocalFile(file);
                      setStep('idle');
                    }
                  }}
                />
                <Upload className={`w-10 h-10 mx-auto mb-4 ${
                  localFile ? 'text-green-400' : 'text-white/50'
                }`} />
                <h4 className={`font-medium mb-2 ${
                  localFile ? 'text-white' : 'text-white/80'
                }`}>
                  {localFile ? `已选择: ${localFile.name}` : '点击上传音频文件'}
                </h4>
                <p className="text-xs text-white/40">
                  支持 MP3、WAV、FLAC 等音频格式
                </p>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                转换引擎参数
              </label>
              <span className="text-xs text-white/30 font-mono border border-white/10 px-2 py-1 rounded-md">Advanced</span>
            </div>
            
            <div className="space-y-4 text-sm text-white/60">
               <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                 <span>音高识别模型</span>
                 <span className="text-white/90 font-medium">Basic Pitch (Spotify)</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                 <span>简谱转换引擎</span>
                 <span className="text-white/90 font-medium">Music21 (MIT)</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                 <span>量化容差</span>
                 <span className="text-white/90 font-medium">1/16 Beat</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleStartConversion}
            disabled={(audioSource === 'library' && !selectedTrack) || (audioSource === 'local' && !localFile) || step !== 'idle'}
            className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="flex items-center gap-3 relative z-10">
              {step !== 'idle' && step !== 'done' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  开始转换
                </>
              )}
            </div>
          </button>
        </div>
      </motion.div>

      {/* Process & Result Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full xl:w-1/2 flex flex-col"
      >
        <div className="sticky top-10 flex flex-col min-h-[400px] md:min-h-[600px] border-2 border-dashed border-white/10 rounded-3xl bg-black/20 overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {step === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-1 p-8 text-center"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <FileCode2 className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">等待音轨输入</h3>
                <p className="text-white/40 text-sm max-w-sm">
                  请在左侧选择您想要转换的音频。<br />
                  我们将自动提取音符并生成可供演奏的数字简谱。
                </p>
              </motion.div>
            )}

            {step !== 'idle' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-1 p-6 md:p-10 relative"
              >
                {/* Progress Bar */}
                {step !== 'done' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeInOut" }}
                    />
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  {step === 'done' ? (
                    <span className="text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" /> 转换完成
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      AI 正在分析音频结构
                    </span>
                  )}
                </h3>

                {/* Pipeline UI */}
                <div className="space-y-8 flex-1">
                  {/* Step 1 */}
                  <div className={`flex items-start gap-4 transition-opacity duration-500 ${getStepStatus(step, 'analyzing') === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        getStepStatus(step, 'analyzing') === 'completed' ? 'bg-green-500/20 border-green-500 text-green-400' :
                        getStepStatus(step, 'analyzing') === 'active' ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse' :
                        'bg-white/5 border-white/10 text-white/30'
                      }`}>
                        {getStepStatus(step, 'analyzing') === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className={`w-5 h-5 ${getStepStatus(step, 'analyzing') === 'active' ? 'animate-spin' : ''}`} />}
                      </div>
                      <div className="w-0.5 h-12 bg-white/10 mt-2" />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-medium text-white/90">提取音频特征</h4>
                      <p className="text-sm text-white/50 mt-1">从 WAV 文件解析频谱和基频。</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`flex items-start gap-4 transition-opacity duration-500 ${getStepStatus(step, 'midi') === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        getStepStatus(step, 'midi') === 'completed' ? 'bg-green-500/20 border-green-500 text-green-400' :
                        getStepStatus(step, 'midi') === 'active' ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse' :
                        'bg-white/5 border-white/10 text-white/30'
                      }`}>
                        {getStepStatus(step, 'midi') === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className={`w-5 h-5 ${getStepStatus(step, 'midi') === 'active' ? 'animate-spin' : ''}`} />}
                      </div>
                      <div className="w-0.5 h-12 bg-white/10 mt-2" />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-medium text-white/90">多音高估计 (Basic Pitch)</h4>
                      <p className="text-sm text-white/50 mt-1">使用神经网络识别复音并生成 MIDI 音符事件。</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`flex items-start gap-4 transition-opacity duration-500 ${getStepStatus(step, 'jianpu') === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        getStepStatus(step, 'jianpu') === 'completed' || step === 'done' ? 'bg-green-500/20 border-green-500 text-green-400' :
                        getStepStatus(step, 'jianpu') === 'active' ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse' :
                        'bg-white/5 border-white/10 text-white/30'
                      }`}>
                        {step === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className={`w-5 h-5 ${getStepStatus(step, 'jianpu') === 'active' ? 'animate-spin' : ''}`} />}
                      </div>
                    </div>
                    <div className="pt-2">
                      <h4 className="font-medium text-white/90">数字简谱转换 (Music21)</h4>
                      <p className="text-sm text-white/50 mt-1">将 MIDI 序列量化并排版为标准的数字简谱格式。</p>
                    </div>
                  </div>
                </div>

                {/* Result Section */}
                <AnimatePresence>
                  {step === 'done' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pt-8 border-t border-white/10"
                    >
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full" />
                        
                        <div className="flex flex-col md:flex-row items-start justify-between relative z-10 gap-6">
                          <div>
                            <h4 className="font-bold text-lg mb-1">{audioSource === 'library' ? selectedTrack?.title : localFile?.name} - Score</h4>
                            <p className="text-sm text-white/50 mb-6">已生成标准 MIDI 和数字简谱文件。</p>
                            
                            <div className="flex flex-wrap gap-3">
                              <button 
                                onClick={() => window.open(`http://localhost:3001${conversionResult?.pdf}`, '_blank')}
                                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                              >
                                <Download className="w-4 h-4" />
                                简谱 (PDF)
                              </button>
                              <button 
                                onClick={() => window.open(`http://localhost:3001${conversionResult?.txt}`, '_blank')}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium transition-colors border border-white/5 text-sm"
                              >
                                <Download className="w-4 h-4" />
                                简谱 (TXT)
                              </button>
                              <button 
                                onClick={() => window.open(`http://localhost:3001${conversionResult?.midi}`, '_blank')}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium transition-colors border border-white/5 text-sm"
                              >
                                <Download className="w-4 h-4" />
                                MIDI 文件
                              </button>
                            </div>
                          </div>
                          
                          <div className="hidden md:flex w-24 h-32 bg-white text-black p-2 rounded shadow-lg transform rotate-3 flex-col opacity-80 shrink-0">
                            <div className="h-2 w-full bg-black/10 rounded-full mb-2" />
                            <div className="space-y-1">
                              <div className="text-[8px] font-mono leading-tight flex items-center justify-between">
                                <span>1=C 4/4</span>
                                <span>J=120</span>
                              </div>
                              <div className="text-xs font-serif font-bold tracking-widest text-center mt-2">
                                | 1 1 5 5 | 6 6 5 - |
                              </div>
                              <div className="text-xs font-serif font-bold tracking-widest text-center">
                                | 4 4 3 3 | 2 2 1 - |
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
