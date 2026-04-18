export interface GenerationParams {
  prompt: string;
  genre: string;
  mood: string;
  duration: number; // in seconds
  instrumental: boolean;
}

export interface GenerationResult {
  id: string;
  /** Audio URL for playback */
  url: string;
  /**
   * Backward-compatible alias.
   * Prefer `url` in UI.
   */
  audioUrl?: string;
  title: string;
  duration: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * 核心音乐生成 API 接口
 * 供接入您的自定义音乐生成模型 (例如 MusicGen, Suno API, 闭源模型等)
 */
export const generateMusic = async (params: GenerationParams, apiKey?: string): Promise<GenerationResult> => {
  const aceBaseUrl = getAceStepBaseUrl();
  const aceApiKey = apiKey || getAceStepApiKey();

  const releaseUrl = `${aceBaseUrl}/release_task`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (aceApiKey) headers["Authorization"] = `Bearer ${aceApiKey}`;

  const requestData = {
    prompt: params.prompt,
    tags: [params.genre, params.mood],
    make_instrumental: params.instrumental,
    target_length: params.duration,
    audio_duration: params.duration,
    audio_format: "mp3",
    vocal_language: "zh"
  };

  const response = await fetch(releaseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Generation failed: ${errorData.error || response.statusText}`);
  }

  const result = await response.json();
  const taskId = result.data.task_id;

  // 等待任务完成
  const audioFiles = await aceWaitForAudio(taskId);
  const audioUrl = toAbsoluteAceUrl(aceBaseUrl, audioFiles[0]);

  return {
    id: taskId,
    url: audioUrl,
    audioUrl: audioUrl,
    title: params.prompt || '未命名音轨',
    duration: params.duration,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };
};

export interface LyricsParams {
  /** 歌词主题/提示词 */
  prompt: string;
  /** 歌词风格，例如抒情/流行/说唱等 */
  style: string;
  /** 粗略长度提示（分段数） */
  length: number;
  /** 可选的音频URL，用于多模态歌词生成 */
  audioUrl?: string;
}

export interface LyricsResult {
  id: string;
  title: string;
  lyrics: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * 歌词谱写 API 接口
 * 将用户提示词转成可演唱歌词文本
 * 通过 Electron 主进程调用阿里云 Qwen3 API，解决跨域问题
 */
export const writeLyrics = async (params: LyricsParams, apiKey?: string): Promise<LyricsResult> => {
  try {
    // 检查是否在 Electron 环境中
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // 通过 IPC 调用主进程的 write-lyrics 事件
      return await (window as any).electronAPI.writeLyrics(params);
    } else {
      // 非 Electron 环境下的 fallback 实现（保持原有逻辑）
      const qwenKey = apiKey || getQwenApiKey() || 'sk-9eb8b1f7282c46c6840113a328143e9e';
      if (!qwenKey) throw new Error("Missing Qwen API key");

      // 阿里云千问 API 正确的 endpoint
      const endpoint = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

      // 构建提示词
      let lyricPrompt = [
        `你是专业的中文作词助手。`,
        `请根据以下要求生成一首歌词。`,
        `风格参考：${params.style}。`,
        `主题：${params.prompt}`,
      ];

      // 如果提供了音频 URL，添加相关提示
      if (params.audioUrl) {
        lyricPrompt.push(`参考音频：${params.audioUrl}，请根据音频的旋律和氛围生成匹配的歌词。`);
      }

      lyricPrompt.push(`输出要求：只输出“歌词本体”，不要输出任何解释、分析、标题以外的多余内容；歌词中使用【主歌】、【副歌】两个小节标题即可；每个小节至少 2 行。`);

      // 构建请求体
      const requestBody = {
        model: "qwen3-turbo",
        input: {
          prompt: lyricPrompt.join("\n")
        },
        parameters: {
          temperature: 0.8,
          max_tokens: 800
        }
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${qwenKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Lyrics generation failed: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      const lyrics = result.output?.text?.trim() || '';

      if (!lyrics) {
        throw new Error("No lyrics generated");
      }

      return {
        id: Math.random().toString(36).substring(2, 11),
        title: `《${params.prompt.substring(0, 18)}${params.prompt.length > 18 ? '…' : ''}》`,
        lyrics,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };
    }
  } catch (error) {
    console.error('歌词生成失败:', error);
    throw new Error(`Lyrics generation failed: ${(error as Error).message || 'Unknown error'}`);
  }
};

export interface AiSingingParams {
  /** 歌词文本 */
  lyrics: string;
  /** 人声风格，例如女声/男声/童声/电音等 */
  voiceStyle: string;
  /** 期望时长（秒） */
  duration: number;
  /** 提示词 */
  prompt?: string;
  /** 参考音频 URL（可选） */
  referenceAudioUrl?: string;
}

export interface AiSingingResult {
  id: string;
  /** Audio URL for playback */
  url: string;
  title: string;
  duration: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
  artist?: string;
}

/**
 * AI 助唱 API 接口
 * 使用歌词文本生成对应的人声演唱音轨
 */
export const generateAiSinging = async (params: AiSingingParams, apiKey?: string): Promise<AiSingingResult> => {
  const aceBaseUrl = getAceStepBaseUrl();
  const aceApiKey = apiKey || getAceStepApiKey();

  const requestData = {
    prompt: params.prompt || '流行歌曲',
    lyrics: params.lyrics,
    thinking: true,
    task_type: "text2music",
    audio_duration: params.duration,
    audio_format: "mp3",
    vocal_language: "zh",
    reference_audio_url: params.referenceAudioUrl
  };

  const releaseUrl = `${aceBaseUrl}/release_task`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (aceApiKey) headers["Authorization"] = `Bearer ${aceApiKey}`;

  const response = await fetch(releaseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`AI singing generation failed: ${errorData.error || response.statusText}`);
  }

  const result = await response.json();
  const taskId = result.data.task_id;

  // 等待任务完成
  const audioFiles = await aceWaitForAudio(taskId);
  const audioUrl = toAbsoluteAceUrl(aceBaseUrl, audioFiles[0]);

  return {
    id: taskId,
    url: audioUrl,
    title: params.voiceStyle ? `${params.voiceStyle}助唱` : 'AI 助唱',
    duration: params.duration,
    createdAt: new Date().toISOString(),
    status: 'completed',
    artist: 'AI Vocal',
  };
};

// =============================================================================
// 本地存储工具函数
// =============================================================================

interface SavedTrack {
  id: string;
  title: string;
  url: string;
  duration: number;
  genre: string;
  mood: string;
  instrumental: boolean;
  createdAt: string;
}

/**
 * 保存生成的音乐到本地存储
 */
export const saveTrackToLibrary = (track: GenerationResult | AiSingingResult, genre: string, mood: string, instrumental: boolean): void => {
  const library = getLibraryTracks();
  const savedTrack: SavedTrack = {
    id: track.id,
    title: track.title,
    url: track.url,
    duration: track.duration,
    genre,
    mood,
    instrumental,
    createdAt: track.createdAt
  };
  library.push(savedTrack);
  localStorage.setItem('music_library', JSON.stringify(library));
};

/**
 * 获取曲库中的所有音乐
 */
export const getLibraryTracks = (): SavedTrack[] => {
  const library = localStorage.getItem('music_library');
  return library ? JSON.parse(library) : [];
};

/**
 * 删除曲库中的音乐
 */
export const removeTrackFromLibrary = (trackId: string): void => {
  const library = getLibraryTracks();
  const updatedLibrary = library.filter(track => track.id !== trackId);
  localStorage.setItem('music_library', JSON.stringify(updatedLibrary));
};

// =============================================================================
// ACE-Step v1.5 + Qwen3 Pipeline (audio->lyrics->complete music)
// =============================================================================

export interface AceStepSubmitResult {
  taskId: string;
  status: string;
}

export interface ThreeStagePipelineResult {
  demoAudioUrl: string;
  lyrics: string;
  fullAudioUrl: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getLocalStorageStr(key: string): string | undefined {
  const v = localStorage.getItem(key);
  return v ?? undefined;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function toAbsoluteAceUrl(aceBaseUrl: string, urlOrPath: string): string {
  if (!urlOrPath) return urlOrPath;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) return urlOrPath;
  if (urlOrPath.startsWith("/")) return `${normalizeBaseUrl(aceBaseUrl)}${urlOrPath}`;
  return `${normalizeBaseUrl(aceBaseUrl)}/${urlOrPath}`;
}

function getAceStepBaseUrl(): string {
  return normalizeBaseUrl(getLocalStorageStr("music_api_url") || "http://localhost:8001");
}

function getAceStepApiKey(): string | undefined {
  return getLocalStorageStr("music_api_key");
}

function getQwenBaseUrl(): string {
  return normalizeBaseUrl(
    getLocalStorageStr("qwen_api_base_url") || "https://ark.cn-beijing.volces.com/api/v3/openai"
  );
}

function getQwenApiKey(): string | undefined {
  return getLocalStorageStr("qwen_api_key");
}

function getQwenAudioModel(): string {
  return getLocalStorageStr("qwen_audio_model") || "qwen3-audio";
}

type QwenChatMessage = { role: "system" | "user"; content: any };

async function aceSubmitReleaseTaskJson(params: Record<string, any>): Promise<AceStepSubmitResult> {
  const aceBaseUrl = getAceStepBaseUrl();
  const aceApiKey = getAceStepApiKey();

  const releaseUrl = `${aceBaseUrl}/release_task`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (aceApiKey) headers["Authorization"] = `Bearer ${aceApiKey}`;

  const res = await fetch(releaseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => ({}));
  const data = json?.data;

  if (!res.ok || json?.error) {
    throw new Error(`ACE-Step /release_task failed: ${json?.error || res.statusText || res.status}`);
  }

  if (!data?.task_id) throw new Error(`ACE-Step /release_task missing task_id: ${JSON.stringify(json)}`);

  return { taskId: data.task_id, status: data.status };
}

async function aceSubmitReleaseTaskMultipart(params: {
  formFields: Record<string, string>;
  fileField: "ctx_audio" | "ref_audio";
  file: File;
}): Promise<AceStepSubmitResult> {
  const aceBaseUrl = getAceStepBaseUrl();
  const aceApiKey = getAceStepApiKey();

  const releaseUrl = `${aceBaseUrl}/release_task`;
  const form = new FormData();
  Object.entries(params.formFields).forEach(([k, v]) => form.append(k, v));
  form.append(params.fileField, params.file, params.file.name);

  const headers: Record<string, string> = {};
  if (aceApiKey) headers["Authorization"] = `Bearer ${aceApiKey}`;

  const res = await fetch(releaseUrl, {
    method: "POST",
    headers,
    body: form,
  });

  const json = await res.json().catch(() => ({}));
  const data = json?.data;

  if (!res.ok || json?.error) {
    throw new Error(`ACE-Step /release_task failed: ${json?.error || res.statusText || res.status}`);
  }

  if (!data?.task_id) throw new Error(`ACE-Step /release_task missing task_id: ${JSON.stringify(json)}`);

  return { taskId: data.task_id, status: data.status };
}

async function aceQueryResult(taskId: string): Promise<{ status: number; audioFiles: string[]; raw: any }> {
  const aceBaseUrl = getAceStepBaseUrl();
  const aceApiKey = getAceStepApiKey();
  const queryUrl = `${aceBaseUrl}/query_result`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (aceApiKey) headers["Authorization"] = `Bearer ${aceApiKey}`;

  const res = await fetch(queryUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ task_id_list: [taskId] }),
  });

  const json = await res.json().catch(() => ({}));
  const dataList = json?.data;

  if (!res.ok || json?.error) {
    throw new Error(`ACE-Step /query_result failed: ${json?.error || res.statusText || res.status}`);
  }
  if (!Array.isArray(dataList) || dataList.length < 1) {
    throw new Error(`ACE-Step /query_result unexpected payload: ${JSON.stringify(json)}`);
  }

  const item = dataList[0] ?? {};
  const status = typeof item.status === "number" ? item.status : Number(item.status ?? 0);

  // item.result is JSON-stringified array (legacy contract)
  const resultStr = item.result;
  const audioFiles: string[] = [];
  try {
    const parsed = typeof resultStr === "string" ? JSON.parse(resultStr) : resultStr;
    if (Array.isArray(parsed)) {
      parsed.forEach((x: any) => {
        if (x?.file && typeof x.file === "string") audioFiles.push(x.file);
      });
    }
  } catch {
    // ignore parse errors
  }

  return { status, audioFiles, raw: item };
}

async function aceWaitForAudio(taskId: string, opts?: { timeoutMs?: number; intervalMs?: number }) {
  const timeoutMs = opts?.timeoutMs ?? 10 * 60 * 1000;
  const intervalMs = opts?.intervalMs ?? 1500;
  const t0 = Date.now();

  while (Date.now() - t0 < timeoutMs) {
    const { status, audioFiles } = await aceQueryResult(taskId);
    if (status === 1 && audioFiles.length > 0) {
      return audioFiles;
    }
    if (status === 2) {
      throw new Error(`ACE-Step job failed. taskId=${taskId}`);
    }
    await sleep(intervalMs);
  }
  throw new Error(`ACE-Step job timeout. taskId=${taskId}`);
}

export interface ThreeStagePipelineParams {
  prompt: string;
  genre?: string;
  mood?: string;
  duration?: number; // seconds
  lyricsStyle?: string;
}

/**
 * 1) ACE-Step：生成纯音乐 demo（lyrics 为空，触发 instrumental）
 * 2) Qwen3：基于 demo audio_url 生成歌词
 * 3) ACE-Step：把 demo 音频上传为 multipart，并把歌词与歌曲结合生成完整音乐
 */
export async function generateThreeStageCompleteSong(
  params: ThreeStagePipelineParams
): Promise<ThreeStagePipelineResult> {
  const aceBaseUrl = getAceStepBaseUrl();
  const qwenKey = getQwenApiKey() || 'sk-9eb8b1f7282c46c6840113a328143e9e';
  if (!qwenKey) throw new Error("Missing `qwen_api_key` in localStorage (Settings 页面填写)");

  const duration = params.duration ?? 30;
  const lyricsStyle = params.lyricsStyle ?? "流行 (Pop)";

  // ---------------------------
  // Step 1: ACE-Step pure music demo
  // ---------------------------
  const step1 = await aceSubmitReleaseTaskJson({
    prompt: params.prompt,
    lyrics: "",
    thinking: true,
    task_type: "text2music",
    audio_duration: duration,
    audio_format: "mp3",
    vocal_language: "zh",
  });

  const step1AudioFiles = await aceWaitForAudio(step1.taskId, { timeoutMs: 12 * 60 * 1000 });
  const demoAudioUrl = toAbsoluteAceUrl(aceBaseUrl, step1AudioFiles[0]);

  // ---------------------------
  // Step 2: Qwen3 generate lyrics (audio_url -> lyrics)
  // ---------------------------
  const lyricPrompt = [
    `你是专业的中文作词助手。`,
    `请根据这段纯音乐的氛围与节奏，生成一首歌词。`,
    `风格参考：${params.genre || "流行"} + ${params.mood || "史诗"} + ${lyricsStyle}。`,
    `主题：${params.prompt}`,
    `输出要求：只输出“歌词本体”，不要输出任何解释、分析、标题以外的多余内容；歌词中使用【主歌】、【副歌】两个小节标题即可；每个小节至少 2 行。`,
  ].join("\n");

  async function qwenCallWithPayload(content: QwenChatMessage["content"]) {
    const qwenBaseUrl = getQwenBaseUrl();
    const endpoint = `${qwenBaseUrl}/chat/completions`;

    const messages: QwenChatMessage[] = [
      { role: "system", content: "You are a helpful songwriting assistant." },
      { role: "user", content },
    ];

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${qwenKey}`,
      },
      body: JSON.stringify({
        model: getQwenAudioModel(),
        messages,
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.error) {
      throw new Error(`Qwen chat failed: ${json?.error || res.statusText || res.status}`);
    }

    const text = json?.choices?.[0]?.message?.content;
    if (typeof text !== "string") {
      throw new Error(`Qwen chat empty content: ${JSON.stringify(json)}`);
    }
    return text.trim();
  }

  let lyrics = "";
  try {
    lyrics = await qwenCallWithPayload([
      { type: "audio", audio_url: demoAudioUrl },
      { type: "text", text: lyricPrompt },
    ]);
  } catch (e1: any) {
    // fallback payload format
    lyrics = await qwenCallWithPayload([
      {
        type: "input_audio",
        input_audio: { data: demoAudioUrl, format: "mp3" },
      },
      { type: "text", text: lyricPrompt },
    ]);
  }

  // ---------------------------
  // Step 3: ACE-Step complete with lyrics + demo audio upload
  // ---------------------------
  const demoBlob = await fetch(demoAudioUrl).then((r) => r.blob());
  const demoFileName = "ace_step_demo.mp3";
  const demoFile = new File([demoBlob], demoFileName, { type: demoBlob.type || "audio/mpeg" });

  const step3 = await aceSubmitReleaseTaskMultipart({
    fileField: "ctx_audio",
    file: demoFile,
    formFields: {
      prompt: params.prompt,
      lyrics,
      thinking: "true",
      task_type: "complete",
      track_classes: "vocals",
      audio_duration: String(duration),
      audio_format: "mp3",
      vocal_language: "zh",
    },
  });

  const step3AudioFiles = await aceWaitForAudio(step3.taskId, { timeoutMs: 20 * 60 * 1000 });
  const fullAudioUrl = toAbsoluteAceUrl(aceBaseUrl, step3AudioFiles[0]);

  return {
    demoAudioUrl,
    lyrics,
    fullAudioUrl,
  };
}