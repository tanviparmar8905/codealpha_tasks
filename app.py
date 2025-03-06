from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__, static_folder="static")

# API for fetching random words
WORD_API = "https://random-word-api.herokuapp.com/word?number=1"

def get_random_word():
    try:
        response = requests.get(WORD_API)
        word = response.json()[0].upper()
        return word
    except Exception:
        return "PYTHON"  # Fallback word

@app.route("/")
def home():
    return render_template("hangman.html")  # Make sure "index.html" is inside "templates"

@app.route("/get-word", methods=["GET"])
def get_word():
    return jsonify({"word": get_random_word()})

if __name__ == "__main__":
    app.run(debug=True)
