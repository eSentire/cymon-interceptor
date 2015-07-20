//Function stub: replace with actual Cymon data in future
function getCymonInfo() {
    return $(["*://maps.google.com/*", "*://en.wikipedia.org/*", "*://apis.google.com/*"]).not(whitelist.get()).get();
};

function listenerCallback(details) {
    chrome.tabs.sendMessage(
        details.tabId,
        { action: "addToBlocklist", domain: new URL(details.url).hostname },
        function(response) {
            if (response && response.success) {
                chrome.browserAction.setBadgeText({
                    text: response.blocklist.length ? response.blocklist.length.toString() : "",
                    tabId: details.tabId
                });
                if (!response.notified) {
                    chrome.notifications.create({
                        type: "basic",
                        title: "Malicious request blocked",
                        iconUrl: "/images/cymon-icon.png",
                        message: "A web request on this page was deemed malicious by Cymon and has been blocked"
                    });
                }
            }
        }
    );
    if (details.type == "main_frame") {
        lastRedirect = new URL(details.url).hostname;
        return { redirectUrl: chrome.extension.getURL("/html/redirectPage.html") };
    } else {
        return { cancel: true };
    }
}

//Needs to be called on startup; also whenever the whitelist is updated
function initListener() {
    chrome.webRequest.onBeforeRequest.removeListener(listenerCallback); //Remove old listener
    chrome.webRequest.onBeforeRequest.addListener(
        listenerCallback,
        { urls: getCymonInfo() }, //TODO: If a list of all domains were pulled from cymon and stored locally, it could be used here?
        ["blocking"]
    );
}

var lastRedirect = "";
var whitelist = new Whitelist();
var options = new Options();

//Load data from local storage
chrome.storage.sync.get(function (storage) {
    options.init(storage);
    whitelist.init(storage);
    initListener();
});
