import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3001;

// 获取当前目录路径（ES模块方式）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 用于存储用户数据的JSON文件（实际项目中应使用数据库）
const usersFile = path.join(__dirname, 'users.json');

// 加载用户数据
let users = [];
try {
  if (fs.existsSync(usersFile)) {
    const data = fs.readFileSync(usersFile, 'utf8');
    users = JSON.parse(data);
  } else {
    // 创建空的用户文件
    fs.writeFileSync(usersFile, JSON.stringify([]));
  }
} catch (error) {
  console.error('加载用户数据失败:', error);
  users = [];
}

// 保存用户数据
function saveUsers() {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('保存用户数据失败:', error);
  }
}

// JWT密钥
const JWT_SECRET = 'your-secret-key';

// 添加CORS中间件
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// 解析JSON请求体
app.use(express.json());

// 确保输出目录存在
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`创建输出目录: ${outputDir}`);
}

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`创建上传目录: ${uploadDir}`);
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('multer destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('multer filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ storage });

// 静态文件服务
app.use('/output', express.static(outputDir));

// 转换接口
app.post('/api/convert', upload.single('audio'), (req, res) => {
  console.log('========================================');
  console.log('收到转换请求');
  console.log('请求体:', req.body);
  console.log('请求文件:', req.file);
  
  try {
    if (!req.file) {
      console.error('错误: 没有收到音频文件');
      throw new Error('没有收到音频文件');
    }
    
    const audioPath = req.file.path;
    // 生成唯一ID，确保每个请求的输出文件不冲突
    const uniqueId = Date.now();
    const inputWav = path.join(outputDir, `input_${uniqueId}.wav`);
    const outputMidi = path.join(outputDir, `output_${uniqueId}.mid`);
    const outputPdf = path.join(outputDir, `score_${uniqueId}.pdf`);
    const outputTxt = path.join(outputDir, `score_${uniqueId}.txt`);
    const outputMusicXml = path.join(outputDir, `score_${uniqueId}.musicxml`);
    
    console.log('开始转换...');
    console.log('音频路径:', audioPath);
    console.log('输入WAV路径:', inputWav);
    console.log('输出MIDI路径:', outputMidi);
    
    // 检查上传的文件是否存在
    if (!fs.existsSync(audioPath)) {
      throw new Error(`上传的文件不存在: ${audioPath}`);
    }
    
    // 获取文件信息
    const stats = fs.statSync(audioPath);
    console.log('文件大小:', stats.size, 'bytes');
    console.log('文件类型:', req.file.mimetype);
    
    // 1. 转换音频为 WAV 格式
    console.log('步骤 1: 转换为 WAV');
    try {
      const ffmpegCommand = `"D:\\FFmpeg\\ffmpeg-N-123627-g5dfe661f03-win64-gpl-shared\\bin\\ffmpeg.exe" -i "${audioPath}" -acodec pcm_s16le -ar 44100 "${inputWav}" -y`;
      console.log('执行FFmpeg命令:', ffmpegCommand);
      
      // 检查FFmpeg是否存在
      const ffmpegPath = "D:\\FFmpeg\\ffmpeg-N-123627-g5dfe661f03-win64-gpl-shared\\bin\\ffmpeg.exe";
      if (!fs.existsSync(ffmpegPath)) {
        throw new Error(`FFmpeg 不存在: ${ffmpegPath}`);
      }
      
      const result = execSync(ffmpegCommand, { encoding: 'utf8', timeout: 30000 });
      console.log('FFmpeg执行结果:', result);
      console.log('WAV 转换完成');
    } catch (ffmpegError) {
      console.error('FFmpeg 转换失败:', ffmpegError.message);
      console.error('FFmpeg 错误详情:', ffmpegError);
      console.error('FFmpeg stderr:', ffmpegError.stderr);
      console.error('FFmpeg stdout:', ffmpegError.stdout);
      res.status(500).json({ 
        success: false, 
        error: 'FFmpeg 转换失败，请确保 FFmpeg 已安装',
        details: ffmpegError.message,
        stderr: ffmpegError.stderr,
        stdout: ffmpegError.stdout
      });
      return;
    }
    
    // 2. 使用 Basic Pitch 生成 MIDI
    console.log('步骤 2: 生成 MIDI');
    try {
      const pythonCommand = '"D:/anaconda/envs/music_gen/python.exe" scripts/audio_to_midi.py "' + inputWav + '" "' + outputMidi + '"';
      console.log('执行Python命令:', pythonCommand);
      
      // 检查Python是否存在
      const pythonPath = "D:/anaconda/envs/music_gen/python.exe";
      if (!fs.existsSync(pythonPath)) {
        throw new Error(`Python 不存在: ${pythonPath}`);
      }
      
      const result = execSync(pythonCommand, { encoding: 'utf8', timeout: 60000 });
      console.log('Python执行结果:', result);
      console.log('MIDI 生成完成');
    } catch (basicPitchError) {
      console.error('Basic Pitch 生成失败:', basicPitchError.message);
      console.error('Basic Pitch 错误详情:', basicPitchError);
      console.error('Basic Pitch stderr:', basicPitchError.stderr);
      console.error('Basic Pitch stdout:', basicPitchError.stdout);
      res.status(500).json({ 
        success: false, 
        error: 'Basic Pitch 生成失败，请确保 Python 和 basic-pitch 库已安装',
        details: basicPitchError.message,
        stderr: basicPitchError.stderr,
        stdout: basicPitchError.stdout
      });
      return;
    }
    
    // 3. 使用 Music21 生成简谱  这里的都是绝对路径 所以后面如果上云的话，就可以以服务器为准
    console.log('步骤 3: 生成简谱');
    try {
      const music21Command = '"D:/anaconda/envs/music_gen/python.exe" scripts/music21_convert.py "' + outputMidi + '" "' + outputPdf + '" "' + outputTxt + '"';
      console.log('执行Music21命令:', music21Command);
      
      // 捕获原始字节输出，避免编码问题
      const result = execSync(music21Command, { encoding: 'buffer', timeout: 30000 });
      
      // 尝试用不同编码解码输出
      let output;
      try {
        output = result.toString('utf8');
      } catch (e) {
        output = result.toString('gbk');
      }
      
      console.log('Music21执行结果:', output);
      console.log('简谱生成完成');
    } catch (music21Error) {
      console.error('Music21 生成失败:', music21Error.message);
      console.error('Music21 错误详情:', music21Error);
      
      // 处理错误输出的编码
      let stderr, stdout;
      try {
        stderr = music21Error.stderr ? music21Error.stderr.toString('utf8') : '';
        stdout = music21Error.stdout ? music21Error.stdout.toString('utf8') : '';
      } catch (e) {
        stderr = music21Error.stderr ? music21Error.stderr.toString('gbk') : '';
        stdout = music21Error.stdout ? music21Error.stdout.toString('gbk') : '';
      }
      
      console.error('Music21 stderr:', stderr);
      console.error('Music21 stdout:', stdout);
      
      res.status(500).json({ 
        success: false, 
        error: 'Music21 生成失败，请确保 Python 和 music21 库已安装',
        details: music21Error.message,
        stderr: stderr,
        stdout: stdout
      });
      return;
    }
    
    // 返回结果
    console.log('转换完成，返回结果');
    res.json({
      success: true,
      midi: `/output/output_${uniqueId}.mid`,
      pdf: `/output/score_${uniqueId}.pdf`,
      txt: `/output/score_${uniqueId}.txt`,
      musicxml: `/output/score_${uniqueId}.musicxml`
    });
    
  } catch (error) {
    console.error('转换失败:', error.message);
    console.error('错误详情:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    });
  }
  console.log('========================================');
});

// 健康检查
app.get('/api/health', (req, res) => {
  console.log('收到健康检查请求');
  res.json({ status: 'ok' });
});

// 认证API接口

// 注册接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 检查邮箱是否已存在
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: '邮箱已被注册' });
    }
    
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword
    };
    
    users.push(newUser);
    saveUsers(); // 保存用户数据到文件
    
    res.json({ success: true, message: '注册成功' });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, error: '注册失败' });
  }
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ success: false, error: '邮箱或密码错误' });
    }
    
    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: '邮箱或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: '未授权' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({ success: false, error: '未授权' });
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`当前工作目录: ${__dirname}`);
  console.log(`输出目录: ${outputDir}`);
  console.log(`上传目录: ${uploadDir}`);
});