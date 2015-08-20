import Blacklist from "./blacklist_es2015";
import Fetcher from "./fetcher_es2015.js";
import Whitelist from "./whitelist_es2015.js";

var app = {
    blacklist: Blacklist,
    whitelist: Whitelist,
    fetcher: Fetcher
};

(function (blacklist, whitelist, fetcher) {
    /******************************************************************************
    ***********************************Functions***********************************
    ******************************************************************************/

    function interceptor(details) {
        var domain = new URL(details.url).hostname;

        if (details.tabId >= 0) {
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
                return {redirectUrl: chrome.extension.getURL("/html/redirectPage.html?url=" + encodeURIComponent(details.url))};
            } else {
                return {cancel: true};
            }
        }
    }

    function getUrlPatterns() {
        var urlPatterns = [];
        //Gets the blacklist, minus the whitelist, and appends "*://" and "" to create valid URL patterns for Chrome's webRequest API
        $.each($(blacklist.get()).not(whitelist.get()).get(), function (index, domain) {
            urlPatterns.push("*://" + domain + "/*");
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
                {urls: urls},
                ["blocking"]
            );
        }
    }

    /******************************************************************************
    ********************************Event Listeners********************************
    ******************************************************************************/

    chrome.runtime.onInstalled.addListener(function () {
        chrome.runtime.sendMessage({ action: "fetchEvent" });
    });

    chrome.runtime.onStartup.addListener(function() {
        chrome.runtime.sendMessage({action: "updateEvent"});
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.action) {
            //Refresh Listener
            case "updateEvent":
                updateListener();
                sendResponse({success: true});
                break;

            //Fetch List
            case "fetchEvent":
                fetcher.fetchBlacklist(blacklist);
                sendResponse({success: true});
                break;

            default:
                sendResponse({success: false});
                break;
        }
    });

})(app.blacklist, app.whitelist, app.fetcher);

window.app = app;