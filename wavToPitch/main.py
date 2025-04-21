import json
import os

from pitch import merge_short_unions,merge_pitch_units,detect_pitch,serialize_pitch


if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    audio_file = os.path.join(BASE_DIR,"input.m4a")
    
    pitch_unions = merge_short_unions(merge_pitch_units(detect_pitch(audio_file)))
    
    with open(os.path.join(BASE_DIR,"output/output.json"),"w") as f:
        json.dump([serialize_pitch(union) for union in pitch_unions],f)
    
    