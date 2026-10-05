def calculate_risk(findings):
    score = 0

    for finding in findings:
        if "HTTPS" in finding:
            score += 20
        elif "IP address" in finding:
            score += 30
        elif "Suspicious keyword" in finding:
            score += 15
        elif "subdomains" in finding:
            score += 15
        elif "@" in finding:
            score += 20
        elif "encoded characters" in finding:
            score += 10
        elif "unusually long" in finding:
            score += 10

    score = min(score, 100)

    if score <= 20:
        risk_level = "LOW"
    elif score <= 50:
        risk_level = "MEDIUM"
    elif score <= 75:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "findings": findings
    }