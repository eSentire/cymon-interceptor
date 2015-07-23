var Whitelist = (function() {
    var _whitelist = [];

    function whitelistObject() {}

    whitelistObject.prototype.init = function(storage) {
        if (storage && storage.whitelist) {
            _whitelist = storage.whitelist;
            chrome.runtime.sendMessage({ action: "whitelistUpdated" });
        }
    };

    whitelistObject.prototype.add = function(domain) {
        if (_whitelist.indexOf(domain) == -1) {
            _whitelist.push(domain);
            chrome.storage.sync.set({ whitelist: _whitelist });
            chrome.runtime.sendMessage({ action: "whitelistUpdated" });
            return true;
        } else {
            return false;
        }
    };

    whitelistObject.prototype.remove = function(domain) {
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

    whitelistObject.prototype.get = function(){
        return _whitelist;
    };

    whitelistObject.prototype.clear = function () {
        _whitelist = [];
        chrome.storage.sync.set({ whitelist: [] });
        chrome.runtime.sendMessage({ action: "whitelistUpdated" });
    };

    return whitelistObject;
})();