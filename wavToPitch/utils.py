import os
import json
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE_DIR,"./src/notes.json"), 'r') as f:
    notes_data = json.load(f)

   
def getNote(note:str)->int:
    for group in notes_data:
        if group.get(note):
            return 69 + 12 * math.log2(group.get(note) / 440.0)


# getNote("C4")