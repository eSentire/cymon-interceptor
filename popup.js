$(window).ready(function(){
    chrome.tabs.query({currentWindow: true, active : true}, function(tabs) {
        chrome.extension.sendRequest({method: "retrieveBlockedURLs", tabId: tabs[0].id}, function (response) {
            for (url in response.data) {
                $("#blocklist").append("<li>" + response.data[url] + "</li>");
            }
        });
    });
});
