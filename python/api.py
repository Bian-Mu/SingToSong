import json
from flask import Flask, jsonify, request
import os,sys

from wavToPitch.midi import midi_to_wav, notes_to_midi
from wavToPitch.pitch import PitchUnion, addNote, deleteNote

app = Flask(__name__)

if getattr(sys, 'frozen', False):
    # 打包后执行
    app_dir = os.path.dirname(sys.executable)
    BASE_DIR = os.path.join(app_dir, '../output')  
else:
    # 开发时执行
    BASE_DIR = os.path.join(os.path.dirname(__file__), 'output')    
    os.makedirs(BASE_DIR, exist_ok=True)
    
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON = os.path.join(BASE_DIR, "output.json")
OUTPUT_MIDI = os.path.join(BASE_DIR,"output.mid")
OUTPUT_WAV = os.path.join(BASE_DIR,"output.wav")
CONFIG_PATH = os.path.join(BASE_DIR,"configs.json")

@app.route('/read-config', methods=['GET'])
def read_config():
    try:
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify({"success": True, "config": data})
        return jsonify({"success": False, "error": "File not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    

@app.route('/read-notes', methods=['GET'])
def read_notes():
    try:
        if os.path.exists(OUTPUT_JSON):
            with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify({"success": True, "pitchunions": data})
        return jsonify({"success": False, "error": "File not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/write-notes', methods=['POST'])
def write_notes():
    try:
        new_note:PitchUnion = PitchUnion(**request.get_json())
        
        if os.path.exists(OUTPUT_JSON):
            addNote(new_note,OUTPUT_JSON)
            return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    
@app.route('/delete-notes', methods=['POST'])
def delete_notes():
    try:
        delete_note:PitchUnion = PitchUnion(**request.get_json())
        
        if os.path.exists(OUTPUT_JSON):
            deleteNote(delete_note,OUTPUT_JSON)
            return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/process-midi',methods=['POST'])
def process_midi():
    try:
        if os.path.exists(OUTPUT_JSON):
            with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)
                pitch_unions = [PitchUnion.from_dict(item) for item in data]
                
            with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                configs = json.load(f)
                
                notes_to_midi(pitch_unions,OUTPUT_MIDI,configs["tempo"],configs["timeSignature"])
                midi_to_wav(OUTPUT_MIDI,OUTPUT_WAV)
                
                return jsonify({"success": True})  
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})            
                
if __name__ == '__main__':
    app.run(port=5000,debug=True)
    