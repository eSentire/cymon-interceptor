(function() {
    var app = angular.module("services", []);
    var backgroundApp = chrome.extension.getBackgroundPage().app;

    app.service("optionsService", function() {

        this.getTags = function() {
            return backgroundApp.fetcher.getTags();
        };

        this.setTags = function(tags) {
            return backgroundApp.fetcher.setTags(tags);
        };

        this.getFetchLookback = function() {
            return backgroundApp.fetcher.getFetchLookback();
        };

        this.setFetchLookback = function(days) {
            return backgroundApp.fetcher.setFetchLookback(days);
        };

        this.getFetchInterval = function() {
            return backgroundApp.fetcher.getFetchInterval();
        };

        this.setFetchInterval = function(hours) {
            return backgroundApp.fetcher.setFetchInterval(hours);
        };
    });

    app.service("whitelistService", ["$rootScope", function($rootScope) {
        this.addToWhitelist = function (domain) {
            return backgroundApp.whitelist.add(domain);
        };

        this.removeFromWhitelist = function (domain) {
            return backgroundApp.whitelist.remove(domain);
        };

        this.clearWhitelist = function () {
            backgroundApp.whitelist.clear();
            $rootScope.$broadcast("whitelistCleared");
        };

        this.getWhitelist = function () {
            return backgroundApp.whitelist.get();
        };
    }]);

    app.service("blacklistService", function() {
        this.getLastFetch = function() {
            return backgroundApp.fetcher.getLastFetch();
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