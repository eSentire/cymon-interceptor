(function() {
    var app = angular.module('cymonPopup', [/*Dependencies*/]);

    app.service('blocklistService', function() {
        this.getBlocklist = function (callback) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {action: "getBlocklist"},
                    function (response) {
                        if (response) {
                            callback(response.blocklist);
                        }
                    }
                );
            });
        }

        this.removeFromBlocklist = function (domain) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {action: "removeFromBlocklist", domain: domain}
                );
            });
        }
    });

    app.controller("ClearWhitelistButtonController", function($scope) {
        $scope.buttonText = "Clear Whitelist";
        $scope.active = chrome.extension.getBackgroundPage().whitelist.get().length > 0;

        $scope.setEnabled=function(enabled) {
            switch(enabled) {
                case true:
                    $scope.buttonText = "Clear Whitelist";
                    $scope.active = true;
                    break;
                case false:
                    $scope.buttonText = "Whitelist Empty";
                    $scope.active = false;
                    break
            }
        };

        $scope.clearWhitelist = function () {
            chrome.extension.getBackgroundPage().whitelist.clear();
            chrome.extension.getBackgroundPage().initListener();

            $scope.setEnabled(false);
        }
    });

    app.controller('WhitelistButtonController', function($scope, blocklistService) {

        $scope.buttonText = "Whitelist";
        $scope.active = true;

        $scope.setEnabled=function(enabled) {
            switch(enabled) {
                case true:
                    $scope.buttonText = "Whitelist";
                    $scope.active = true;
                    break;
                case false:
                    $scope.buttonText = "Whitelisted";
                    $scope.active = false;
                    break
            }
        }

        $scope.whitelistDomain = function (domain) {
            chrome.extension.getBackgroundPage().whitelist.add(domain.name);
            chrome.extension.getBackgroundPage().initListener();
            blocklistService.removeFromBlocklist(domain);

            $scope.setEnabled(false);
        };
    });

    app.controller('BlocklistController', function($scope, blocklistService) {
        $scope.domains = [];

        blocklistService.getBlocklist(function (blocklist) {
            jQuery.each(blocklist, function(index, value) {
                $scope.domains.push({
                    name: value
                });
            });
            $scope.$apply();
        });
    });
})();