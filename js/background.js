/***************************************************************************
*******************************Class Options********************************
***************************************************************************/

function Options() {
    this._tags = {
        blacklist: false,
        botnet: false,
        dnsbl: true,
        malicious_activity: false,
        malware: false,
        phishing: false,
        spam: false
    };
    this._days = 1;
}

Options.prototype.init = function(storage) {
    if (storage && storage.options) {
        if (storage.options.tags) {
            this._tags = storage.options.tags;
        }
        if (storage.options.days) {
            this._days = storage.options.days;
        }
    }
};

Options.prototype.getTags = function() {
    return this._tags;
};

Options.prototype.setTags = function(tags) {
    this._tags = tags;
    chrome.storage.sync.set({
        options: {
            tags: this._tags,
            days: this._days
        }
    });
};

Options.prototype.getDays = function() {
    return this._days;
};

Options.prototype.setDays = function(days) {
    this._days = days;
    chrome.storage.sync.set({
        options: {
            tags: this._tags,
            days: this._days
        }
    });
};

/***************************************************************************
******************************Class Whitelist*******************************
***************************************************************************/

function Whitelist() {
    this._whitelist = []; //TODO: Make is-a
}

//To be used at the start of each session to load data from storage
Whitelist.prototype.init = function(storage) {
    if (storage && storage.whitelist) {
        this._whitelist = storage.whitelist;
    }
};

Whitelist.prototype.add = function(domain) {
    var domain_pattern = "*://" + domain + "/*";
    if (this._whitelist.indexOf(domain_pattern) == -1) {
        this._whitelist.push(domain_pattern);
        chrome.storage.sync.set({ whitelist: this._whitelist });
        return true;
    } else {
        return false;
    }
};


Whitelist.prototype.remove = function(domain) {
    var index = this._whitelist.indexOf(domain)
    if (index != -1) {
        this._whitelist.splice(index, 1);
        chrome.storage.sync.set({ whitelist: this._whitelist });
        return true;
    } else {
        return false;
    }
};

Whitelist.prototype.get = function(){
    return this._whitelist;
};

Whitelist.prototype.clear = function () {
    this._whitelist = [];
    chrome.storage.sync.set({ whitelist: [] });
};

/***************************************************************************
****************************Helper Functions********************************
***************************************************************************/
function retrieveBlacklist() {
    var request = new XMLHttpRequest();
    request.open("GET", 'http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/ip/dnsbl/?days=3', true); //TODO: Hard-coded URL = bad?
    request.onreadystatechange = function() {//TODO: Need login creds
        if (request.readyState == 4) {
            console.log(JSON.parse(request.responseText));
        }
    }
    request.send();
}

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
        return {cancel: true};
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

/***************************************************************************
**********************************Main**************************************
***************************************************************************/
var lastRedirect = "";
var whitelist = new Whitelist();
var options = new Options();

//Load data from local storage
chrome.storage.sync.get(function (storage) {
    options.init(storage);
    whitelist.init(storage);
    initListener();
});
