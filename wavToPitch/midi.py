from pitch import PitchUnion
from typing import List
from midiutil import MIDIFile
from utils import getNote

def notes_to_midi(pitch_unions: List[PitchUnion],output_path,tempo:int = 60,time_signature:list=[4,4]):
    
    midi=MIDIFile(16)
    midi.addTempo(0,0,tempo)
    midi.addTimeSignature(0,0,time_signature[0],time_signature[1],24)

    volume=100
    
    current_track=1
    current_instrument=None    
    
    for union in pitch_unions:
        start=getattr(union,"start_beat",0)
        duration=getattr(union,"duration",0)
        pitch=getNote(getattr(union,"note","C4"))
        instrument=getattr(union,"instrument",0)
        track=getattr(union,"track",1)
        
        if track!=current_track:
            current_track=track
        
        # channel 10的音色不允许设置，为鼓组
        if instrument!=current_instrument:
            midi.addProgramChange(current_track,current_track,start,instrument)
            current_instrument=instrument
            
        midi.addNote(current_track,current_track,pitch,start,duration,volume)
        
    with open(output_path,"wb") as f:
        midi.writeFile(f)
        
    print(f"success:{output_path}")

    
