import json
import os
from pitch import PitchUnion, addNote
from midi import notes_to_midi

def input_pitch_union():
    print("\n输入新的音符信息 (输入q退出):")
    try:
        track = int(input("音轨号 (整数): "))
        cut = int(input("几分音符 (如4表示4分音符): "))
        start_beat = float(input("开始拍数 (如1.0): "))
        duration = float(input("持续拍数 (如0.5): "))
        note = input("音高 (如C4, D#3等): ").strip().upper()
        return PitchUnion(track, cut, start_beat, duration, note)
    except ValueError:
        print("输入无效，请确保输入正确的数值类型")
        return None


if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    output_json = os.path.join(BASE_DIR, "output/output.json")
    output_mid=os.path.join(BASE_DIR,"output/output.mid")
    pitch_unions = []
    
    if os.path.exists(output_json):
        with open(output_json, "r") as f:
            try:
                data = json.load(f)
                pitch_unions = [PitchUnion.from_dict(item) for item in data]
            except json.JSONDecodeError:
                print("文件路径已存在文件")
    
    while True:
        new_pitch = input_pitch_union()
        
        if new_pitch is None:
            continue
        if new_pitch.note.lower() == 'q':
            break
        
        addNote(new_pitch, output_json)
        pitch_unions.append(new_pitch)
        print(f"已添加音符: {new_pitch.note} 到音轨 {new_pitch.track}")
    
    with open(output_json,"w") as f:
        json.dump([union.to_dict() for union in pitch_unions],f)
    
    notes_to_midi(pitch_unions,output_mid,60)