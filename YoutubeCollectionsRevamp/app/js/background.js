var queryInfo = {
	active: true
}
var ytCollectionsUrl = 'http://localhost:5507/';


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	switch (request.message) {

	    case FETCH_YOUTUBE_CHANNEL_ID_MSG:
	        fetchYoutubeId();
	        break;

	    case NOTIFY_CHANNEL_ID_FOUND_MSG:
	        localStorage.setItem(USER_YOUTUBE_ID, util.quotify(request.channelId));
	        localStorage.setItem(EXTENSION_STATE, util.quotify(CHANNEL_ID_FOUND));
	        break;

	}
});

chrome.webNavigation.onCompleted.addListener(function (details) {
    if (details.url === 'https://www.youtube.com/' && util.IsSame(localStorage.getItem(EXTENSION_STATE), FETCHING_YOUTUBE_CHANNEL_ID)) {

        chrome.tabs.query({ url: 'https://www.youtube.com/*', title: 'YouTube' }, function (tabs) {
            // The user could have had more than one YouTube tab open, so we send this message to all
            // of them and it'll get to the right one
            for (i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { message: GET_CHANNEL_ID_MSG });
            }
            
        });

    }
});

function fetchYoutubeId()
{
    chrome.tabs.query(queryInfo, function (tabs) {
        var currTabIndex = tabs[0].id;

        setTimeout(function () {
            chrome.tabs.update(currTabIndex, { selected: true });
        }, 20);
    });

    chrome.tabs.create({ url: 'https://www.youtube.com/' });
}
