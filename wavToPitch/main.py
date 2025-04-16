import librosa
import numpy as np
import json
from typing import List

class PitchUnit:
    def __init__(self, time: float, pitch: float, note: str = None):
        self.time = time  # 持续时间（秒）
        self.pitch = pitch  # 音高（Hz）
        self.note = note  # 音符名称
    
    def __repr__(self):
        return f"PitchUnit(time={self.time:.2f}, pitch={self.pitch:.2f}, note='{self.note}')"

class PitchUnion:
    def __init__(self, start_time: float, duration: float, note: str):
        self.start_time = start_time  # 开始时间（秒）
        self.duration = duration  # 持续时间（秒）
        self.note = note  # 音符名称
    
    def __repr__(self):
        return f"PitchUnion(start_time={self.start_time:.2f}, duration={self.duration:.2f}, note='{self.note}')"

def detect_pitch(audio_path: str, frame_length=2048, hop_length=512) -> List[PitchUnit]:
    """
    检测音频文件中的音高
    
    参数:
        audio_path: 音频文件路径
        frame_length: FFT窗口大小
        hop_length: 帧移大小
        
    返回:
        包含PitchUnit对象的列表
    """
    # 音符频率对照表
    
    # 创建音符到频率的映射字典
    note_to_freq = {}
    with open('notes.json', 'r') as f:
        notes_data = json.load(f)
        
    for octave in notes_data:
        note_to_freq.update(octave)
    
    # 创建频率到音符的映射字典
    freq_to_note = {v: k for k, v in note_to_freq.items()}
    
    # 获取所有已知频率并排序
    known_frequencies = sorted(freq_to_note.keys())
    
    def find_closest_note(freq):
        # 找到最接近的已知频率
        idx = np.searchsorted(known_frequencies, freq)
        if idx == 0:
            return freq_to_note[known_frequencies[0]]
        if idx == len(known_frequencies):
            return freq_to_note[known_frequencies[-1]]
        
        prev = known_frequencies[idx-1]
        next_ = known_frequencies[idx]
        
        if freq - prev < next_ - freq:
            return freq_to_note[prev]
        else:
            return freq_to_note[next_]
    
    # 加载音频文件
    y, sr = librosa.load(audio_path, sr=None)
    
    # 使用librosa的piptrack检测音高
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr, 
                                        n_fft=frame_length, 
                                        hop_length=hop_length)
    
    # 获取每帧中幅度最大的音高
    pitch_units = []
    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        pitch = pitches[index, t]
        if pitch > 0:  # 过滤掉无声段
            # 计算当前帧的时间位置和持续时间
            time_position = t * hop_length / sr
            duration = hop_length / sr
            
            # 找到最接近的音符
            note = find_closest_note(pitch)
            pitch_units.append(PitchUnit(time_position, pitch, note))
    
    return pitch_units

def merge_pitch_units(pitch_units: List[PitchUnit]) -> List[PitchUnion]:
    """
    合并相邻且音符相同的PitchUnit
    
    参数:
        pitch_units: PitchUnit列表
        
    返回:
        合并后的PitchUnion列表
    """
    if not pitch_units:
        return []
    
    unions = []
    current_note = pitch_units[0].note
    start_time = 0  # 第一个union的开始时间设为0
    duration = pitch_units[0].time  # 第一个union的持续时间是第一个unit的时间
    
    for i in range(1, len(pitch_units)):
        # 计算当前帧的时间增量
        time_increment = pitch_units[i].time - pitch_units[i-1].time
        
        if pitch_units[i].note == current_note:
            duration += time_increment
        else:
            # 添加当前union到列表
            unions.append(PitchUnion(start_time, duration, current_note))
            # 开始新的union
            current_note = pitch_units[i].note
            start_time = pitch_units[i-1].time + time_increment  # 新union的开始时间是当前unit的时间
            duration = time_increment
    
    # 添加最后一个union
    unions.append(PitchUnion(start_time, duration, current_note))
    
    return unions

def merge_short_unions(unions: List[PitchUnion], threshold=0.12) -> List[PitchUnion]:
    """
    合并持续时间小于阈值的PitchUnion到前一个PitchUnion
    
    参数:
        unions: PitchUnion列表
        threshold: 合并阈值（秒），默认0.12秒
        
    返回:
        处理后的PitchUnion列表
    """
    if len(unions) <= 1:
        return unions
    
    # 第一步：标记需要合并的短union
    to_merge = [False] * len(unions)
    for i in range(1, len(unions)):
        if unions[i].duration < threshold:
            to_merge[i] = True
    
    # 第二步：实际合并操作
    merged_unions = []
    i = 0
    while i < len(unions):
        if not to_merge[i]:
            # 不需要合并，直接添加
            merged_unions.append(unions[i])
            i += 1
        else:
            # 需要合并的情况
            current_union = unions[i]
            # 找到前一个不需要合并的union
            j = i - 1
            while j >= 0 and to_merge[j]:
                j -= 1
            
            if j >= 0:
                # 合并到前一个union
                merged_unions[-1] = PitchUnion(
                    start_time=merged_unions[-1].start_time,
                    duration=merged_unions[-1].duration + current_union.duration,
                    note=merged_unions[-1].note
                )
            else:
                # 如果是第一个union且需要合并，无法合并到前一个，保留原样
                merged_unions.append(current_union)
            
            i += 1
    
    # 第三步：重新检测是否有相邻相同音符可以合并
    # 将merged_unions转换回PitchUnit形式以便重新合并
    pitch_units = []
    for union in merged_unions:
        pitch_units.append(PitchUnit(union.start_time, 0, union.note))
        pitch_units.append(PitchUnit(union.start_time + union.duration, 0, union.note))
    
    # 重新合并
    final_unions = merge_pitch_units(pitch_units)
    
    return final_unions

if __name__ == "__main__":
    audio_file = "input.m4a" 
    
    pitch_unions = merge_short_unions(merge_pitch_units(detect_pitch(audio_file)))
    
    
    
    print("\n合并后的PitchUnion:")
    for i, union in enumerate(pitch_unions):
        print(f"Union {i}: {union}")
    
    print(f"Total unions after merging: {len(pitch_unions)}")