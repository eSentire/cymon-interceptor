class Fetcher {
    constructor(tags, fetchLookback = 1, fetchInterval = 24, lastFetch = 0) {
        this._tags = tags || {
            "blacklist": false,
            "botnet": false,
            "dnsbl": true,
            "malicious activity": false,
            "malware": false,
            "phishing": false,
            "spam": false
        };
        this._fetchLookback = fetchLookback;
        this._fetchInterval = fetchInterval;
        this._lastFetch = lastFetch;

        this._timeout = 0;
    }

    fetchBlacklistForTag(tag) {
        var fetcher = this;
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open(
                "GET",
                `http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/${encodeURIComponent(tag)}/?days=${encodeURIComponent(fetcher.getFetchLookback())}&limit=25000`
            );

            request.onload = function () {
                if (request.status == 200) {
                    var domains = [];

                    $.each(JSON.parse(request.response).results, function(index, domain) {
                        domains.push(domain.name);
                    });
                    resolve(domains);
                } else {
                    reject(Error(request.statusText));
                }
            };

            request.onerror = function () {
                reject(Error("There was an error fetching domains from Cymon."));
            };

            request.send();
        });
    }

    fetchBlacklist(blacklist) {
        var tags = [];

        blacklist.set([]);
        $.each(this.getTags(), function(tag, enabled) {
            if (enabled) {
                tags.push(tag);
            }
        });

        if (tags.length) {
            fetcher = this;
            $.each(tags, function (index, tag) {
                fetcher.fetchBlacklistForTag(tag).then(function (response) {
                    blacklist.add(response);
                    chrome.runtime.sendMessage({ action: "updateEvent" });
                });
            });
            this.setLastFetch(new Date().getTime());
        }
    }

    updateFetchTimer() {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }

        this._timeout = setTimeout(
            function() {
                chrome.runtime.sendMessage({ action: "fetchEvent" });
            },
            this._lastFetch > 0 ? this._lastFetch + this._fetchInterval*3600000 - new Date().getTime() : 0
        );
    }

    setTags(tags) {
        if (tags && typeof tags === "object") {
            this._tags = tags;
            chrome.storage.sync.set({tags: this._tags});
            chrome.runtime.sendMessage({ action: "fetchEvent" });
            return true;
        } else {
            return false;
        }
    }

    setFetchLookback(fetchLookback) {
        if (fetchLookback && typeof fetchLookback === "number" && fetchLookback % 1 === 0 && fetchLookback > 0 && fetchLookback <= 3) {
            this._fetchLookback = fetchLookback;
            chrome.storage.sync.set({fetchLookback: this._fetchLookback});
            return true;
        } else {
            return false;
        }
    }

    setFetchInterval(fetchInterval) {
        if (fetchInterval && typeof fetchInterval === "number" && fetchInterval % 1 === 0 && fetchInterval > 0 && fetchInterval <= 24) {
            this._fetchInterval = fetchInterval;
            chrome.storage.sync.set({fetchInterval: this._fetchInterval});
            this.updateFetchTimer();
            return true;
        } else {
            return false;
        }
    }

    setLastFetch(time) {
        if (time && typeof time === "number" && time % 1 == 0) {
            this._lastFetch = time;
            chrome.storage.sync.set({ lastFetch: this._lastFetch });
            this.updateFetchTimer();
            return true;
        } else {
            //throw new Error("Invalid value for 'time'; expected an integer representing time since epoch in milliseconds.");
            return false;
        }
    }

    getTags() {
        return this._tags;
    }

    getFetchLookback() {
        return this._fetchLookback;
    }

    getFetchInterval() {
        return this._fetchInterval;
    }

    getLastFetch() {
        return this._lastFetch;
    }
}
