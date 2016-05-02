var queryInfo = {
	active: true
}
var ytCollectionsUrl = 'http://localhost:5507/';

var _hub = null;
var _hubConnection = null;

initialize();
initializeHub();


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	switch (request.message) {

	    case FETCH_YOUTUBE_CHANNEL_ID_MSG:
	        fetchYoutubeId();
	        break;

	    case NOTIFY_CHANNEL_ID_FOUND_MSG:
	        localStorage.setItem(USER_YOUTUBE_ID, util.quotify(request.channelId));
	        localStorage.setItem(EXTENSION_STATE, util.quotify(CHANNEL_ID_FOUND));
	        break;

	    case NOTIFY_CHANNEL_ID_NOT_FOUND_MSG:
            localStorage.setItem(EXTENSION_STATE, util.quotify(CHANNEL_ID_NOT_FOUND))
	        break;

	    case RECORD_WATCHED_VIDEO:
	        // We immediately set the currently being watched video id so we can 
	        // send a message to the correct tab later
	        localStorage.setItem(CURRENT_VIDEO_BEING_WATCHED, util.quotify(request.currentVideoId));
	        recordWatchedVideo(request.currentVideoId, sendResponse);
	        break;

	    case CHANGE_RELATED_VIDEOS:
	        changeRelatedVideos(request.videoIds);
	        break;

	    case GET_CURRENT_YOUTUBE_URL:
	        getYoutubeTabUrl(sender.tab.id);
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

chrome.runtime.onInstalled.addListener(function () {
    var context = "link";
    var title = "Mark video as watched";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "youtubeCollectionsRevampContextMenu"
    });
});

chrome.contextMenus.onClicked.addListener(markVideoAsWatched);

function recordWatchedVideo(currentVideoUrl, responseFunc) {
    var connected = localStorage.getItem(CONNECTED_WITH_SERVER) === "true";

    if (connected) {
        var urlQueryString = currentVideoUrl.replace('https://www.youtube.com/watch?', '');
        var params = $.getQueryParameters(urlQueryString);
        var videoId = params["v"];

        var userYoutubeId = util.unquotify(localStorage.getItem(USER_YOUTUBE_ID));
        var dateViewed = formatDateTime(new Date());

        var msToWait = 0;
        if (_hub === null) {
            initializeHub();
            msToWait = 1000;
        }

        setTimeout(function () {
            _hub.invoke('InsertWatchedVideo', videoId, userYoutubeId, dateViewed);
        }, msToWait);
    }

    responseFunc({ success: connected });
    
}

function markVideoAsWatched(info, tab) {
    var url = info.linkUrl;
    
    if (isYoutubeLink(url)) {
        if (_hub === null) {
            initializeHub();
        }
        
        // Get just the video id
        // Example url: https://www.youtube.com/watch?v=L0bF7Kj5rxI
        // We want L0bF7Kj5rxI
        var videoId = url.replace(/https:\/\/www.youtube.com\/watch\?v=/g, '');
        var userYoutubeId = util.unquotify(localStorage.getItem('USER_YOUTUBE_ID'));
        var dateViewed = formatDateTime(new Date());
        
		setTimeout(function() {
		    _hub.invoke('MarkVideoAsWatched', videoId, userYoutubeId, dateViewed);
		}, 1000);


        // Remove video in view
        // Because the user right clicked in the active window to mark the video
        // as watched, we can rely on the fact that the window is active and the 
        // url has youtube in it
		chrome.tabs.query({ active: true, url: 'https://www.youtube.com/*' }, function (tabs) {
		    
		    chrome.tabs.sendMessage(tabs[0].id, { 'message': REMOVE_VIDEO, 'videoId': videoId });
		    
		});
        
    }

}

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

function isYoutubeLink(url) {
    return url.indexOf("https://www.youtube.com/watch?v=") > -1;
}

function initialize() {
    
}

function initializeHub() {

    _hubConnection = $.hubConnection(HUB_SERVER_URL);
    _hubConnection.logging = true;
    _hub = _hubConnection.createHubProxy('YoutubeCollectionsServer');
    _hub.on('onRelatedVideosChange', onRelatedVideosChange);
    _hub.on('onWatchedVideoInserted', onWatchedVideoInserted);

    _hubConnection.start()
    .done(function () {
        localStorage.setItem(CONNECTED_WITH_SERVER, 'true');
    })
    .fail(function () {
        localStorage.setItem(CONNECTED_WITH_SERVER, 'false');
    });

}

function formatDateTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    var strTime = hours + ':' + minutes + ':' + seconds;

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    var strDate = year + '-' + month + '-' + day;

    // We want YYYY-MM-DD hh:mm:ss format
    return strDate + ' ' + strTime;
}

function changeRelatedVideos(relatedVideoIds) {
    var userYoutubeId = util.unquotify(localStorage.getItem(USER_YOUTUBE_ID));
    var areCollectionsOn = util.unquotify(localStorage.getItem(ARE_COLLECTIONS_ON)) === 'true';
    
    if (areCollectionsOn) {
        var selectedCollection = JSON.parse(localStorage.getItem(SELECTED_COLLECTION));
        _hub.invoke('GetVideosForCollection', userYoutubeId, selectedCollection.title);
    }
    else {
        _hub.invoke('GetUnwatchedVideos', userYoutubeId, relatedVideoIds);
    }
    
}


/************************* Signalr Response Functions *************************/
function onRelatedVideosChange(msgObj) {
    var areCollectionsOn = util.unquotify(localStorage.getItem(ARE_COLLECTIONS_ON)) === 'true';

    if (areCollectionsOn) {
        // We change the related videos to the collection videos
        var collectionVideos = msgObj.CollectionVideos;
        var currentVideoUrl = util.unquotify(localStorage.getItem(CURRENT_VIDEO_BEING_WATCHED));
        chrome.tabs.query({ url: currentVideoUrl }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { message: UPDATE_RELATED_VIDEOS_WITH_COLLECTION_VIDEOS, videoData: collectionVideos});
        });
    }
    else {
        // This is just filtering out related videos that the user has already seen
        var unseenVideos = msgObj.UnwatchedYoutubeVideoIds;
        var currentVideoUrl = util.unquotify(localStorage.getItem(CURRENT_VIDEO_BEING_WATCHED));
        chrome.tabs.query({ url: currentVideoUrl }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { message: UPDATE_RELATED_VIDEOS, unseenVideoIds: unseenVideos });
        });
    }

    

}

function getYoutubeTabUrl(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        chrome.tabs.sendMessage(tab.id, { message: FOUND_CURRENT_YOUTUBE_URL, url: tab.url });
    })
}

function onWatchedVideoInserted(msgObj) {
    var currentVideoUrl = util.unquotify(localStorage.getItem(CURRENT_VIDEO_BEING_WATCHED));
    chrome.tabs.query({ url: currentVideoUrl }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: BEGIN_REMOVING_RELATED_VIDEOS });
    });
}


