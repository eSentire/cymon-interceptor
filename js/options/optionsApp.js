(function () {
    var app = angular.module("options", ['services']);

    app.controller("WhitelistController", ['whitelistService', function(whitelistService) {
        this.domains = whitelistService.getWhitelist();
    }]);

    app.controller("RemoveFromWhitelistButtonController", ['whitelistService', function(whitelistService) {
        this.setEnabled=function(enabled) {
            switch(enabled) {
                case true:
                    this.buttonText = "Remove";
                    this.active = true;
                    break;
                case false:
                    this.buttonText = "Removed";
                    this.active = false;
                    break
            }
        };

        this.setEnabled(true);

        this.click = function (domain) {
            if (confirm("Are you sure you want to remove this domain from your whitelist?")) {
                whitelistService.removeFromWhitelist(domain);
                this.setEnabled(false);
            }
        }
    }]);

    app.controller("ClearWhitelistButtonController", ['whitelistService', function(whitelistService) {
        this.setEnabled=function(enabled) {
            switch(enabled) {
                case true:
                    this.buttonText = "Clear Whitelist";
                    this.active = true;
                    break;
                case false:
                    this.buttonText = "Whitelist Empty";
                    this.active = false;
                    break
            }
        };

        this.setEnabled(chrome.extension.getBackgroundPage().whitelist.get().length > 0);

        this.click = function () {
            if (confirm("Are you sure you want to clear your whitelist? This action cannot be undone!")) {
                whitelistService.clearWhitelist();

                this.setEnabled(false);
            }
        }
    }]);
})();