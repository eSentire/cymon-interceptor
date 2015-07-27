/******************************************************************************
***********************************Functions***********************************
******************************************************************************/
function blockingCallback(details) {
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
        lastRedirect = new URL(details.url).hostname;
        return { redirectUrl: chrome.extension.getURL("/html/redirectPage.html") };
    } else {
        return { cancel: true };
    }
}

function getUrlPatterns() {
    var shortlist = $(['en.wikipedia.org']).not(whitelist.get()).get();
    //var shortlist = $(blacklist.getBlacklist()).not(whitelist.get()).get(); //Gets the blacklist, minus the whitelist
    var urlPatterns = [];
    $.each(shortlist, function(index, domain){
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

function initListener() {
    var urls = getUrlPatterns();
    chrome.webRequest.onBeforeRequest.removeListener(blockingCallback); //Remove old listener

    if (urls.length) {
        chrome.webRequest.onBeforeRequest.addListener(
            blockingCallback,
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
                chrome.browserAction.setIcon({ path: '/images/cymon-icon-19.png' });
            }
        }
    };
    request.send();
    chrome.browserAction.setIcon({ path: '/images/cymon-icon-loading-19.png' })
}

function fetchBlacklist() {
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
    if (interval) {
        clearInterval(interval);
    }

    timeout = setTimeout(
        function() {
            var fetchIntervalMs = options.getFetchIntervalMs();

            chrome.runtime.sendMessage({ action: "fetchIntervalTrigger" });

            //Set to repeat fetch on interval; only relevant if the user leaves their browser on for a longer period of time than their fetch interval
            interval = setInterval(
                function() { chrome.runtime.sendMessage({ action: "fetchIntervalTrigger" }); },
                fetchIntervalMs
            );
        },
        blacklist.getLastFetch() > 0 ? (blacklist.getLastFetch() + options.getFetchIntervalMs()) - new Date().getTime() : 0
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
    switch(request.action) {
        case "whitelistUpdated":
        case "blacklistUpdated":
            initListener();
            break;
        case "blacklistOptionsUpdated":
        case "fetchIntervalTrigger":
            //fetchBlacklist();
            break;
        case "fetchIntervalUpdated":
            setFetchTime();
            break;
        default:
            sendResponse({ success: false });
            break;
    }
});


/******************************************************************************
***********************************Variables***********************************
******************************************************************************/

var lastRedirect = "";
var whitelist;
var options;
var blacklist;
var timeout, interval;

chrome.storage.sync.get(function (storage) {
    options = new Options(storage.tags, storage.fetchLookback, storage.fetchInterval);
    whitelist = new Whitelist(storage.whitelist);
    chrome.runtime.sendMessage({ action: "whitelistUpdated" });
});

chrome.storage.local.get(function (storage) {
    blacklist = new Blacklist(storage.blacklist, storage.lastFetch);
    chrome.runtime.sendMessage({ action: "fetchIntervalUpdated" });
});