import json
import os

from pitch import merge_short_unions,merge_pitch_units,detect_pitch,serialize_pitch
from midi import notes_to_midi

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    audio_file = os.path.join(BASE_DIR,"input5.m4a")
    output_mid=os.path.join(BASE_DIR,"output/output.mid")
    output_wav=os.path.join(BASE_DIR,"output/output.mid")
    
    pitch_unions = merge_short_unions(merge_pitch_units(detect_pitch(audio_file)))
    
    with open(os.path.join(BASE_DIR,"output/output.json"),"w") as f:
        json.dump([serialize_pitch(union) for union in pitch_unions],f)
    
    notes_to_midi(pitch_unions,output_mid,60)
    # midi_to_wav(output_mid,output_wav)