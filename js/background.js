/***************************************************************************
******************************Class Whitelist*******************************
***************************************************************************/

function Whitelist() {
    this._whitelist = []; //TODO: Make is-a
}

//To be used at the start of each session to load data from storage
Whitelist.prototype.init = function(storage) {
    if (storage) {
        this._whitelist = storage;
    }
};

Whitelist.prototype.add = function(domain) {
    var domain_pattern = "*://" + domain + "/*";
    if (this._whitelist.indexOf(domain_pattern) == -1) {
        this._whitelist.push(domain_pattern);
        chrome.storage.local.set({"whitelist": this._whitelist});
    }
};

Whitelist.prototype.get = function(){
    return this._whitelist;
};

Whitelist.prototype.clear = function () {
    this._whitelist = [];
    chrome.storage.local.set({"whitelist": []});
};

/***************************************************************************
****************************Helper Functions********************************
***************************************************************************/
//Function stub: replace with actual Cymon data in future
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

//Listens for web requests; this is where the magic happens
function interceptRequest(details) {

    chrome.tabs.sendMessage(details.tabId, { action: "addToBlocklist", domain: new URL(details.url).hostname });
    chrome.tabs.sendMessage(details.tabId, { action: "getBlocklist" }, function (response) {
        chrome.browserAction.setBadgeText({ text: response.blocklist.length.toString(), tabId: details.tabId });
    });

    if (details.type == "main_frame") { //Call was made from browser; redirect user to safe Cymon page
        return { redirectUrl: chrome.extension.getURL("/html/redirect.html") };
    } else { //Call was made within page; block request
        chrome.tabs.sendMessage(details.tabId, {action:"getNotified"}, function(response) {
            if (!response.notified) {
                chrome.notifications.create({
                    type: "basic",
                    title: "Malicious request blocked",
                    iconUrl: "../images/cymon-icon.png",
                    message: "A web request on this page was deemed malicious by Cymon and has been blocked"
                });
            }
        });

        return { cancel: true };
    }
}

/***************************************************************************
*********************************"Main"*************************************
***************************************************************************/
var whitelist = new Whitelist();

//Load whitelist from local storage
chrome.storage.local.get(function (items) {
    if (items["whitelist"]) {
        whitelist.init(items["whitelist"]);
    }
    initListener();
});