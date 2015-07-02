chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        var domain = new URL(details.url).hostname

        if (details.type == "main_frame") { //Call was made from browser; redirect user to safe Cymon page
            return {redirectUrl: chrome.extension.getURL("/redirect/redirect.html")};
        } else { //Call was made within page; block request
            chrome.notifications.create(NotificationOptions = { //Basic description: "this blocked some stuff"
                type: "basic",
                title: "Malicious request blocked",
                iconUrl: "../images/cymon-icon.png",
                message: "A web request on this page was deemed malicious by Cymon and has been blocked"
            });
            updateBadge(blocklists[details.tabId]);
            return {cancel: true};
        }
    },
    {urls: ["*://maps.google.com/*", "*://en.wikipedia.org/*"]}, //TODO: If a list of all domains were pulled from cymon and stored locally, it could be used here?
    ["blocking"]
);