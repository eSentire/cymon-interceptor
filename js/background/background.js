function getCymonInfo() {
    var blacklist_patterns = [];
    $.each(blacklist.get(), function(index, domain){
        blacklist_patterns.push("*://" + domain + "/*");
    });

    return $(blacklist_patterns).not(whitelist.get()).get();
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
        return { cancel: true };
    }
}

//Needs to be called on startup; also whenever the whitelist is updated
function initListener() {
    chrome.webRequest.onBeforeRequest.removeListener(listenerCallback); //Remove old listener
    chrome.webRequest.onBeforeRequest.addListener(
        listenerCallback,
        { urls: getCymonInfo() },
        ["blocking"]
    );
}

function retrieveBlacklist(blacklist, days, tags) {
    $.each(tags, function (tag, enabled){
        if (enabled) {
            blacklistRequest(blacklist, 'http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/' + encodeURIComponent(tag) + '/?days=' + encodeURIComponent(days) + '&limit=1000');
        }
    });
}

function blacklistRequest(blacklist, url) {
    var request = new XMLHttpRequest();

    request.open("GET", url, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            var response = JSON.parse(request.responseText);
            $.each(response.results, function(key, value) {
                blacklist.add(value.name);
            });
            if (response.next != null) {
                blacklistRequest(blacklist, response.next);
            }
        }
    };
    request.send();
}

var lastRedirect = "";
var whitelist = new Whitelist();
var options = new Options();
var blacklist = new Blacklist();
var lastRetrieval = 0;
var now;
var wait;

//Load data from account storage
chrome.storage.sync.get(function (storage) {
    options.init(storage);
    whitelist.init(storage);
});

chrome.storage.local.get(function (storage) {
    blacklist.init(storage);
    initListener();

    //lastRetrieval = storage.lastRetrieval;
    //if (lastRetrieval < new Date().getTime() - options.getRetrieveInterval()) {
    //    retrieveBlacklist(blacklist, options.getDays(), options.getTags());
    //} else {
    //    blacklist.init(storage);
    //    initListener();
    //}
});

//now = new Date();
//wait = new Date(now.getFullYear(), now.getMonth(), now.getDate(), options.getRetrieveTime(), 0, 0, 0) - now;
//if (wait < 0) {
//     wait += 86400000;
//}
//setTimeout(
//    function(){
//        retrieveBlacklist(blacklist, options.getDays(), options.getTags());
//        chrome.storage.local.set({lastRetrieval: new Date().getTime()})
//    },
//    wait
//);

