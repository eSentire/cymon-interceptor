(function() {
    var app = angular.module('popup', ['services']);

    app.controller('AddToWhitelistButtonController',['whitelistService', function (whitelistService) {
        this.setEnabled = function (enabled) {
            switch (enabled) {
                case true:
                    this.buttonText = "Whitelist";
                    this.active = true;
                    break;
                case false:
                    this.buttonText = "Whitelisted";
                    this.active = false;
                    break;
            }
        };

        this.setEnabled(true);

        this.click = function (domain) {
            if (confirm("Are you sure you want to whitelist " + domain + "? This domain could be potentially harmful to your system.")) {
                whitelistService.addToWhitelist(domain);
                this.setEnabled(false);
            }
        };
    }]);

    app.controller('BlocklistController', ['$scope', 'blocklistService', function ($scope, blocklistService) {
        var list = this;
        list.domains = [];

        blocklistService.getBlocklist(function (response) {
            if (response && response.success) {
                list.domains = response.blocklist;
                $scope.$apply();
            }
        });
    }]);
})();