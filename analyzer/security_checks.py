import re


SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "verification",
    "account",
    "update",
    "secure",
    "payment",
    "signin",
    "password",
    "bank"
]


def check_https(data):
    if data["protocol"].lower() != "https":
        return "URL does not use HTTPS."
    return None


def check_ip_address(data):
    if data["ip_based_url"]:
        return "URL uses an IP address instead of a domain name."
    return None


def check_suspicious_keywords(data):
    url_lower = data["url"].lower()

    found_keywords = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if keyword in url_lower
    ]

    if found_keywords:
        return f"Suspicious keyword detected: {', '.join(found_keywords)}."

    return None


def check_subdomains(data):
    domain = data["domain"]

    if not domain:
        return None

    parts = domain.split(".")

    if len(parts) > 4:
        return "URL contains an unusually high number of subdomains."

    return None


def check_suspicious_characters(data):
    url = data["url"]

    if "@" in url:
        return "URL contains the @ character."

    if "%" in url:
        return "URL contains encoded characters."

    return None


def check_url_length(data):
    if data["url_length"] > 200:
        return "URL is unusually long."

    return None


def run_security_checks(data):
    checks = [
        check_https(data),
        check_ip_address(data),
        check_suspicious_keywords(data),
        check_subdomains(data),
        check_suspicious_characters(data),
        check_url_length(data)
    ]

    return [finding for finding in checks if finding]