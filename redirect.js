var redirectPage = "redirectPage.html";

function getCymonResponse (url) {
	var blacklist = ["maps.google.com"];
	for (var i=0; i < blacklist.length; i++) {
		if (url.indexOf(blacklist[i]) != -1) {
            return true;
		}
	}
    return false;
}

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
        if (getCymonResponse(details.url)) {
            if (details.type == "main_frame") {
                return {redirectUrl: "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/" + redirectPage};
            } else {
                chrome.tabs.getSelected(null, function(tab) { //Detailed description: what was blocked, why
                    chrome.pageAction.show(tab.id);
                });
                chrome.notifications.create(NotificationOptions = { //Basic description: "this blocked some stuff"
                    type: "basic",
                    title: "Cymon Interceptor",
                    iconUrl: "icon.png",
                    message: "A web request on this page was deemed malicious by Cymon and has been cancelled."
                });
                return {cancel: true};
            }
        }
	},
	{urls: ["<all_urls>"]},
	["blocking"]

);
