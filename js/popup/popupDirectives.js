(function() {
    var app = angular.module("popupDirectives", ["services"]);

    app.directive("blocklist", function(){
        return {
            restrict: "E",
            templateUrl: "/html/templates/blocklist.html",
            controller: ["$scope", "blocklistService", "whitelistService", function($scope, blocklistService, whitelistService){
                var list = this;
                list.domains = [];
                blocklistService.getBlocklist(function(response) {
                    if (response && response.success) {
                        list.domains = response.blocklist;
                        $scope.$apply();
                    }
                });

                this.addToWhitelist = function(domain) {
                    if (confirm("Are you sure you want to whitelist " + domain + "? This domain could be potentially harmful to your system.")) {
                        if (whitelistService.addToWhitelist(domain)) {
                            blocklistService.removeFromBlocklist(domain);
                            blocklistService.getBlocklist(function (response) {
                                if (response && response.success) {
                                    list.domains = response.blocklist;
                                    $scope.$apply();
                                }
                            });
                        } else {
                            alert("Error: " + domain + " is already in your whitelist");
                        }
                    }
                };

                this.viewDetails = function(domain) {
                    blocklistService.viewDetails(domain);
                };

            }],
            controllerAs: "blocklistCtrl"
        };
    });
})();