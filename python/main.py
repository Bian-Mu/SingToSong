import json
import os
from wavToPitch.pitch import PitchUnion, addNote
from wavToPitch.midi import notes_to_midi,midi_to_wav

def input_pitch_union():
    print("\n输入新的音符信息 (输入q退出):")
    try:
        track = int(input("音轨号 (整数): "))
        cut = int(input("几分音符 (如4表示4分音符): "))
        sustain=bool(int(input("是否延音（1/0）：")))
        start_beat = float(input("开始拍数 (如1.0): "))
        duration = float(input("持续拍数 (如0.5): "))
        note = input("音高 (如C4, D#3等): ").strip().upper()
        instrument=int(input("乐器编号（整数）："))
        return PitchUnion(track, cut, sustain,start_beat, duration, note,instrument)
    except ValueError:
        print("输入无效，请确保输入正确的数值类型")
        return None


if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    output_json = os.path.join(BASE_DIR, "output/output.json")
    output_mid=os.path.join(BASE_DIR,"output/output.mid")
    output_wav=os.path.join(BASE_DIR,"output/output.wav")
    
    
    with open(os.path.join(BASE_DIR,"output/configs.json")) as f:
        configs=json.load(f)
    
    pitch_unions = []
    
    if os.path.exists(output_json):
        with open(output_json, "r") as f:
            try:
                data = json.load(f)
                pitch_unions = [PitchUnion.from_dict(item) for item in data]
            except json.JSONDecodeError:
                print("文件路径已存在文件")
    
    # new_pitch = input_pitch_union()
    # addNote(new_pitch, output_json)
    # pitch_unions.append(new_pitch)
    # print(f"已添加音符: {new_pitch.note} 到音轨 {new_pitch.track}")
    
    with open(output_json,"w") as f:
        json.dump([union.to_dict() for union in pitch_unions],f)
    
    notes_to_midi(pitch_unions,output_mid,configs["tempo"],configs["timeSignature"])
    midi_to_wav(output_mid,output_wav)