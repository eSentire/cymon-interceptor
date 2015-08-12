(function() {
    var app = angular.module("optionsDirectives", ["services"]);

    app.directive("whitelist", function() {
        return {
            restrict: "E",
            templateUrl: "/html/templates/whitelist.html",
            controller: ["whitelistService", function(whitelistService) {
                this.domains = whitelistService.getWhitelist();

                this.removeFromWhitelist = function(domain) {
                    if (confirm("Are you sure you want to remove " + domain + " from your whitelist?")) {
                        if (whitelistService.removeFromWhitelist(domain)) {
                            this.setEnabled(false);
                        } else {
                            alert("Error: " + domain + " could not be found in the whitelist.");
                        }
                    }
                };

                this.clearWhitelist = function() {
                    if (confirm("Are you sure you want to clear your whitelist? This action cannot be undone!")) {
                        whitelistService.clearWhitelist();
                        this.domains = whitelistService.getWhitelist();
                    }
                }
            }],
            controllerAs: "whitelistCtrl"
        }
    });

    app.directive("settings", function() {
        return {
            restrict: "E",
            templateUrl: "/html/templates/settings.html",
            controller: ["optionsService", "blacklistService", function(optionsService, blacklistService) {
                this.tags = optionsService.getTags();
                this.fetchLookback = optionsService.getFetchLookback();
                this.fetchInterval = optionsService.getFetchInterval();
                this.lastFetch = blacklistService.getLastFetch();
                this.currentTime = new Date().getTime();

                this.save = function () {
                    optionsService.setTags(this.tags);
                    optionsService.setFetchLookback(this.fetchLookback);
                    optionsService.setFetchInterval(this.fetchInterval);
                }
            }],
            controllerAs: "settingsCtrl"
        }
    });

    app.filter("trim", function() {
        return function(value) {
            return (!value) ? "" : value.replace(/ /g, "");
        };
    });
})();