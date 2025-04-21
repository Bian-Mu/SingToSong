from pitch import PitchUnion
from typing import List
from midiutil import MIDIFile
from utils import getNote


def notes_to_midi(pitch_unions: List[PitchUnion],output_path,tempo:int = 120):
    
    midi=MIDIFile(1)
    midi.addTempo(0,0,tempo)
    
    track=0
    channel=0
    volume=100
    
    for union in pitch_unions:
        start=getattr(union,"start_time",0)
        duration=getattr(union,"duration",0)*tempo
        pitch=round(getNote(getattr(union,"note","C4")))
        
        midi.addNote(track,channel,pitch,start,duration,volume)
        
    with open(output_path,"wb") as f:
        midi.writeFile(f)
        
    print(f"success:{output_path}")
    