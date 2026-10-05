from flask import Flask, jsonify
from flask_cors import CORS

from routes.scan import scan_bp
from routes.history import history_bp


app = Flask(__name__)
CORS(app)

app.register_blueprint(scan_bp)
app.register_blueprint(history_bp)

@app.route("/")
def home():
    return jsonify({
        "project": "PhishShield",
        "message": "PhishShield API is running"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "PhishShield API"
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )