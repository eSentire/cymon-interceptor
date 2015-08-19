export var Blacklist = (function() {
    var _blacklist = [];

    chrome.storage.local.get(function (storage) {
        _blacklist = storage.blacklist || _blacklist;
    });

    function get() {
        return _blacklist;
    }

    function set(blacklist) {
        if (blacklist && blacklist.constructor === Array) {
            _blacklist = blacklist;
            chrome.storage.local.set({blacklist: _blacklist});
            chrome.runtime.sendMessage({action: "updateEvent"});
            return true;
        } else {
            //throw new Error("Invalid value for 'blacklist'; expected an array of strings representing the new blacklist.");
            return false;
        }
    }

    function add(domains) {
        if (domains && domains.constructor === Array) {
            var blacklistHash = {};
            $.each(_blacklist, function (index, domain) {
                blacklistHash[domain] = true;
            });
            $.each(domains, function (index, domain) {
                blacklistHash[domain] = true;
            });

            _blacklist = Object.keys(blacklistHash);
            chrome.storage.local.set({blacklist: _blacklist});
            chrome.runtime.sendMessage({action: "updateEvent"});
            return true;
        } else {
            //throw new Error("Invalid value for 'domains'; expected an array of strings representing domains to add to the blacklist.");
            return false;
        }
    }

    return {
        get: get,
        set: set,
        add: add
    };
})();