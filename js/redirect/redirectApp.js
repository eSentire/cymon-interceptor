(function () {
    var app = angular.module("domain" , ['services']);

    app.controller("DomainController", ['redirectService', function (redirectService) {
        this.domain = redirectService.getLastRedirect();
    }]);

    app.controller('AddToWhitelistButtonController',['whitelistService', 'blocklistService', function (whitelistService, blocklistService) {
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
                if (whitelistService.addToWhitelist(domain)) {
                    blocklistService.removeFromBlocklist(domain);
                    this.setEnabled(false);
                } else {
                    alert("Error: " + domain + " is already in your whitelist")
                }
            }
        };
    }]);
})();