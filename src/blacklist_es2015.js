class Blacklist {
    constructor(blacklist = []) {
        this._blacklist = blacklist;
    }
    get() {
        return this._blacklist;
    }
    set(blacklist) {
        if (blacklist && blacklist.constructor === Array) {
            this._blacklist = blacklist;
            chrome.storage.local.set({blacklist: this._blacklist});
            chrome.runtime.sendMessage({ action: "updateEvent" });
            return true;
        } else {
            //throw new Error("Invalid value for 'blacklist'; expected an array of strings representing the new blacklist.");
            return false;
        }
    }
    add(domains) {
        if (domains && domains.constructor === Array) {
            var blacklistHash = {};
            $.each(this._blacklist, function(index,domain) {
                blacklistHash[domain] = true;
            });
            $.each(domains, function(index,domain) {
                blacklistHash[domain] = true;
            });

            this._blacklist = Object.keys(blacklistHash);
            chrome.storage.local.set({blacklist: this._blacklist});
            chrome.runtime.sendMessage({ action: "updateEvent" });
            return true;
        } else {
            //throw new Error("Invalid value for 'domains'; expected an array of strings representing domains to add to the blacklist.");
            return false;
        }
    }
}
