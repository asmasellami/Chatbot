from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import random

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')
intents_data = []

@app.route('/set-patterns', methods=['POST'])
def set_patterns():
    global intents_data
    intents_data = request.get_json()
    for intent in intents_data:
        intent['embeddings'] = model.encode(intent['patterns'])
    return jsonify({"message": "Patterns enregistrés avec embeddings"}), 200

@app.route('/match', methods=['POST'])
def match():
    global intents_data
    data = request.get_json()
    question = data.get("text", "")
    question_embedding = model.encode([question])[0]
    best_score = 0
    best_intent = None
    for intent in intents_data:
        scores = util.cos_sim(question_embedding, intent['embeddings'])[0]
        max_score = scores.max().item()
        if max_score > best_score:
            best_score = max_score
            best_intent = intent
    if best_score >= 0.45:
        return jsonify({
            "matched_intent_id": best_intent["intent_id"],
            "tag": best_intent.get("tag")
        })
    else:
        return jsonify({
            "matched_intent_id": None,
            "message": "aucun intent correspondant"
        }), 200

@app.route('/compute-embedding', methods=['POST'])
def compute_best_response():
    data = request.get_json()
    question = data.get("text", "")
    intent_tag = data.get("tag", None) 
    best_response = None
    matched_intent = None
    for intent in intents_data:
        if intent_tag and intent['tag'] == intent_tag:
            matched_intent = intent
            break
    if not matched_intent:
        question_embedding = model.encode([question])[0]
        best_score = 0
        for intent in intents_data:
            scores = util.cos_sim(question_embedding, intent['embeddings'])[0]
            max_score = scores.max().item()
            if max_score > best_score:
                best_score = max_score
                matched_intent = intent
    if matched_intent:
        question_embedding = model.encode([question])[0]
        scores = util.cos_sim(question_embedding, matched_intent['embeddings'])[0]
        best_index = scores.argmax().item()
        if best_index < len(matched_intent['responses']):
            best_response = matched_intent['responses'][best_index]
        else:
            best_response = random.choice(matched_intent['responses'])
    if not best_response:
        best_response = "Désolé, je n’ai pas compris votre question."

    return jsonify({
        "best_response": best_response
    })

if __name__ == '__main__':
    app.run(debug=True, port=5002)  