
var imagesUrl = chrome.extension.getURL("images/");
var redirectPageUrl = chrome.extension.getURL("redirectPage.html");
var blockedUrls = [];
var blockedCount = {};

function updateBlockedCount(tabId){
    if (blockedCount[tabId]) {
        blockedCount[tabId]++;
    } else {
        blockedCount[tabId] = 1;
    }
}

function getCymonResponse (url) {
	var blacklist = ["maps.google.com"];
	for (var i=0; i < blacklist.length; i++) {
		if (url.indexOf(blacklist[i]) != -1) {
            return true;
		}
	}
    return false;
}

function interceptCallback (details) {
    if (getCymonResponse(details.url)) {
        blockedUrls.push(details.url);
        if (details.type == "main_frame") { //Call was made from browser; redirect user to safe Cymon page
            return {redirectUrl: redirectPageUrl};
        } else { //Call was made within page; block request
            chrome.notifications.create(NotificationOptions = { //Basic description: "this blocked some stuff"
                    type: "basic",
                    title: "Malicious request blocked",
                    iconUrl: imagesUrl + "cymon-icon.png",
                    message: "A web request on this page was deemed malicious by Cymon and has been blocked"
            });

            updateBlockedCount(details.tabId);
            chrome.browserAction.setBadgeText({"text": blockedCount[details.tabId].toString()});

            return {cancel: true};
        }
    }
}

chrome.extension.onRequest.addListener(function (request, sender, response) {
    if (request.method == "retrieveBlockedURLs") {
        response({data: blockedUrls});
    } else {
        response({data: "Failed to retrieve data"});
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    interceptCallback,
	{urls: ["<all_urls>"]},
	["blocking"]
);
