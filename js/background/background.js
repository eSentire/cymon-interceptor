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
    var shortlist = $(["en.wikipedia.org", "maps.google.com"]).not(whitelist.get()).get();
    //var shortlist = $(blacklist.getBlacklist()).not(whitelist.get()).get(); //Gets the blacklist, minus the whitelist
    var urlPatterns = [];
    $.each(shortlist, function(index, domain){
        urlPatterns.push("*://" + domain + "/*");
    });
    return urlPatterns;
}

function fetchRequest(blacklist, url) {
    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            var response = JSON.parse(request.responseText);
            $.each(response.results, function(key, value) {
                blacklist.addToBlacklist(value.name);
            });
            if (response.next != null) {
                fetchRequest(blacklist, response.next);
            }
        }
    };
    request.send();
}

function scheduleFetch() {

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
        case "whitelistUpdated":
        case "blacklistUpdated":
            var urls = getUrlPatterns();
            chrome.webRequest.onBeforeRequest.removeListener(blockingCallback); //Remove old listener

            if (urls.length) {
                chrome.webRequest.onBeforeRequest.addListener(
                    blockingCallback,
                    { urls: urls },
                    ["blocking"]
                );
            }
            sendResponse({ success: true });
            break;
        case "blacklistOptionsUpdated":
        case "fetchIntervalTrigger":
            $.each(options.getTags(), function (tag, enabled){
                if (enabled) {
                    fetchRequest(
                        blacklist,
                        encodeURI('http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/' + tag + '/?days=' + options.getFetchLookback() + '&limit=1000')
                    );
                }
            });
            blacklist.setLastFetch(new Date().getTime());
            break;
        case "fetchIntervalUpdated":
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
                        chrome.runtime.sendMessage({ action: "fetchIntervalTrigger" }),
                        fetchIntervalMs
                    );
                },
                blacklist.getLastFetch() > 0 ? (blacklist.getLastFetch() + options.getFetchIntervalMs()) - new Date().getTime() : 0
            );
        default:
            sendResponse({ success: false });
            break;
    }
});

var lastRedirect = "";
var whitelist = new Whitelist();
var options = new Options();
var blacklist = new Blacklist();
var timeout, interval;

chrome.storage.sync.get(function (storage) {
    options.init(storage);
    whitelist.init(storage);
});

chrome.storage.local.get(function (storage) {
    blacklist.init(storage);
    chrome.runtime.sendMessage({ action: "fetchIntervalUpdated" });
});