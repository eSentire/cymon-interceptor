export default (function() {
    var _whitelist = [];

    chrome.storage.sync.get(function (storage) {
        _whitelist = storage.whitelist || _whitelist;
    });

    function get() {
        return _whitelist;
    }

    function add(domain) {
        if (typeof domain == "string") {
            if (_whitelist.indexOf(domain) == -1) {
                _whitelist.push(domain);
                chrome.storage.sync.set({whitelist: _whitelist});
                chrome.runtime.sendMessage({action: "updateEvent"});
                return true;
            } else {
                return false;
            }
        } else {
            //throw new Error("Invalid value for 'domain'; expected a string representing the domain to add to the whitelist.");
            return false;
        }
    }

    function remove(domain) {
        if (typeof domain == "string") {
            var index = _whitelist.indexOf(domain)
            if (index != -1) {
                _whitelist.splice(index, 1);
                chrome.storage.sync.set({whitelist: _whitelist});
                chrome.runtime.sendMessage({action: "updateEvent"});
                return true;
            } else {
                return false;
            }
        } else {
            //throw new Error("Invalid value for 'domain'; expected a string representing the domain to remove from the whitelist.");
            return false;
        }
    }

    function clear() {
        _whitelist = [];
        chrome.storage.sync.set({whitelist: []});
        chrome.runtime.sendMessage({action: "updateEvent"});
        return true;
    }

    return {
        get: get,
        add: add,
        remove: remove,
        clear: clear
    };
})();