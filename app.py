from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from routes.scan import scan_bp
from routes.history import history_bp
import os

app = Flask(__name__)
CORS(app)

app.register_blueprint(scan_bp)
app.register_blueprint(history_bp)

FRONTEND_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")


@app.route("/")
def home():
    return send_from_directory(FRONTEND_FOLDER, "index.html")


@app.route("/history.html")
def history_page():
    return send_from_directory(FRONTEND_FOLDER, "history.html")


@app.route("/css/<path:filename>")
def css_files(filename):
    return send_from_directory(
        os.path.join(FRONTEND_FOLDER, "css"),
        filename
    )


@app.route("/js/<path:filename>")
def js_files(filename):
    return send_from_directory(
        os.path.join(FRONTEND_FOLDER, "js"),
        filename
    )


@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "PhishShield API"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)