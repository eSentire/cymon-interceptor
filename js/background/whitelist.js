function Whitelist(whitelist) {
    var _whitelist = whitelist || [];

    this.get = function(){
        return _whitelist;
    };

    this.add = function(domain) {
        if (_whitelist.indexOf(domain) == -1) {
            _whitelist.push(domain);
            chrome.storage.sync.set({ whitelist: _whitelist });
            chrome.runtime.sendMessage({ action: "whitelistUpdated" });
            return true;
        } else {
            return false;
        }
    };

    this.remove = function(domain) {
        var index = _whitelist.indexOf(domain)
        if (index != -1) {
            _whitelist.splice(index, 1);
            chrome.storage.sync.set({ whitelist: _whitelist });
            chrome.runtime.sendMessage({ action: "whitelistUpdated" });
            return true;
        } else {
            return false;
        }
    };

    this.clear = function () {
        _whitelist = [];
        chrome.storage.sync.set({ whitelist: [] });
        chrome.runtime.sendMessage({ action: "whitelistUpdated" });
    };

    chrome.runtime.sendMessage({ action: "whitelistInitialized" });
}