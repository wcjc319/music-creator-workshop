#!/usr/bin/env python3
import sys
import os
import tempfile
import shutil
import io

# 设置默认编码为UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

# 设置临时目录到当前工作目录，避免权限问题
temp_dir = os.path.join(os.getcwd(), 'temp')
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir, exist_ok=True)
os.environ['TMPDIR'] = temp_dir
os.environ['TEMP'] = temp_dir
os.environ['TMP'] = temp_dir

# 也设置librosa的缓存目录
os.environ['LIBROSA_CACHE_DIR'] = temp_dir

# Monkeypatch tempfile module to always use our temp directory
original_mkstemp = tempfile._mkstemp_inner
def custom_mkstemp(dir=None, prefix=None, suffix=None, flags=None, output_type=None):
    # 强制使用我们的临时目录
    return original_mkstemp(temp_dir, prefix, suffix, flags, output_type)

tempfile._mkstemp_inner = custom_mkstemp

# 导入前确保temp目录存在
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir, exist_ok=True)

from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python audio_to_midi.py <input_wav> <output_midi>")
        sys.exit(1)
    
    input_wav = sys.argv[1]
    output_midi = sys.argv[2]
    
    print(f"Processing {input_wav}...")
    print(f"Output MIDI: {output_midi}")
    
    # 检查输入文件是否存在
    if not os.path.exists(input_wav):
        print(f"错误: 输入文件不存在: {input_wav}")
        sys.exit(1)
    
    # 提取输出目录
    output_dir = os.path.dirname(output_midi)
    if not output_dir:
        output_dir = os.getcwd()
    
    # 检查输出目录是否存在
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        print(f"创建输出目录: {output_dir}")
    
    # 使用 Basic Pitch 进行预测并保存 MIDI
    try:
        # 删除已存在的输出文件
        base_name = os.path.splitext(os.path.basename(input_wav))[0]
        midi_file = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
        if os.path.exists(midi_file):
            os.remove(midi_file)
            print(f"已删除已存在的文件: {midi_file}")
        
        # 使用正确的参数格式调用 predict_and_save
        print("\n调用 predict_and_save...")
        predict_and_save(
            audio_path_list=[input_wav],
            output_directory=output_dir,
            save_midi=True,
            sonify_midi=False,
            save_model_outputs=False,
            save_notes=False,
            model_or_model_path=ICASSP_2022_MODEL_PATH
        )
        print("MIDI 生成成功!")
        print(f"MIDI 文件已保存到: {output_dir}")
        
        # 将生成的文件重命名为期望的输出文件名
        if os.path.exists(midi_file):
            # 如果目标文件已存在，先删除它
            if os.path.exists(output_midi):
                os.remove(output_midi)
                print(f"已删除已存在的目标文件: {output_midi}")
            os.rename(midi_file, output_midi)
            print(f"已将文件重命名为: {output_midi}")
        
    except Exception as e:
        # 处理Unicode编码错误
        try:
            print(f"错误: {e}")
        except UnicodeEncodeError:
            print("错误: 处理文件时发生错误")
        # 打印详细的错误信息
        import traceback
        traceback.print_exc()
        sys.exit(1)
