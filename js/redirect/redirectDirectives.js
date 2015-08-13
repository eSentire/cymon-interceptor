(function() {
    var app = angular.module("redirectDirectives", ["services"]);

    app.directive("redirectDomain", function() {
        return {
            restrict: "E",
            templateUrl: "/html/templates/redirectDomain.html",
            controller: ["redirectService", "whitelistService", "blocklistService", function (redirectService, whitelistService, blocklistService) {
                this.domain = redirectService.getRedirectDestination();

                this.whitelistDomain = function() {
                    if (confirm("Are you sure you want to whitelist " + this.domain + "? This domain could be potentially harmful to your system.")) {
                        if (!whitelistService.addToWhitelist(this.domain)) {
                            alert("Error: " + this.domain + " is already in your whitelist.")
                        }
                        this.domain = "";
                    }
                };

                this.viewDetails = function() {
                    blocklistService.viewDetails(this.domain);
                };
            }],
            controllerAs: "redirectCtrl"
        }
    })
})();