const historyTableBody =
    document.getElementById("historyTableBody");

const historyTableContainer =
    document.getElementById("historyTableContainer");

const loadingMessage =
    document.getElementById("loadingMessage");

const errorMessage =
    document.getElementById("errorMessage");

const emptyMessage =
    document.getElementById("emptyMessage");

const scanCount =
    document.getElementById("scanCount");

const refreshButton =
    document.getElementById("refreshButton");


const detailsSection =
    document.getElementById("detailsSection");

const detailsUrl =
    document.getElementById("detailsUrl");

const detailsRiskLevel =
    document.getElementById("detailsRiskLevel");

const detailsRiskScore =
    document.getElementById("detailsRiskScore");

const detailsDomain =
    document.getElementById("detailsDomain");

const detailsProtocol =
    document.getElementById("detailsProtocol");

const detailsUrlLength =
    document.getElementById("detailsUrlLength");

const detailsFindings =
    document.getElementById("detailsFindings");

const detailsIpBased =
    document.getElementById("detailsIpBased");

const detailsHttps =
    document.getElementById("detailsHttps");

const detailsPort =
    document.getElementById("detailsPort");

const detailsPath =
    document.getElementById("detailsPath");


refreshButton.addEventListener(
    "click",
    loadHistory
);


async function loadHistory() {

    loadingMessage.classList.remove("hidden");

    historyTableContainer.classList.add("hidden");

    emptyMessage.classList.add("hidden");

    errorMessage.textContent = "";

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/scans"
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.error || "Unable to load scan history."
            );
        }


        scanCount.textContent =
            `${data.count} scan${data.count === 1 ? "" : "s"} recorded`;


        loadingMessage.classList.add("hidden");


        if (!data.scans || data.scans.length === 0) {

            emptyMessage.classList.remove("hidden");

            return;
        }


        renderHistory(data.scans);

    } catch (error) {

        loadingMessage.classList.add("hidden");

        errorMessage.textContent =
            error.message;

    }

}


function renderHistory(scans) {

    historyTableBody.innerHTML = "";


    scans.forEach(function (scan) {

        const row =
            document.createElement("tr");


        const riskClass =
            getRiskClass(scan.risk_level);


        row.innerHTML = `
            <td>#${scan.scan_id}</td>

            <td class="url-cell">
                ${escapeHTML(scan.url)}
            </td>

            <td>
                ${escapeHTML(scan.domain || "-")}
            </td>

            <td>
                <strong>
                    ${scan.risk_score}
                </strong>
            </td>

            <td>
                <span class="table-risk ${riskClass}">
                    ${escapeHTML(scan.risk_level)}
                </span>
            </td>

            <td>
                ${formatDate(scan.created_at)}
            </td>

            <td>
                <button
                    class="view-button"
                    onclick="viewScan(${scan.scan_id})">
                    View
                </button>
            </td>
        `;


        historyTableBody.appendChild(row);

    });


    historyTableContainer.classList.remove(
        "hidden"
    );

}


async function viewScan(scanId) {

    errorMessage.textContent = "";

    try {

        const response = await fetch(
            `http://127.0.0.1:5000/api/scans/${scanId}`
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Unable to load scan."
            );

        }


        displayScanDetails(data);

    } catch (error) {

        errorMessage.textContent =
            error.message;

    }

}


function displayScanDetails(data) {

    detailsSection.classList.remove("hidden");


    detailsUrl.textContent =
        data.url;

    detailsRiskLevel.textContent =
        data.risk_level;

    detailsRiskScore.textContent =
        data.risk_score;

    detailsDomain.textContent =
        data.domain || "-";

    detailsProtocol.textContent =
        data.protocol
            ? data.protocol.toUpperCase()
            : "-";

    detailsUrlLength.textContent =
        data.url_length;


    detailsIpBased.textContent =
        data.ip_based_url
            ? "Yes"
            : "No";


    detailsHttps.textContent =
        data.https_used
            ? "Yes"
            : "No";


    detailsPort.textContent =
        data.port || "Default";


    detailsPath.textContent =
        data.path || "/";


    renderDetailsFindings(
        data.findings
    );


    detailsSection.scrollIntoView({
        behavior: "smooth"
    });

}


function renderDetailsFindings(findings) {

    detailsFindings.innerHTML = "";


    let parsedFindings = findings;


    if (typeof findings === "string") {

        try {

            parsedFindings =
                JSON.parse(findings);

        } catch {

            parsedFindings = [];

        }

    }


    if (
        !parsedFindings ||
        parsedFindings.length === 0
    ) {

        const message =
            document.createElement("div");

        message.className =
            "no-findings";

        message.textContent =
            "No suspicious characteristics detected.";

        detailsFindings.appendChild(message);

        return;
    }


    parsedFindings.forEach(function (finding) {

        const item =
            document.createElement("div");

        item.className =
            "finding";

        item.textContent =
            finding;

        detailsFindings.appendChild(item);

    });

}


function getRiskClass(level) {

    if (level === "LOW") {
        return "risk-low";
    }

    if (level === "MEDIUM") {
        return "risk-medium";
    }

    if (level === "HIGH") {
        return "risk-high";
    }

    if (level === "CRITICAL") {
        return "risk-critical";
    }

    return "";

}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString();

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


loadHistory();