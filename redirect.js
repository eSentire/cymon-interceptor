var redirectPage = "redirectPage.html"

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var blocked = ["https://en.wikipedia.org/wiki/Main_Page"];
		for (var i=0; i < blocked.length; i++) {
			if (details.url.indexOf(blocked[i]) != -1) {
				return {redirectUrl: "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/" + redirectPage};
			}
		}
	},
	{urls: ["<all_urls>"]},
	["blocking"]

);
