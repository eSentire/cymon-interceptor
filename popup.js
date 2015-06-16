$(window).ready(function() {
    chrome.tabs.query({currentWindow: true, active : true}, function(tabs) {

        //Populates each list item
        chrome.extension.sendRequest({method: "retrieveBlockedUrls", tabId: tabs[0].id}, function (response) {
            for (url in response.data) {
                $("#blocklist").append("<li><span>" + response.data[url] + "</span><button id='allow" + url + "'>Allow</button></li>");
                $("#allow" + url).click(function() {
                    if (confirm("Are you sure you want to whitelist this domain? This will allow all web requests to this domain, which Cymon believes is malicious.")) {
                        chrome.extension.sendRequest({
                            method: "updateWhitelist",
                            url: response.data[url]
                        }, function (response) {
                            if (response.success) {
                                $("#allow" + url).attr("disabled", true);
                                $("#allow" + url).text("Allowed");
                            } else {
                                $("#response").text("An error has occured: unable to add domain to whitelist.");
                            }
                        });
                    }
                });
            }
        });

        //Whitelist button
        $("#clearList").click(function() {
            if (confirm("Are you sure you want to clear all domains in your whitelist? This action cannot be undone!")) {
                chrome.extension.sendRequest({method: "clearWhitelist"}, function (response) {
                    if (response.success) {
                        $("#clearList").attr("disabled", true);
                        $("#clearList").text("Whitelist Cleared");
                    } else {
                        $("#response").text("An error has occured: unable to clear whitelist.");
                    }
                });
            }
        });
    });
});
