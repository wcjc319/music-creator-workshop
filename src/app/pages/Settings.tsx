import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, Key, Shield, AlertCircle, Database, Server, Link as LinkIcon, ExternalLink } from "lucide-react";

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("https://api.your-custom-model.com/v1/generate");
  const [modelType, setModelType] = useState("custom");
  const [isSaved, setIsSaved] = useState(false);

  // Qwen3 (audio->text)
  const [qwenApiKey, setQwenApiKey] = useState("");
  const [qwenApiBaseUrl, setQwenApiBaseUrl] = useState("https://ark.cn-beijing.volces.com/api/v3/openai");
  const [qwenAudioModel, setQwenAudioModel] = useState("qwen3-audio");
  
  // 曲谱转换配置
  const [scoreConverterUrl, setScoreConverterUrl] = useState("http://localhost:3001");
  const [scoreConverterTimeout, setScoreConverterTimeout] = useState("60000");
  
  // AI助唱配置
  const [aiSingingVoiceStyles, setAiSingingVoiceStyles] = useState("女声,男声,童声,电音");
  const [aiSingingQuality, setAiSingingQuality] = useState("high");
  
  // 模型参数配置
  const [temperature, setTemperature] = useState("0.8");
  const [maxTokens, setMaxTokens] = useState("800");
  
  // 音频处理配置
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [audioSampleRate, setAudioSampleRate] = useState("44100");
  const [audioBitrate, setAudioBitrate] = useState("192k");

  useEffect(() => {
    const savedKey = localStorage.getItem('music_api_key');
    const savedUrl = localStorage.getItem('music_api_url');
    const savedModel = localStorage.getItem('music_model_type');
    
    if (savedKey) setApiKey(savedKey);
    if (savedUrl) setApiUrl(savedUrl);
    if (savedModel) setModelType(savedModel);

    const savedQwenKey = localStorage.getItem('qwen_api_key');
    const savedQwenBase = localStorage.getItem('qwen_api_base_url');
    const savedQwenModel = localStorage.getItem('qwen_audio_model');
    if (savedQwenKey) setQwenApiKey(savedQwenKey);
    if (savedQwenBase) setQwenApiBaseUrl(savedQwenBase);
    if (savedQwenModel) setQwenAudioModel(savedQwenModel);
    
    // 曲谱转换配置
    const savedScoreConverterUrl = localStorage.getItem('score_converter_url');
    const savedScoreConverterTimeout = localStorage.getItem('score_converter_timeout');
    if (savedScoreConverterUrl) setScoreConverterUrl(savedScoreConverterUrl);
    if (savedScoreConverterTimeout) setScoreConverterTimeout(savedScoreConverterTimeout);
    
    // AI助唱配置
    const savedAiSingingVoiceStyles = localStorage.getItem('ai_singing_voice_styles');
    const savedAiSingingQuality = localStorage.getItem('ai_singing_quality');
    if (savedAiSingingVoiceStyles) setAiSingingVoiceStyles(savedAiSingingVoiceStyles);
    if (savedAiSingingQuality) setAiSingingQuality(savedAiSingingQuality);
    
    // 模型参数配置
    const savedTemperature = localStorage.getItem('model_temperature');
    const savedMaxTokens = localStorage.getItem('model_max_tokens');
    if (savedTemperature) setTemperature(savedTemperature);
    if (savedMaxTokens) setMaxTokens(savedMaxTokens);
    
    // 音频处理配置
    const savedAudioFormat = localStorage.getItem('audio_format');
    const savedAudioSampleRate = localStorage.getItem('audio_sample_rate');
    const savedAudioBitrate = localStorage.getItem('audio_bitrate');
    if (savedAudioFormat) setAudioFormat(savedAudioFormat);
    if (savedAudioSampleRate) setAudioSampleRate(savedAudioSampleRate);
    if (savedAudioBitrate) setAudioBitrate(savedAudioBitrate);
  }, []);

  const handleSave = () => {
    localStorage.setItem('music_api_key', apiKey);
    localStorage.setItem('music_api_url', apiUrl);
    localStorage.setItem('music_model_type', modelType);

    localStorage.setItem('qwen_api_key', qwenApiKey);
    localStorage.setItem('qwen_api_base_url', qwenApiBaseUrl);
    localStorage.setItem('qwen_audio_model', qwenAudioModel);
    
    // 曲谱转换配置
    localStorage.setItem('score_converter_url', scoreConverterUrl);
    localStorage.setItem('score_converter_timeout', scoreConverterTimeout);
    
    // AI助唱配置
    localStorage.setItem('ai_singing_voice_styles', aiSingingVoiceStyles);
    localStorage.setItem('ai_singing_quality', aiSingingQuality);
    
    // 模型参数配置
    localStorage.setItem('model_temperature', temperature);
    localStorage.setItem('model_max_tokens', maxTokens);
    
    // 音频处理配置
    localStorage.setItem('audio_format', audioFormat);
    localStorage.setItem('audio_sample_rate', audioSampleRate);
    localStorage.setItem('audio_bitrate', audioBitrate);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
      >
        <h1 className="text-3xl font-bold mb-2">模型配置 & API 设置</h1>
        <p className="text-white/50 text-lg">
          在此处接入您的自定义音乐生成大模型 (如 MusicGen, Suno, Udio 等的私有化部署)。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">生成引擎选择</h2>
            <p className="text-white/40 text-sm">选择驱动您创作工坊的底层 AI 模型。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { id: "custom", name: "自定义接口 (REST API)", desc: "对接私有部署的模型", active: true },
            { id: "suno", name: "Suno API", desc: "官方/第三方代理接口", active: false },
            { id: "musicgen", name: "Meta MusicGen", desc: "HuggingFace Endpoint", active: false }
          ].map((model) => (
            <button
              key={model.id}
              onClick={() => setModelType(model.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                modelType === model.id 
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                  : 'bg-black/40 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`font-medium ${modelType === model.id ? 'text-blue-400' : 'text-white/80'}`}>
                  {model.name}
                </span>
                <div className={`w-4 h-4 rounded-full border ${
                  modelType === model.id ? 'border-blue-400 border-[4px]' : 'border-white/20'
                }`} />
              </div>
              <p className="text-white/40 text-xs mt-1">{model.desc}</p>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              API 端点 (Endpoint URL)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com/v1/generate"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              API 密钥 (Authorization Bearer Token)
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
              />
              <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/80" />
            </div>
            <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              您的密钥仅存储在本地浏览器中，绝不会上传至我们的服务器。
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
          <a href="#" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            查看接口文档规范 <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            {isSaved ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                </span>
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存配置
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Qwen3 API */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Qwen3 音频歌词生成</h2>
            <p className="text-white/40 text-sm">用于“音频到歌词”的多模态歌词生成。</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Qwen API Base URL
            </label>
            <input
              type="text"
              value={qwenApiBaseUrl}
              onChange={(e) => setQwenApiBaseUrl(e.target.value)}
              placeholder="https://ark.cn-beijing.volces.com/api/v3/openai"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Qwen API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={qwenApiKey}
                onChange={(e) => setQwenApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
              />
              <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/80" />
            </div>
            <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              您的密钥仅存储在本地浏览器中，绝不会上传至我们的服务器。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Qwen 音频模型
            </label>
            <input
              type="text"
              value={qwenAudioModel}
              onChange={(e) => setQwenAudioModel(e.target.value)}
              placeholder="qwen3-audio"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* 曲谱转换配置 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">曲谱转换配置</h2>
            <p className="text-white/40 text-sm">配置曲谱转换服务的相关参数。</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              曲谱转换服务地址
            </label>
            <input
              type="text"
              value={scoreConverterUrl}
              onChange={(e) => setScoreConverterUrl(e.target.value)}
              placeholder="http://localhost:3001"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              转换超时时间 (毫秒)
            </label>
            <input
              type="text"
              value={scoreConverterTimeout}
              onChange={(e) => setScoreConverterTimeout(e.target.value)}
              placeholder="60000"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* AI助唱配置 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI助唱配置</h2>
            <p className="text-white/40 text-sm">配置AI助唱的相关参数。</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              人声风格选项
            </label>
            <input
              type="text"
              value={aiSingingVoiceStyles}
              onChange={(e) => setAiSingingVoiceStyles(e.target.value)}
              placeholder="女声,男声,童声,电音"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              音频质量
            </label>
            <input
              type="text"
              value={aiSingingQuality}
              onChange={(e) => setAiSingingQuality(e.target.value)}
              placeholder="high"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 font-mono text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* 模型参数配置 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">模型参数配置</h2>
            <p className="text-white/40 text-sm">配置AI模型的相关参数。</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              生成温度 (temperature)
            </label>
            <input
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="0.8"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              最大令牌数 (max_tokens)
            </label>
            <input
              type="text"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="800"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* 音频处理配置 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">音频处理配置</h2>
            <p className="text-white/40 text-sm">配置音频处理的相关参数。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              音频格式
            </label>
            <input
              type="text"
              value={audioFormat}
              onChange={(e) => setAudioFormat(e.target.value)}
              placeholder="mp3"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              采样率 (Hz)
            </label>
            <input
              type="text"
              value={audioSampleRate}
              onChange={(e) => setAudioSampleRate(e.target.value)}
              placeholder="44100"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              比特率
            </label>
            <input
              type="text"
              value={audioBitrate}
              onChange={(e) => setAudioBitrate(e.target.value)}
              placeholder="192k"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Supabase Suggestion Placeholder for UI completeness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 mb-8"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
           <Database className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">云端同步与用户管理</h3>
          <p className="text-white/60 text-sm mb-4">
            想要跨设备同步您的曲库，并为您的用户提供账户系统吗？连接数据库可以实现云端长期存储、分享功能和更高级的用量控制。
          </p>
          <button className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors">
            了解更多连接选项
          </button>
        </div>
      </motion.div>
    </div>
  );
}
