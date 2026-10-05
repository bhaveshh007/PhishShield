import json
import uuid
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from analyzer.url_parser import parse_url, validate_url
from analyzer.security_checks import run_security_checks
from analyzer.risk_engine import calculate_risk
from database.connection import get_db_connection


scan_bp = Blueprint("scan", __name__)


@scan_bp.route("/api/scan", methods=["POST"])
def scan_url():

    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({
            "error": "URL is required"
        }), 400

    url = data["url"].strip()

    is_valid, error_message = validate_url(url)

    if not is_valid:
        return jsonify({
            "error": error_message
        }), 400

    parsed_data = parse_url(url)

    findings = run_security_checks(parsed_data)

    risk_result = calculate_risk(findings)

    https_used = parsed_data["protocol"].lower() == "https"

    scan_id = str(uuid.uuid4())

    scan_item = {
        "scan_id": scan_id,
        "url": url,
        "domain": parsed_data["domain"],
        "protocol": parsed_data["protocol"],
        "port": parsed_data["port"],
        "path": parsed_data["path"],
        "query_string": parsed_data["query"],
        "risk_score": risk_result["risk_score"],
        "risk_level": risk_result["risk_level"],
        "https_used": https_used,
        "ip_based_url": parsed_data["ip_based_url"],
        "url_length": parsed_data["url_length"],
        "findings": risk_result["findings"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    table = get_db_connection()

    table.put_item(Item=scan_item)

    return jsonify({
        "scan_id": scan_id,
        "url": url,
        "domain": parsed_data["domain"],
        "protocol": parsed_data["protocol"],
        "port": parsed_data["port"],
        "path": parsed_data["path"],
        "query": parsed_data["query"],
        "url_length": parsed_data["url_length"],
        "ip_based_url": parsed_data["ip_based_url"],
        "risk_score": risk_result["risk_score"],
        "risk_level": risk_result["risk_level"],
        "findings": risk_result["findings"]
    })