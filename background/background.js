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
    var tab = cymonTabs[details.tabId];

    if (tab) {
        tab.addToBlocklist(new URL(details.url).hostname);
    }
    if (details.type == "main_frame") { //Call was made from browser; redirect user to safe Cymon page
        return {redirectUrl: chrome.extension.getURL("/redirect/redirect.html")};
    } else { //Call was made within page; block request
        if ( !tab.isNotified()) {
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

/***************************************************************************
*********************************"Main"*************************************
***************************************************************************/
var whitelist = new Whitelist();
var cymonTabs = {}

//Load whitelist from local storage
chrome.storage.local.get(function (items) {
    if (items["whitelist"]) {
        whitelist.init(items["whitelist"]);
    }
    initListener();
});

//Add tab wrapper when tab is opened
chrome.tabs.onCreated.addListener(function(tab) {
    cymonTabs[tab.id] = new WrapperTab(tab.id);
    cymonTabs[tab.id].updateBadge();
});

//Remove tab wrapper when tab is closed
chrome.tabs.onRemoved.addListener(function(tabId) {
    if (tabId in cymonTabs) {
        delete cymonTabs[tabId];
    }
});

//Update the badge whenever the user changes tabs
chrome.tabs.onActivated.addListener(function(activeInfo){
    //Just in case for some reason this tab hasn't been initialized
    if (!(activeInfo.tabId in cymonTabs)) {
        cymonTabs[activeInfo.tabId] = new WrapperTab();
    }
    cymonTabs[activeInfo.tabId].updateBadge();
});

//Refresh the tab info whenever the user goes to a new page
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.url && tabId in cymonTabs) {
        cymonTabs[tabId].clearBlocklist();
        cymonTabs[tabId].updateBadge();
    }
});

//Creates wrappers for all opened tabs when the extension is initialized; only really relevant if the extension is loaded mid-session
chrome.tabs.query({}, function(tabs){
    for (var itab in tabs) {
        tab = tabs[itab];
        cymonTabs[tab.id] = new WrapperTab(tab.id);
    }
});