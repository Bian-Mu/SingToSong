import math
import os
import json

class PitchUnion:
    def __init__(self, track:int,cut:int,sustain:bool ,start_beat: float, duration: float, note: str,instrument:int):
        self.track=track # 音轨
        self.cut=cut # 几分音符
        self.sustain=sustain # 是否延音
        self.start_beat = start_beat # 初始拍位
        self.duration = duration  # 持续节拍
        self.note = note # 音高
        self.instrument=instrument # 乐器编号
        
    
    #写    
    def to_dict(self):
        return {
            'track': self.track,
            'cut': self.cut,
            'sustain':self.sustain,
            'start_beat': self.start_beat,
            'duration': self.duration,
            'note': self.note,
            'instrument':self.instrument
        }
    
    #读 
    @classmethod
    def from_dict(cls, data):
        return cls(
            track=data['track'],
            cut=data['cut'],
            sustain=data['sustain'],
            start_beat=data['start_beat'],
            duration=data['duration'],
            note=data['note'],
            instrument=data['instrument']
        )


    def overlaps_with(self, other:"PitchUnion"):
        """检查两个PitchUnion对象在时间上是否有重叠"""
        if self.track != other.track:
            return False
        
        self_end = self.start_beat + self.duration
        other_end = other.start_beat + other.duration
        return not (self_end <= other.start_beat or other_end <= self.start_beat)
        
def addNote(input:PitchUnion,file:str):
    try:
        with open(file, 'r') as f:
            data = json.load(f)
            notes = [PitchUnion.from_dict(item) for item in data]
    except (FileNotFoundError, json.JSONDecodeError):
        notes = []

    found_overlap = False
    for i, note in enumerate(notes):
        if note.overlaps_with(input):
            notes[i] = input  # 覆盖重叠的note
            found_overlap = True
            break

    if not found_overlap:
        notes.append(input)

    with open(file, 'w') as f:
        json.dump([note.to_dict() for note in notes], f, indent=4)

def deleteNote(input:PitchUnion,file:str):
    try:
        with open(file, 'r') as f:
            data = json.load(f)
            notes = [PitchUnion.from_dict(item) for item in data]
    except (FileNotFoundError, json.JSONDecodeError):
        notes = []

    new_notes = [note for note in notes if not note.overlaps_with(input)]
    
    with open(file, 'w') as f:
        json.dump([note.to_dict() for note in new_notes], f, indent=4)

def getNote(note:str)->int:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(BASE_DIR,"./src/notes.json"), 'r') as f:
        notes_data = json.load(f)
    for group in notes_data:
        if group.get(note):
            return round(69 + 12 * math.log2(group.get(note) / 440.0))
