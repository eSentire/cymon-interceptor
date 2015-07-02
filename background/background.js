/***************************************************************************
******************************Class Whitelist*******************************
***************************************************************************/
function Whitelist() {
    this._whitelist = [];

    //Load whitelist from local storage
    chrome.storage.local.get(function (items) {
        this._whitelist = items["whitelist"];
    });
}

Whitelist.prototype.search = function (domain) {
    if (this._whitelist.indexOf(domain) != -1) {
        return true;
    } else {
        return false;
    }
};

Whitelist.prototype.add = function (domain) {
    if (this._whitelist.indexOf(domain) == -1) {
        this._whitelist.push(domain);
        chrome.storage.local.set({"whitelist": this._whitelist});
    }
};

Whitelist.prototype.clear = function () {
    this._whitelist = [];
    chrome.storage.local.remove("whitelist");
};

Whitelist.prototype.get = function () {
    return this._whitelist;
};

/***************************************************************************
******************************Class Blocklist*******************************
***************************************************************************/

function Blocklist() {
    this._blocklist = []
}

//Returns list of blocked domains
Blocklist.prototype.get = function() {
    return this._blocklist;
};

//Adds a domain to the list of blocked domains
Blocklist.prototype.add = function(domain) {
    if (this._blocklist.indexOf(domain) == -1) {
        this._blocklist.push(domain);
    }
};

//Adds a domain to the list of blocked domains
Blocklist.prototype.clear = function(domain) {
    this._blocklist = [];
};

/***************************************************************************
****************************Helper Functions********************************
***************************************************************************/
//Function stub: replace with actual Cymon datafeed in future
function getCymonInfo() {
    return $(["*://maps.google.com/*", "*://en.wikipedia.org/*"]).not(whitelist.get()).get();
};


//Updates the count displayed by the browserAction icon in the top bar of Chrome
function updateBadge(blocklist) {
    var count = blocklist.get().length;
    if (count) {
        chrome.browserAction.setBadgeText({"text": count.toString()});
    } else {
        chrome.browserAction.setBadgeText({"text": ""});
    }
}

/***************************************************************************
*********************************"Main"*************************************
***************************************************************************/

var whitelist = new Whitelist();
var blocklists = {}

chrome.tabs.onActivated.addListener(function(activeInfo){
    if (!(activeInfo.tabId in blocklists)) {
        blocklists[activeInfo.tabId] = new Blocklist();
    }
    updateBadge(blocklists[activeInfo.tabId]);
});

chrome.tabs.onCreated.addListener(function(tab) {
    blocklists[tab.id] = new Blocklist();
    updateBadge(blocklists[tab.id]);
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    if (tabId in blocklists) {
        delete blocklists[tabId];
    }
});

//Listens for web requests; this is where the magic happens!
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.type == "main_frame") {
            if (blocklists[details.tabId]) {
                blocklists[details.tabId].clear();
                updateBadge(blocklists[details.tabId]);
            }
        }

        var domain = new URL(details.url).hostname

        if (!whitelist.search(domain)) {
            blocklists[details.tabId].add(domain);
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
        }
        return {cancel: false};
    },
    {urls: getCymonInfo()}, //TODO: If a list of all domains were pulled from cymon and stored locally, it could be used here?
    ["blocking"]
);

