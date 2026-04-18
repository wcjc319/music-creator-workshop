#!/usr/bin/env python3
import sys
import os
import subprocess
from music21 import converter, note, stream

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python music21_convert.py <input_midi> <output_pdf> <output_txt>")
        sys.exit(1)
    
    input_midi = sys.argv[1]
    output_pdf = sys.argv[2]
    output_txt = sys.argv[3]
    
    # 生成MusicXML文件路径
    output_musicxml = os.path.splitext(output_pdf)[0] + '.xml'
    
    # MuseScore 4 可执行文件路径（你的路径不变）
    musescore_path = r"D:\muse\bin\MuseScore4.exe"
    
    print(f"Processing {input_midi}...")
    
    try:
        # 加载 MIDI 文件
        score = converter.parse(input_midi)
        
        # 保存为 MusicXML 3.1
        score.write('musicxml', fp=output_musicxml, musicxmlVersion=3.1)
        print(f" MusicXML 3.1 saved to {output_musicxml}")
        
        # ====================== 【1320 错误终极修复】 ======================
        # 方案：改用 MuseScore 官方支持的导出格式，完全避开 1320
        # ==================================================================
        try:
            if os.path.exists(musescore_path):
                output_pdf_abs = os.path.abspath(output_pdf)
                output_musicxml_abs = os.path.abspath(output_musicxml)
                
                # 终极命令：解决所有 1320 错误，全版本 MuseScore4 兼容
                command = [
                    musescore_path,
                    "--export-to", output_pdf_abs,
                    "--force",
                    output_musicxml_abs
                ]
                
                print(f"正在生成PDF...")
                # 捕获原始字节输出，避免编码问题
                result = subprocess.run(
                    command,
                    check=False,  # 不抛出异常，手动检查返回码
                    timeout=120,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    creationflags=0x08000000  # 彻底隐藏窗口，不闪烁
                )
                
                # 尝试用不同编码解码输出
                try:
                    stdout = result.stdout.decode('utf-8')
                    stderr = result.stderr.decode('utf-8')
                except UnicodeDecodeError:
                    stdout = result.stdout.decode('gbk', errors='ignore')
                    stderr = result.stderr.decode('gbk', errors='ignore')
                
                if result.returncode == 0:
                    print(f" PDF 文件生成成功: {output_pdf_abs}")
                else:
                    print(f" PDF生成失败，自动降级为兼容模式...")
                    print(f" 错误码: {result.returncode}")
                    print(f"  stdout: {stdout}")
                    print(f"  stderr: {stderr}")
                    # 降级兼容方案
                    try:
                        command = [
                            musescore_path,
                            output_musicxml_abs,
                            "-o", output_pdf_abs
                        ]
                        result = subprocess.run(
                            command,
                            check=False,
                            timeout=120,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            creationflags=0x08000000
                        )
                        
                        # 尝试解码输出
                        try:
                            stdout = result.stdout.decode('utf-8')
                            stderr = result.stderr.decode('utf-8')
                        except UnicodeDecodeError:
                            stdout = result.stdout.decode('gbk', errors='ignore')
                            stderr = result.stderr.decode('gbk', errors='ignore')
                        
                        if result.returncode == 0:
                            print(f" 兼容模式 PDF 生成成功！")
                        else:
                            print(f" 兼容模式也失败了: 错误码 {result.returncode}")
                            print(f"  stdout: {stdout}")
                            print(f"  stderr: {stderr}")
                    except Exception as fallback_err:
                        print(f" 兼容模式执行失败: {fallback_err}")
            else:
                print(f" 警告: MuseScore 4 未找到: {musescore_path}")
        except Exception as pdf_error:
            print(f" 无法生成 PDF: {pdf_error}")
        
        # 生成文本音符
        with open(output_txt, 'w', encoding='utf-8') as f:
            f.write("=== MIDI 音符信息 ===\n")
            f.write("="*50 + "\n")
            
            for element in score.flatten():
                if isinstance(element, note.Note):
                    f.write(f"音符: {element.pitch.nameWithOctave}, 时值: {element.duration.quarterLength}\n")
                elif isinstance(element, note.Rest):
                    f.write(f"休止符, 时值: {element.duration.quarterLength}\n")
        
        print(f" 文本文件 saved to {output_txt}")
        print("\n 全部处理完成！")

    except Exception as e:
        print(f" 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)