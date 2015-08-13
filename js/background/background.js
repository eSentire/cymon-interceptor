/******************************************************************************
***********************************Functions***********************************
******************************************************************************/
function interceptor(details) {
    var re = /[^.]+\.[^.]+$/;
    var domain = new URL(details.url).hostname;
    var match = re.exec(domain);
    if (match) {
        domain = match[0];
    }

    if (details.tabId) {
        chrome.tabs.sendMessage(
            details.tabId,
            {
                action: "addToBlocklist",
                domain: domain
            },
            function (response) {
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
            return {redirectUrl: chrome.extension.getURL("/html/redirectPage.html?dest=" + encodeURIComponent(domain))};
        } else {
            return {cancel: true};
        }
    }
}

function getUrlPatterns() {
    var urlPatterns = [];
    //Gets the blacklist, minus the whitelist, and appends "*://" and "" to create valid URL patterns for Chrome's webRequest API
    $.each($(blacklist.get()).not(whitelist.get()).get(), function(index, domain){
        urlPatterns.push("*://*." + domain + "/*");
    });
    return urlPatterns;
}

function updateListener() {
    var urls = getUrlPatterns();
    chrome.webRequest.onBeforeRequest.removeListener(interceptor); //Remove old listener

    //Chrome's webRequest API equates an empty list of URL patterns as meaning 'block everything'
    if (urls.length) {
        chrome.webRequest.onBeforeRequest.addListener(
            interceptor,
            { urls: urls },
            ["blocking"]
        );
    }
}

function performFirstTimeSetup () {
    //Initialize local data
    chrome.storage.local.set({
        blacklist: [],
        lastFetch: 0
    });

    //Check to see if data exists for user's profile; if not, create it
    chrome.storage.sync.get(function(storage) {
        var tags = {
            'blacklist': false,
            'botnet': false,
            'dnsbl': true,
            'malicious activity': false,
            'malware': false,
            'phishing': false,
            'spam': false
        };

        chrome.storage.sync.set({
            tags: storage.tags || tags,
            fetchLookback: storage.fetchLookback || 1,
            fetchInterval: storage.fetchInterval || 24,
            whitelist: storage.whitelist || []
        });
    });
}

/******************************************************************************
********************************Event Listeners********************************
******************************************************************************/

chrome.runtime.onInstalled.addListener(function(details){
    if (details.reason === "install") {
        performFirstTimeSetup();
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //Deliberate fall-through as each function can be triggered by multiple events
    switch(request.action) {
        //Refresh Listener
        case "whitelistUpdated":
        case "blacklistUpdated":
            updateListener();
            sendResponse({ success: true });
            break;

        //Fetch List
        case "fetchEvent":
            fetcher.fetchBlacklist(blacklist);
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ success: false });
            break;
    }
});


/******************************************************************************
**************************************Main*************************************
******************************************************************************/

var whitelist;
var blacklist;
var fetcher;

chrome.storage.sync.get(function (storage) {
    fetcher = new Fetcher(storage.tags, storage.fetchLookback, storage.fetchInterval, storage.lastFetch);
    whitelist = new Whitelist(storage.whitelist);
});

chrome.storage.local.get(function (storage) {
    blacklist = new Blacklist(storage.blacklist);
    chrome.runtime.sendMessage({ action: "blacklistUpdated" });
});