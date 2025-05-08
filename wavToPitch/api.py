import json
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "output/output.json")

@app.route('/get-data', methods=['GET'])
def get_data():
    try:
        if os.path.exists(DATA_PATH):
            with open(DATA_PATH, 'r') as f:
                data = json.load(f)
            return jsonify({"success": True, "data": data})
        return jsonify({"success": False, "error": "File not found"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# @app.route('/process-data', methods=['POST'])
# def process_data():
#     try:
#         new_data = {"status": "processed", "result": 42}
#         with open(DATA_PATH, 'w') as f:
#             json.dump(new_data, f)
            
#         return jsonify({"success": True})
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(port=5000)