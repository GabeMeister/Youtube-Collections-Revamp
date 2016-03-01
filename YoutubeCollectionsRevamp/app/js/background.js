var queryInfo = {
	active: true
}
var ytCollectionsUrl = 'http://localhost:5507/';


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	switch (request.message) {

	    case 'fetchYoutubeId':
	        fetchYoutubeId();
	        break;

	    case 'channelIdFound':
	        localStorage.setItem('YoutubeChannelId', request.channelId);
	        localStorage.setItem('ExtensionState', 'channelIdFound');
	        break;

	}
});

chrome.webNavigation.onCompleted.addListener(function (details) {
    if (details.url === 'https://www.youtube.com/' && localStorage.getItem('ExtensionState') === 'fetchingYoutubeChannelId') {

        chrome.tabs.query({ url: 'https://www.youtube.com/*', title: 'YouTube' }, function (tabs) {
            // The user could have had more than one YouTube tab open, so we send this message to all
            // of them and it'll get to the right one
            for (i = 0; i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id, { message: "getChannelId" });
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

function makeAjaxRequest() {
	$.ajax({
		url: ytCollectionsUrl + 'api/products/all',
		success: function(response) {
			chrome.runtime.sendMessage({message: 'receivedJSON', jsonResponse: response});
		},
		error: function(response) {
			chrome.runtime.sendMessage({message: 'receivedJSON', jsonResponse: response});
		}
	});
}

