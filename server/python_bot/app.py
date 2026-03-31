import os 
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()
HF_token = os.getenv("HF_TOKEN")
Model_id = "google/gemma-3-27b-it"

app = Flask(__name__)
# Enable CORS so our React frontend can freely communicate with this Python API
CORS(app)

class CollegeBot:
    def __init__(self):
        self.client = InferenceClient(model=Model_id, token=HF_token) if HF_token else None
        self.messages = [
            {"role": "user", "content": "Hello, how are you?"}
        ]
        
    def get_response(self, user_text):
        if not self.client:
            return "Configuration Error: HF_TOKEN is missing from your .env file."
            
        # 1. Add user message
        self.messages.append({"role": "user", "content": user_text})
        
        try:
            # 2. Get AI Model response
            response = self.client.chat_completion(
                messages=self.messages,
                max_tokens=300,
                temperature=0.7,
                top_p=0.9
            )
            
            # 3. Save and return the bot's reply
            assistant_reply = response.choices[0].message.content
            self.messages.append({"role": "assistant", "content": assistant_reply})
            
            return assistant_reply
        except Exception as e:
            self.messages.pop() # Remove the user's message if it failed so we can retry safely
            raise e

# Initialize bot instance
bot = CollegeBot()

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_text = data.get('message', '')
    if not user_text:
        return jsonify({"error": "No message provided"}), 400
        
    try:
        reply = bot.get_response(user_text)
        return jsonify({"reply": reply})
    except Exception as e:
        print(f"Error during generation: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Python Flask server on port 5001 to ensure no conflicts with the Node express server
    print("🚀 Starting Python CollegeBot API on port 5001...")
    app.run(port=5001, debug=True)
