import os
import librosa
import numpy as np
import json
from typing import List


class PitchUnit:
    def __init__(self, time: float, pitch: float, note: str = None):
        self.time = time 
        self.pitch = pitch 
        self.note = note  # 音符名称
    
class PitchUnion:
    def __init__(self, start_time: float, duration: float, note: str):
        self.start_time = start_time 
        self.duration = duration 
        self.note = note 
    
def detect_pitch(audio_path: str, frame_length=2048, hop_length=512) -> List[PitchUnit]:
    # 创建音符到频率的映射字典
    note_to_freq = {}
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(BASE_DIR,"./src/notes.json"), 'r') as f:
        notes_data = json.load(f)
        
    for octave in notes_data:
        note_to_freq.update(octave)
    
    # 创建频率到音符的映射字典
    freq_to_note = {v: k for k, v in note_to_freq.items()}
    
    # 获取所有已知频率并排序
    known_frequencies = sorted(freq_to_note.keys())
    
    def find_closest_note(freq):
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
        if pitch > 0: 
            # 计算当前帧的时间位置和持续时间
            time_position = t * hop_length / sr
            duration = hop_length / sr
            
            note = find_closest_note(pitch)
            pitch_units.append(PitchUnit(time_position, pitch, note))
    
    return pitch_units

def merge_pitch_units(pitch_units: List[PitchUnit]) -> List[PitchUnion]:
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
            unions.append(PitchUnion(start_time, duration, current_note))
            current_note = pitch_units[i].note
            start_time = pitch_units[i-1].time + time_increment  # 新union的开始时间是当前unit的时间
            duration = time_increment
    
    # 添加最后一个union
    unions.append(PitchUnion(start_time, duration, current_note))
    
    return unions

def merge_short_unions(unions: List[PitchUnion], threshold=0.12) -> List[PitchUnion]:
    if len(unions) <= 1:
        return unions
    
    to_merge = [False] * len(unions)
    for i in range(1, len(unions)):
        if unions[i].duration < threshold:
            to_merge[i] = True
    
    merged_unions = []
    i = 0
    while i < len(unions):
        if not to_merge[i]:
            merged_unions.append(unions[i])
            i += 1
        else:
            current_union = unions[i]
            j = i - 1
            while j >= 0 and to_merge[j]:
                j -= 1
            
            if j >= 0:
                merged_unions[-1] = PitchUnion(
                    start_time=merged_unions[-1].start_time,
                    duration=merged_unions[-1].duration + current_union.duration,
                    note=merged_unions[-1].note
                )
            else:
                # 如果是第一个union且需要合并，无法合并到前一个，保留原样
                merged_unions.append(current_union)
            
            i += 1
    
    # 将merged_unions转换回PitchUnit形式以便重新合并
    pitch_units = []
    for union in merged_unions:
        pitch_units.append(PitchUnit(union.start_time, 0, union.note))
        pitch_units.append(PitchUnit(union.start_time + union.duration, 0, union.note))
    
    final_unions = merge_pitch_units(pitch_units)
    
    return final_unions


def serialize_pitch(pitch:PitchUnion):
    return {
        "start_time":  float(f"{pitch.start_time:.2f}"),  
        "duration": float(f"{pitch.duration:.2f}"), 
        "note": pitch.note
    }

