function Fetcher(lastFetch) {
    var _timeout = 0;
    var _lastFetch = lastFetch || 0;

    this.setLastFetch = function(time) {
        if (typeof time === 'number') {
            _lastFetch = time;
            chrome.storage.local.set({ lastFetch: _lastFetch });
            chrome.runtime.sendMessage({ action: "lastFetchUpdated" });
            return true;
        } else {
            return false;
        }
    };

    this.getLastFetch = function() {
        return _lastFetch;
    };

    this.setFetchTimer = function(fetchInterval){
        //Set time to fetch based on scheduled fetch time (last fetch time + fetch interval) and current time
        if (_timeout) {
            clearTimeout(_timeout);
        }

        _timeout = setTimeout(
            function() { chrome.runtime.sendMessage({ action: "timerTrigger" }); },
            _lastFetch > 0 ? _lastFetch + fetchInterval - new Date().getTime() : 0
        );
    };

    this.fetchBlacklistForTag = function(tag, lookback) {

        return new Promise(function (resolve, reject) {

            if (typeof tag != 'string' || ['blacklist', 'botnet', 'dnsbl', 'malicious activity', 'malware', 'phishing', 'spam'].indexOf(tag) < 0) {
                reject(Error("Invalid value for 'tag'; expected one of the following strings: 'blacklist', 'botnet', 'dnsbl', 'malicious activity', 'malware', 'phishing' or 'spam'."));
            } else if (lookback > 3 || lookback < 1) {
                reject(Error("Invalid value for 'lookback'; expected an integer from 1 to 3."));
            }

            var request = new XMLHttpRequest();
            request.open(
                'GET',
                encodeURI('http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/domain/' + tag + '/?days=' + lookback + '&limit=25000')
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
                reject(Error("Network Error"));
            };

            request.send();
        });
    }
}