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
    }
}