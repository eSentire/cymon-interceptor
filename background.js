var imagesUrl = chrome.extension.getURL("images/");
var redirectPageUrl = chrome.extension.getURL("redirectPage.html");

/***************************************************************************
*****************************Class BlockedUrls******************************
***************************************************************************/

//Class BlockedUrls maintains a dictionary or blocked Urls by tabId
function BlockedUrls () {
    this.Urls = {};
}

//Returns list of blocked Urls for the given tabId; returns an empty list if no Urls blocked for that tab
BlockedUrls.prototype.getUrls = function(tabId) {
    return (this.Urls[tabId] ? this.Urls[tabId] : []);
}

//Returns count of blocked Urls for given tabId; returns 0 if no Urls blocked for that tab
//No different than calling blockedUrls.getUrls(tabId).length, but slightly more convenient
BlockedUrls.prototype.getUrlCount = function(tabId) {
    return (this.Urls[tabId] ? this.Urls[tabId].length : 0);
}

//Adds a url to the dictionary of blocked Urls using tabId as a key; initializes a key/value pair for each tabId as needed
BlockedUrls.prototype.addUrl = function(tabId, url) {
    if (!this.Urls[tabId]) {
        this.Urls[tabId] = [];
    }
    this.Urls[tabId].push(url);
}

//Removes all entries for a tabId from the dictionary; called whenever a tab is closed.
BlockedUrls.prototype.dropEntries = function(tabId) {
    delete this.Urls[tabId];
}

/***************************************************************************
*****************************Helper Functions*******************************
***************************************************************************/

//Updates the count displayed by the browserAction icon in the top bar of Chrome
function updateBadge(tabId) {
    var count = blockedUrls.getUrlCount(tabId);
    if (count) {
        chrome.browserAction.setBadgeText({"text": count.toString()});
    } else {
        chrome.browserAction.setBadgeText({"text": ""});
    }
}

function searchWhiteList(url) {
    for (domain in whitelist){
        if (url.indexOf(domain) != -1) {
            return true;
		}
    }
    return false;
}

//Function stub: replace with actual Cymon datafeed in future
function getCymonResponse (url) {
	var blacklist = ["maps.google.com", "en.wikipedia.org"];
	for (var i=0; i < blacklist.length; i++) {
		if (url.indexOf(blacklist[i]) != -1) {
            return true;
		}
	}
    return false;
}


//Callback function to be executed when a web request is intercepted
function interceptCallback (details) {
    //Things to do on page load; only for web requests sent directly from browser window
    if (details.type == "main_frame") {
        if (details.url != redirectPageUrl) {
            blockedUrls.dropEntries(details.tabId);
        }
        updateBadge(details.tabId);
        delete tabsNotified[details.tabId];
    }

    //To be executed if the source is malicioius
    if (!searchWhiteList(details.url) && getCymonResponse(details.url)) {
        blockedUrls.addUrl(details.tabId, details.url);
        if (details.type == "main_frame") { //Call was made from browser; redirect user to safe Cymon page
            return {redirectUrl: redirectPageUrl};
        } else { //Call was made within page; block request
            if (!tabsNotified[details.tabId]) {
                chrome.notifications.create(NotificationOptions = { //Basic description: "this blocked some stuff"
                    type: "basic",
                    title: "Malicious request blocked",
                    iconUrl: imagesUrl + "cymon-icon.png",
                    message: "A web request on this page was deemed malicious by Cymon and has been blocked"
                }, function () {
                    tabsNotified[details.tabId] = true;
                });
            }
            updateBadge(details.tabId);
            return {cancel: true};
        }
    }
    return {cancel: false};
}

/***************************************************************************
***************************Add Event Listeners******************************
***************************************************************************/

//Listens for tab change to update badge text
chrome.tabs.onActivated.addListener(function(activeInfo){
    updateBadge(activeInfo.tabId);
});

//Listens for whenever a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId) {
    blockedUrls.dropEntries(tabId);
});

//Listens for requests from popup.js
chrome.extension.onRequest.addListener(function (request, sender, response) {
    switch (request.method) {
        case "retrieveBlockedUrls": //Retrieves the list of all URLs blocked by Cymon
            chrome.tabs.getCurrent(function () {
                response({data: blockedUrls.getUrls(request.tabId)});
            });
            break;
        case "addToWhitelist": //Adds an entry to the user's local whitelist
            var domain = new URL(request.url).hostname;
            whitelist[domain] = true;
            chrome.storage.local.set(whitelist);
            response({success: true});
            break;
        case "clearWhitelist": //Clears the whitelist
            whitelist = {};
            chrome.storage.local.clear(function(){ //TODO: There has to be some catch for a fail state in here
                response({success: true});
            });
            break;
        default:
            response({});
            break;
    }
});

//Listens for web requests; this is where the magic happens!
chrome.webRequest.onBeforeRequest.addListener(
    interceptCallback,
	{urls: ["<all_urls>"]},
	["blocking"]
);

/***************************************************************************
*********************************"Main"*************************************
***************************************************************************/

//Singleton, keeps track of all blocked Urls for a page
var blockedUrls = new BlockedUrls();

//Keeps track of tabs that have been notified of malicious activity
var tabsNotified = {}

//List of domains whitelisted by the user
var whitelist = [];

//Load whitelist from local storage
chrome.storage.local.get(function(items) {
    whitelist = items;
});