//Populates each list item
function loadBlockedUrls(tabId) {
    chrome.extension.sendRequest({method: "retrieveBlockedUrls", tabId: tabId}, function (response) {
        if (response.data.length > 0) {
            $("#description").html("\
                <h2>The following resources on this page have been blocked:</h2>\
                <table id='blocklist'></table>\
            ");
            for (url in response.data) {
                $("#blocklist").append("<tr id='blocked" + url + "'><td>" + response.data[url] + "</td><td><button id='whitelist" + url + "'>Whitelist</button></td></tr>");
                $("#whitelist" + url).click(function() {
                    var button = this;
                    if (confirm("Are you sure you want to whitelist " + new URL(response.data[url]).hostname + "? This will allow all web requests to this domain, which Cymon believes is malicious.")) {
                        chrome.extension.sendRequest({
                            method: "addToWhitelist",
                            url: response.data[url]
                        }, function (response) {
                            if (response.success) {
                                button.disabled = true;
                                button.innerHTML = "Whitelisted";
                            } else {
                                $("#response").text("An error has occured: unable to add domain to whitelist.");
                            }
                        });
                    }
                });
            }
        }
    });
}

$(window).ready(function() {
    chrome.tabs.query({currentWindow: true, active : true}, function(tabs) {
        loadBlockedUrls(tabs[0].id);

        //Whitelist button
        $("#clearWhitelist").click(function() {
            if (confirm("Are you sure you want to clear all domains in your whitelist? This action cannot be undone!")) {
                chrome.extension.sendRequest({method: "clearWhitelist"}, function (response) {
                    if (response.success) {
                        $("#clearWhitelist").attr("disabled", true);
                        $("#clearWhitelist").text("Whitelist Cleared");
                    } else {
                        $("#response").text("An error has occured: unable to clear whitelist.");
                    }
                });
            }
        });
    });
});
