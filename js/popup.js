//Populates each list item
function loadBlockedDomains(tabId) {
    chrome.tabs.sendMessage(tabId, {action: "getBlocklist"}, function(response) {
        if (response.blocklist.length > 0) {
            $("#description").html("\
                <h2>The following resources on this page have been blocked:</h2>\
                <table id='blocklist'></table>\
            ");
            for (idomain in response.blocklist) {
                domain = response.blocklist[idomain];
                $("#blocklist").append("<tr id='blocked" + idomain + "'><td>" + domain + "</td><td><button id='whitelist" + idomain + "'>Whitelist</button></td></tr>");
                $("#whitelist" + idomain).click(function() {
                    var button = this;
                    if (confirm("Are you sure you want to whitelist " + domain + "? This will allow all web requests to this domain, which Cymon believes is malicious.")) {
                        chrome.extension.getBackgroundPage().whitelist.add(domain);
                        chrome.extension.getBackgroundPage().initListener();
                        chrome.tabs.sendMessage(tabId, {action: "removeFromBlocklist", domain:domain});
                        button.disabled = true;
                        button.innerHTML = "Whitelisted";
                    }
                });
            }
        }
    });
}

$(window).ready(function() {
    chrome.tabs.query({currentWindow: true, active : true}, function(tabs) {
        loadBlockedDomains(tabs[0].id);

        $("#clearWhitelist").click(function() {
            if (confirm("Are you sure you want to clear all domains in your whitelist? This action cannot be undone!")) {
                chrome.extension.getBackgroundPage().whitelist.clear();
                chrome.extension.getBackgroundPage().initListener();
                $("#clearWhitelist").attr("disabled", true);
                $("#clearWhitelist").text("Whitelist Cleared");
            }
        });
    });
});

//var app = angular.module('BrowserPopup', []);
//
//app.controller("Blocklist", function() {
//    this.blocklist = [];
//    this.tabId = 0;
//
//    chrome.tabs.query({currentWindow: true, active : true}, function(tabs) {
//        this.tabId = tabs[0].id;
//    });
//
//    this.blocklist = chrome.extension.getBackgroundPage().cymonTabs[this.tabId].getBlocklist();
//
//    this.whitelist = function(index) {
//        chrome.extension.getBackgroundPage().whitelist.add(blocklist[index]);
//    }
//
//    $("#clearWhitelist").click(function() {
//        if (confirm("Are you sure you want to clear all domains in your whitelist? This action cannot be undone!")) {
//            chrome.extension.getBackgroundPage().whitelist.clear();
//            chrome.extension.getBackgroundPage().initListener();
//            $("#clearWhitelist").attr("disabled", true);
//            $("#clearWhitelist").text("Whitelist Cleared");
//        }
//    });
//});