from flask import Blueprint, jsonify

from database.connection import get_db_connection


history_bp = Blueprint("history", __name__)


@history_bp.route("/api/scans", methods=["GET"])
def get_scans():

    table = get_db_connection()

    response = table.scan()

    scans = response.get("Items", [])

    scans.sort(
        key=lambda item: item.get("created_at", ""),
        reverse=True
    )

    return jsonify({
        "count": len(scans),
        "scans": scans
    })


@history_bp.route("/api/scans/<scan_id>", methods=["GET"])
def get_scan(scan_id):

    table = get_db_connection()

    response = table.get_item(
        Key={
            "scan_id": scan_id
        }
    )

    scan = response.get("Item")

    if not scan:
        return jsonify({
            "error": "Scan not found"
        }), 404

    return jsonify(scan)