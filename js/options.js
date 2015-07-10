(function () {
    var app = angular.module("cymonOptions", []);

    //Naming conventions like Java; make them as monstrously long as possible?
    app.controller("RemoveFromWhitelistButtonController", function($scope) {

        $scope.setEnabled=function(enabled) {
            switch(enabled) {
                case true:
                    $scope.buttonText = "Remove";
                    $scope.active = true;
                    break;
                case false:
                    $scope.buttonText = "Removed";
                    $scope.active = false;
                    break
            }
        };

        $scope.setEnabled(true);

        $scope.removeFromWhitelist = function (domain) {
            if (confirm("Are you sure you want to remove this domain from your whitelist?")) {
                chrome.extension.getBackgroundPage().whitelist.remove(domain);
                chrome.extension.getBackgroundPage().initListener();

                $scope.setEnabled(false);
            }
        }
    });

    app.controller("ClearWhitelistButtonController", function($scope) {
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

        $scope.setEnabled(chrome.extension.getBackgroundPage().whitelist.get().length > 0);

        $scope.clearWhitelist = function () {
            if (confirm("Are you sure you want to clear your whitelist? This action cannot be undone!")) {
                chrome.extension.getBackgroundPage().whitelist.clear();
                chrome.extension.getBackgroundPage().initListener();

                $scope.setEnabled(false);
            }
        }
    });

    app.controller("OptionsController", function($scope) {
        $scope.whitelist = chrome.extension.getBackgroundPage().whitelist.get();
    });
})();