(function() {
    var app = angular.module("services", []);

    app.service("optionsService", function() {

        this.getTags = function() {
            return chrome.extension.getBackgroundPage().fetcher.getTags();
        };

        this.setTags = function(tags) {
            return chrome.extension.getBackgroundPage().fetcher.setTags(tags);
        };

        this.getFetchLookback = function() {
            return chrome.extension.getBackgroundPage().fetcher.getFetchLookback();
        };

        this.setFetchLookback = function(days) {
            return chrome.extension.getBackgroundPage().fetcher.setFetchLookback(days);
        };

        this.getFetchInterval = function() {
            return chrome.extension.getBackgroundPage().fetcher.getFetchInterval();
        };

        this.setFetchInterval = function(hours) {
            return chrome.extension.getBackgroundPage().fetcher.setFetchInterval(hours);
        };
    });

    app.service("whitelistService", ["$rootScope", function($rootScope) {
        this.addToWhitelist = function (domain) {
            return chrome.extension.getBackgroundPage().whitelist.add(domain);
        };

        this.removeFromWhitelist = function (domain) {
            return chrome.extension.getBackgroundPage().whitelist.remove(domain);
        };

        this.clearWhitelist = function () {
            chrome.extension.getBackgroundPage().whitelist.clear();
            $rootScope.$broadcast("whitelistCleared");
        };

        this.getWhitelist = function () {
            return chrome.extension.getBackgroundPage().whitelist.get();
        };
    }]);

    app.service("blacklistService", function() {
        this.getLastFetch = function() {
            return chrome.extension.getBackgroundPage().fetcher.getLastFetch();
        };
    });

    app.service("redirectService", function() {
        this.getRedirectDestination = function() {
            var redirectUrl = decodeURIComponent(new RegExp("\\?url=([^&?/:;]*)").exec(location.search)[1]);
            var redirectDomain = new URL(redirectUrl).hostname;

            return {
                url: redirectUrl,
                domain: redirectDomain
            }
        };
    });

    app.service("blocklistService", function() {
        this.getBlocklist = function (callback) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: "getBlocklist" },
                    callback
                );
            });
        };

        //Would like to remove this
        this.removeFromBlocklist = function (domain, callback) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {action: "removeFromBlocklist", domain: domain},
                    function (response) {
                        if (response && response.success) {
                            chrome.browserAction.setBadgeText({
                                text: response.blocklist.length ? response.blocklist.length.toString() : "",
                                tabId: tabs[0].id
                            });
                        }
                    }
                );
            });
        };

        this.viewDetails = function (domain) {
            chrome.tabs.create({ url: "http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/domain/" + encodeURIComponent(domain) })
        };
    });
})();