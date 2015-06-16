$(window).ready(function(){
    chrome.extension.sendRequest({method: "retrieveBlockedURLs"}, function (response) {
        for (url in response.data) {
            $("#blocklist").append("<li>" + response.data[url] + "</li>");
        }
    });
});
