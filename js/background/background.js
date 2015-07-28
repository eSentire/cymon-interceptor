/******************************************************************************
***********************************Functions***********************************
******************************************************************************/
function interceptor(details) {
    chrome.tabs.sendMessage(
        details.tabId,
        {
            action: "addToBlocklist",
            domain: new URL(details.url).hostname
        },
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
        return { redirectUrl: chrome.extension.getURL("/html/redirectPage.html?dest=" + encodeURIComponent(new URL(details.url).hostname)) };
    } else {
        return { cancel: true };
    }
}

function getUrlPatterns() {
    var urlPatterns = [];
    //Gets the blacklist, minus the whitelist, and appends "*://" and "/*" to create valid URL patterns for Chrome's webRequest API
    $.each($(blacklist.getBlacklist()).not(whitelist.get()).get(), function(index, domain){
        urlPatterns.push("*://" + domain + "/*");
    });
    return urlPatterns;
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

function fetchRequest(url) {
    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            var response = JSON.parse(request.responseText);
            var temp = [];
            $.each(response.results, function(key, value) {
                //blacklist.addToBlacklist(value.name);
                temp.push(value.name);
            });
            blacklist.addToBlacklist(temp);
            if (response.next != null) {
                fetchRequest(response.next);
            } else {
                fetching = false;
                chrome.browserAction.setIcon({ path: '/images/cymon-icon-19.png' });
            }
        }
    };
    request.send();
}

function fetchBlacklist() {
    blacklist.setBlacklist([]);
    fetching = true;
    chrome.browserAction.setIcon({ path: '/images/cymon-icon-loading-19.png' })
    $.each(options.getTags(), function (tag, enabled){
        if (enabled) {
            fetchRequest(encodeURI('http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/' + tag + '/?days=' + options.getFetchLookback() + '&limit=1000'));
        }
    });
    blacklist.setLastFetch(new Date().getTime());
}

function setFetchTime() {
    //Set time to fetch based on scheduled fetch time (last fetch time + fetch interval) and current time
    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(
        function() { chrome.runtime.sendMessage({ action: "timerTrigger" }); },
        blacklist.getLastFetch() > 0 ? (blacklist.getLastFetch() + options.getFetchInterval() * 3600000) - new Date().getTime() : 0
    );
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
        case "whitelistUpdated":
        case "blacklistUpdated":
            updateListener();
            break;
        case "blacklistOptionsUpdated":
        case "timerTrigger":
            fetchBlacklist();
            break;
        case "lastFetchUpdated":
        case "fetchIntervalUpdated":
            setFetchTime();
            break;
        default:
            sendResponse({ success: false });
            break;
    }
});


/******************************************************************************
**************************************Main*************************************
******************************************************************************/

var fetching = false;
var whitelist;
var blacklist;
var options;
var timeout;

chrome.storage.sync.get(function (storage) {
    options = new Options(storage.tags, storage.fetchLookback, storage.fetchInterval);
    whitelist = new Whitelist(storage.whitelist);
    chrome.runtime.sendMessage({ action: "whitelistUpdated" });
});

chrome.storage.local.get(function (storage) {
    blacklist = new Blacklist(storage.blacklist, storage.lastFetch);
    chrome.runtime.sendMessage({ action: "fetchIntervalUpdated" });
});