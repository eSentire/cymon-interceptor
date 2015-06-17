//Populates each list item
function loadBlockedUrls(tabId) {
    chrome.extension.sendRequest({method: "retrieveBlockedUrls", tabId: tabId}, function (response) {
        for (url in response.data) {
            $("#blocklist").append("<li id='blocked" + url + "'><span>" + response.data[url] + "</span><button id='allow" + url + "'>Allow</button></li>");
            $("#allow" + url).click(function() {
                var button = this;
                if (confirm("Are you sure you want to whitelist this domain? This will allow all web requests to this domain, which Cymon believes is malicious.")) {
                    chrome.extension.sendRequest({
                        method: "updateWhitelist",
                        url: response.data[url]
                    }, function (response) {
                        if (response.success) {
                            button.disabled = true;
                            button.innerHTML = "Allowed";
                        } else {
                            $("#response").text("An error has occured: unable to add domain to whitelist.");
                        }
                    });
                }
            });
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
