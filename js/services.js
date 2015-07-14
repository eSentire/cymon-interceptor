(function() {
    var app = angular.module("services", []);

    app.service('blocklistService', function() {
        this.getBlocklist = function (callback) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {action: "getBlocklist"},
                    function (response) {
                        if (response && response.success) {
                            callback(response.blocklist);
                        }
                    }
                );
            });
        };

        //Would like to remove this
        this.removeFromBlocklist = function (domain) {
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

    app.service('whitelistService', function() {
        this.addToWhitelist = function (domain) {
            if (chrome.extension.getBackgroundPage().whitelist.add(domain)) {
                chrome.extension.getBackgroundPage().initListener();
                return true;
            } else {
                return false;
            }
        };

        this.removeFromWhitelist = function (domain) {
            if (chrome.extension.getBackgroundPage().whitelist.remove(domain)) {
                chrome.extension.getBackgroundPage().initListener();
                return true;
            } else {
                return false;
            }
        };

        this.clearWhitelist = function () {
            if (chrome.extension.getBackgroundPage().whitelist.clear()) {
                chrome.extension.getBackgroundPage().initListener();
                return true;
            } else {
                return false;
            }
        };

        this.getWhitelist = function () {
            return chrome.extension.getBackgroundPage().whitelist.get();
        };
    });
})();