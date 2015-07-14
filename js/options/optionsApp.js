(function () {
    var app = angular.module("options", ['services']);

    app.controller("WhitelistController", function() {
        this.domains = chrome.extension.getBackgroundPage().whitelist.get();
        var ctx=this;
        $.each(ctx.domains, function(index, value){
           ctx.domains[index] = value.replace("*://", "").replace("/*", "");
        });
    });

    app.controller("RemoveFromWhitelistButtonController", function() {
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
                chrome.extension.getBackgroundPage().whitelist.remove(domain);
                chrome.extension.getBackgroundPage().initListener();

                this.setEnabled(false);
            }
        }
    });

    app.controller("ClearWhitelistButtonController", function() {
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
                chrome.extension.getBackgroundPage().whitelist.clear();
                chrome.extension.getBackgroundPage().initListener();

                this.setEnabled(false);
            }
        }
    });

})();