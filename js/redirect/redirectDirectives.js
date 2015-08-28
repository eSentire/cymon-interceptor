(function() {
    var app = angular.module("redirectDirectives", ["services"]);

    app.directive("redirectDomain", function() {
        return {
            restrict: "E",
            templateUrl: "/html/templates/redirectDomain.html",
            controller: ["redirectService", "whitelistService", "blocklistService", function (redirectService, whitelistService, blocklistService) {
                this.destination = redirectService.getRedirectDestination();
                this.url = this.destination.url;
                this.domain = this.destination.domain;

                this.whitelistDomain = function() {
                    if (confirm("Are you sure you want to whitelist " + this.domain + "? This domain could be potentially harmful to your system.")) {
                        if (whitelistService.addToWhitelist(this.domain)) {
                            location.replace(this.url);
                        } else {
                            alert("Error: " + this.domain + " is already in your whitelist.");
                        }
                    }
                };

                this.viewDetails = function() {
                    blocklistService.viewDetails(this.domain);
                };
            }],
            controllerAs: "redirectCtrl"
        };
    });
})();