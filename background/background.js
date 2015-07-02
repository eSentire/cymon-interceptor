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

Whitelist.prototype.add = function (domain) {
    if (this._whitelist.indexOf(domain) == -1) {
        this._whitelist.push("*://" + domain + "/*");
        chrome.storage.local.set({"whitelist": this._whitelist});
        initListener();
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

Blocklist.prototype.remove = function(domain) {
    var index = this._blocklist.indexOf(domain);
    if (index != -1) {
        this._blocklist.splice(index);
    }
};

Blocklist.prototype.clear = function() {
    this._blocklist = [];
};


/***************************************************************************
*****************************Class WrapperTab*******************************
***************************************************************************/
function WrapperTab(tabId) {
    this._tabId = tabId;
    this._notified = false;
    this._blocklist = new Blocklist()
}

WrapperTab.prototype.getId = function() {
    return this._tabId;
}

WrapperTab.prototype.isNotified = function() {
    return this._notified;
}

WrapperTab.prototype.setNotified = function(notified) {
    this._notified = notified;
}

WrapperTab.prototype.getBlocklist = function () {
    return this._blocklist.get();
}

WrapperTab.prototype.addToBlocklist = function (domain) {
    this._blocklist.add(domain);
    this.updateBadge();
}

WrapperTab.prototype.removeFromBlocklist = function (domain) {
    this._blocklist.remove(domain);
    this.updateBadge();
}

WrapperTab.prototype.clearBlocklist = function () {
    this._blocklist.clear();
    this.updateBadge();
}

WrapperTab.prototype.updateBadge = function() {
    var count = this._blocklist.get().length;
    if (count) {
        chrome.browserAction.setBadgeText({"text": count.toString()});
    } else {
        chrome.browserAction.setBadgeText({"text": ""});
    }
}

/***************************************************************************
****************************Helper Functions********************************
***************************************************************************/
//Function stub: replace with actual Cymon datafeed in future
function getCymonInfo() {
    return $(["*://maps.google.com/*", "*://en.wikipedia.org/*"]).not(whitelist.get()).get();
};

function initListener() {
    chrome.webRequest.onBeforeRequest.removeListener(interceptRequest); //Remove old listener
    chrome.webRequest.onBeforeRequest.addListener(
        interceptRequest,
        {urls: getCymonInfo()}, //TODO: If a list of all domains were pulled from cymon and stored locally, it could be used here?
        ["blocking"]
    );
}

//Listens for web requests; this is where the magic happens!
function interceptRequest(details) {
    if (tabs[details.tabId]) {
        var tab = tabs[details.tabId];
        var domain = new URL(details.url).hostname;

        tab.addToBlocklist(domain);
        if (details.type == "main_frame") { //Call was made from browser; redirect user to safe Cymon page
            return {redirectUrl: chrome.extension.getURL("/redirect/redirect.html")};
        } else { //Call was made within page; block request
            if (!tab.isNotified()) {
                chrome.notifications.create(NotificationOptions = { //Basic description: "this blocked some stuff"
                    type: "basic",
                    title: "Malicious request blocked",
                    iconUrl: "../images/cymon-icon.png",
                    message: "A web request on this page was deemed malicious by Cymon and has been blocked"
                });
                tab.setNotified(true);
            }
            tab.updateBadge();
            return {cancel: true};
        }
    }
    return {cancel: false};
}

/***************************************************************************
*********************************"Main"*************************************
***************************************************************************/
var whitelist = new Whitelist();
var tabs = {}

chrome.tabs.onActivated.addListener(function(activeInfo){ //TODO: This may not be needed in a real environment
    if (!(activeInfo.tabId in tabs)) {
        tabs[activeInfo.tabId] = new WrapperTab();
    }
    tabs[activeInfo.tabId].updateBadge();
});

chrome.tabs.onCreated.addListener(function(tab) {
    tabs[tab.id] = new WrapperTab(tab.id);
    tabs[tab.id].updateBadge();
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    if (tabId in tabs) {
        delete tabs[tabId];
    }
});

chrome.tabs.onUpdated.addListener(function(tab, changeInfo) {
    if (changeInfo.url) {
        tabs[tab].clearBlocklist();
        tabs[tab].updateBadge();
    }
});

initListener();