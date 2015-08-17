class Whitelist {
    constructor(whitelist = []) {
        this._whitelist = whitelist;
    }
    get() {
        return this._whitelist;
    }
    add(domain) {
        if (typeof domain == "string") {
            if (this._whitelist.indexOf(domain) == -1) {
                this._whitelist.push(domain);
                chrome.storage.sync.set({whitelist: this._whitelist});
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
    remove(domain) {
        if (typeof domain == "string") {
            var index = this._whitelist.indexOf(domain)
            if (index != -1) {
                this._whitelist.splice(index, 1);
                chrome.storage.sync.set({whitelist: this._whitelist});
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
    clear() {
        this._whitelist = [];
        chrome.storage.sync.set({ whitelist: [] });
        chrome.runtime.sendMessage({ action: "updateEvent" });
        return true;
    }
}
