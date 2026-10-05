from urllib.parse import urlparse
import ipaddress


from urllib.parse import urlparse
import ipaddress


def validate_url(url):
    if not url:
        return False, "URL is required."

    url = url.strip()

    if not url:
        return False, "URL cannot be empty."

    parsed = urlparse(url)

    if parsed.scheme not in ["http", "https"]:
        return False, "URL must use HTTP or HTTPS."

    if not parsed.hostname:
        return False, "URL must contain a valid domain or IP address."

    return True, None

def parse_url(url):
    parsed = urlparse(url)

    domain = parsed.hostname
    protocol = parsed.scheme
    port = parsed.port
    path = parsed.path
    query = parsed.query

    ip_based_url = False

    if domain:
        try:
            ipaddress.ip_address(domain)
            ip_based_url = True
        except ValueError:
            ip_based_url = False

    return {
        "url": url,
        "protocol": protocol,
        "domain": domain,
        "port": port,
        "path": path,
        "query": query,
        "url_length": len(url),
        "ip_based_url": ip_based_url
    }