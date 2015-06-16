var imagesUrl = chrome.extension.getURL("images/");
var redirectPageUrl = chrome.extension.getURL("redirectPage.html");

//Class BlockedURLs maintains a dictionary or blocked URLs by tabId
function BlockedURLs () {
    this.URLs = {};
}

//Returns list of blocked URLs for the given tabId; returns an empty list if no URLs blocked for that tab
BlockedURLs.prototype.getURLs = function(tabId) {
    return (this.URLs[tabId] ? this.URLs[tabId] : []);
}

//Returns count of blocked URLs for given tabId; returns 0 if no URLs blocked for that tab
//No different than calling blockedURLs.getURLs(tabId).length, but slightly more convenient
BlockedURLs.prototype.getURLCount = function(tabId) {
    return (this.URLs[tabId] ? this.URLs[tabId].length : 0);
}

//Adds a URL to the dictionary of blocked URLs using tabId as a key; initializes a key/value pair for each tabId as needed
BlockedURLs.prototype.addURL = function(tabId, URL) {
    if (!this.URLs[tabId]) {
        this.URLs[tabId] = [];
    }
    this.URLs[tabId].push(URL);
}

//Removes all entries for a tabId from the dictionary; called whenever a tab is closed.
BlockedURLs.prototype.removeTab = function(tabId) {
    delete this.URLs[tabId];
}

//Updates the count displayed by the browserAction icon in the top bar of Chrome
function updateBadge(tabId) {
    var count = blockedURLs.getURLCount(tabId);
    if (count) {
        chrome.browserAction.setBadgeText({"text": count.toString()});
    } else {
        chrome.browserAction.setBadgeText({"text": ""});
    }
}

//Function stub: replace with actual Cymon datafeed in future
function getCymonResponse (url) {
	var blacklist = ["maps.google.com","maps.google.ca"];
	for (var i=0; i < blacklist.length; i++) {
		if (url.indexOf(blacklist[i]) != -1) {
            return true;
		}
	}
    return false;
}


//Callback function to be executed when a web request is intercepted
function interceptCallback (details) {
    if (getCymonResponse(details.url)) {
        blockedURLs.addURL(details.tabId, details.url);
        if (details.type == "main_frame") { //Call was made from browser; redirect user to safe Cymon page
            return {redirectUrl: redirectPageUrl};
        } else { //Call was made within page; block request
            chrome.notifications.create(NotificationOptions = { //Basic description: "this blocked some stuff"
                    type: "basic",
                    title: "Malicious request blocked",
                    iconUrl: imagesUrl + "cymon-icon.png",
                    message: "A web request on this page was deemed malicious by Cymon and has been blocked"
            });
            updateBadge(details.tabId);
            return {cancel: true};
        }
    }
}

//Listens for tab change to update badge text
chrome.tabs.onActivated.addListener(function(activeInfo){
    updateBadge(activeInfo.tabId);
});

//Listens for whenever a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId) {
    blockedURLs.removeTab(tabId);
});

//Listens for request from popup.html to retrieve list of URLs
chrome.extension.onRequest.addListener(function (request, sender, response) {
    if (request.method == "retrieveBlockedURLs") {
        chrome.tabs.getCurrent(function() {
            response({data: blockedURLs.getURLs(request.tabId)});
        })
    } else {
        response({});
    }
});

//Listens for web requests
chrome.webRequest.onBeforeRequest.addListener(
    interceptCallback,
	{urls: ["<all_urls>"]},
	["blocking"]
);

blockedURLs = new BlockedURLs();