(function() {
    var app = angular.module("services", []);

    app.service('optionsService', function() {

        this.getTags = function() {
            return chrome.extension.getBackgroundPage().options.getTags();
        };

        this.setTags = function(tags) {
            return chrome.extension.getBackgroundPage().options.setTags(tags);
        };

        this.getFetchLookback = function() {
            return chrome.extension.getBackgroundPage().options.getFetchLookback();
        };

        this.setFetchLookback = function(days) {
            return chrome.extension.getBackgroundPage().options.setFetchLookback(days);
        };

        this.getFetchInterval = function() {
            return chrome.extension.getBackgroundPage().options.getFetchInterval();
        };

        this.setFetchInterval = function(hours) {
            var response = chrome.extension.getBackgroundPage().options.setFetchInterval(hours)
            chrome.extension.getBackgroundPage().scheduleFetch();
            return response;
        };
    });

    app.service('blacklistService', function() {
        this.getLastFetch = function() {
            return chrome.extension.getBackgroundPage().blacklist.getLastFetch();
        }
    });

    app.service('redirectService', function() {
       this.getLastRedirect = function() {
           var domain = chrome.extension.getBackgroundPage().lastRedirect;
           chrome.extension.getBackgroundPage().lastRedirect = "";
           return domain;
       };
    });

    app.service('blocklistService', function() {
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
        }
    });

    app.service('whitelistService', ['$rootScope', function($rootScope) {
        this.addToWhitelist = function (domain) {
            if (chrome.extension.getBackgroundPage().whitelist.add(domain)) {
                return true;
            } else {
                return false;
            }
        };

        this.removeFromWhitelist = function (domain) {
            if (chrome.extension.getBackgroundPage().whitelist.remove(domain)) {
                return true;
            } else {
                return false;
            }
        };

        this.clearWhitelist = function () {
            chrome.extension.getBackgroundPage().whitelist.clear();
            $rootScope.$broadcast("whitelistCleared");
        };

        this.getWhitelist = function () {
            var whitelist = chrome.extension.getBackgroundPage().whitelist.get();
            for (var index in whitelist) {
                whitelist[index] = whitelist[index].replace("*://", "").replace("/*", "");
            }
            return whitelist;
        };
    }]);
})();