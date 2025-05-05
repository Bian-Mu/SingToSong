import os
import pretty_midi
import soundfile as sf
from typing import List
from midiutil import MIDIFile
from fluidsynth import Synth

from pitch import PitchUnion
from utils import getNote

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

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
        instrument=getattr(union,"instrument",1)
        track=getattr(union,"track",1)
        cut=getattr(union,"cut")
        sustain=getattr(union,'sustain')
        
        cut_beat=time_signature[1]/cut
        
        if track!=current_track:
            current_track=track
        
        # channel 10的音色不允许设置，为鼓组
        if instrument!=current_instrument:
            midi.addProgramChange(current_track,current_track,start,instrument)
            current_instrument=instrument
            
        if duration%cut_beat==0 and not sustain:
            for cut_note in range(int(duration/cut_beat)):
                midi.addNote(current_track,current_track,pitch,start+cut_note*cut_beat,cut_beat,volume)
        else:
            midi.addNote(current_track,current_track,pitch,start,duration,volume)
        
    with open(output_path,"wb") as f:
        midi.writeFile(f)
        
    print(f"success:{output_path}")

    

def midi_to_wav(midi_path,wav_path,soundfont_path=os.path.join(BASE_DIR,"src/FluidR3_GM.sf2")):
    fs = Synth()
    sfid = fs.sfload(soundfont_path)
    fs.program_select(0, sfid, 0, 0)
    
    midi_data = pretty_midi.PrettyMIDI(midi_path)
    
    audio = midi_data.fluidsynth(fs=44100)
    
    sf.write(wav_path, audio, 44100)
    
    fs.delete()
