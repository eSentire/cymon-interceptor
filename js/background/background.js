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
    var shortlist = $(blacklist.get()).not(whitelist.get()).get(); //Gets the blacklist, minus the whitelist
    var urlPatterns = [];
    $.each(shortlist, function(index, domain){
        urlPatterns.push("*://" + domain + "/*");
    });
    return urlPatterns;
}

//Needs to be called on startup; also whenever the whitelist or blacklist are updated
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

function fetchRequest(blacklist, url) {
    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            var response = JSON.parse(request.responseText);
            $.each(response.results, function(key, value) {
                blacklist.add(value.name);
            });
            if (response.next != null) {
                fetchRequest(blacklist, response.next);
            }
        }
    };
    request.send();
}

function fetchBlacklist(blacklist, lookback, tags) {
    $.each(tags, function (tag, enabled){
        if (enabled) {
            fetchRequest(
                blacklist,
                'http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/' +
                encodeURIComponent(tag) +
                '/?days=' + encodeURIComponent(lookback) +
                '&limit=1000'
            );
        }
    });
}

function setNextFetch(nextFetch, time) {
    nextFetch += time;
    chrome.storage.local.set({ nextFetch: nextFetch });
}

var lastRedirect = "";
var whitelist = new Whitelist();
var options = new Options();
var blacklist = new Blacklist();
var nextFetch = 0;

chrome.storage.sync.get(function (storage) {
    options.init(storage);
    whitelist.init(storage);
});

chrome.storage.local.get(function (storage) {
    if (storage && storage.nextFetch) {
        nextFetch = storage.nextFetch;
    }

    var now = new Date().getTime();
    if (now < nextFetch) {
        blacklist.init(storage);
        setTimeout(
            function() {
                fetchBlacklist(blacklist, options.getFetchLookback(), options.getTags());
                setNextFetch(nextFetch, new Date().getTime() + options.getFetchInterval()*3600000);
            },
            now - nextFetch
        );
    } else {
        fetchBlacklist(blacklist, options.getFetchLookback(), options.getTags());
        setNextFetch(nextFetch, new Date().getTime() + options.getFetchInterval()*3600000);
    }

    initListener();
});

