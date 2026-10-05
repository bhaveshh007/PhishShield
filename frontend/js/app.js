const urlInput = document.getElementById("urlInput");
const scanButton = document.getElementById("scanButton");
const resultSection = document.getElementById("resultSection");
const errorMessage = document.getElementById("errorMessage");

const resultUrl = document.getElementById("resultUrl");
const riskLevel = document.getElementById("riskLevel");
const riskScore = document.getElementById("riskScore");
const domain = document.getElementById("domain");
const protocol = document.getElementById("protocol");
const urlLength = document.getElementById("urlLength");

const findingsList = document.getElementById("findingsList");

const ipBased = document.getElementById("ipBased");
const httpsUsed = document.getElementById("httpsUsed");
const port = document.getElementById("port");
const path = document.getElementById("path");


scanButton.addEventListener("click", scanURL);


urlInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        scanURL();
    }

});


async function scanURL() {

    const url = urlInput.value.trim();

    if (!url) {
        showError("Please enter a URL.");
        return;
    }

    clearError();

    scanButton.disabled = true;
    scanButton.textContent = "Scanning...";

    try {

        const response = await fetch("http://127.0.0.1:5000/api/scan", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                url: url
            })

        });


        const data = await response.json();


        if (!response.ok) {
            throw new Error(data.error || "Scan failed.");
        }


        displayResult(data);


    } catch (error) {

        showError(error.message);

    } finally {

        scanButton.disabled = false;
        scanButton.textContent = "Scan URL";

    }

}


function displayResult(data) {

    resultSection.classList.remove("hidden");


    resultUrl.textContent = data.url;

    riskScore.textContent = data.risk_score;

    riskLevel.textContent = data.risk_level;

    domain.textContent = data.domain;

    protocol.textContent = data.protocol.toUpperCase();

    urlLength.textContent = data.url_length;


    ipBased.textContent = data.ip_based_url
        ? "Yes"
        : "No";


    httpsUsed.textContent = data.protocol.toLowerCase() === "https"
        ? "Yes"
        : "No";


    port.textContent = data.port || "Default";

    path.textContent = data.path || "/";


    displayFindings(data.findings);


    resultSection.scrollIntoView({
        behavior: "smooth"
    });

}


function displayFindings(findings) {

    findingsList.innerHTML = "";


    if (!findings || findings.length === 0) {

        const message = document.createElement("div");

        message.className = "no-findings";

        message.textContent = "No suspicious characteristics detected.";

        findingsList.appendChild(message);

        return;
    }


    findings.forEach(function (finding) {

        const item = document.createElement("div");

        item.className = "finding";

        item.textContent = finding;

        findingsList.appendChild(item);

    });

}


function showError(message) {

    errorMessage.textContent = message;

    resultSection.classList.add("hidden");

}


function clearError() {

    errorMessage.textContent = "";

}