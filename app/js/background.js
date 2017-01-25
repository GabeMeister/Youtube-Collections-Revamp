// ************* Initialize *************
var queryInfo = {
	active: true
}

var _hub = null;
var _hubConnection = null;
var YOUTUBE_BROWSER_KEY = 'AIzaSyC9uXxwF4PxYilaOvPTDLdXAnToBwFvXcs';

initialize();
initializeHub();


// ************* Chrome API *************
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	switch (request.message) {

	    case VERIFY_CHANNEL_ID:
	        verifyChannelId(request);
	        break;

	    case RECORD_WATCHED_VIDEO:
	        // We immediately set the currently being watched video id so we can
	        // send a message to the correct tab later
	        localStorage.setItem(CURRENT_VIDEO_BEING_WATCHED, util.quotify(request.currentVideoId));
	        recordWatchedVideo(request.currentVideoId, sendResponse);
	        break;

	    case GET_CURRENT_YOUTUBE_URL:
	        getYoutubeTabUrl(sender.tab.id);
	        break;

	    case ARE_COLLECTIONS_ON:
	        var isOn = localStorage.getItem(ARE_COLLECTIONS_ON) === 'true';
	        sendResponse({ areCollectionsOn: isOn });
	        break;

	    case SHOW_CHANNEL_ID_HELP_IMAGE:
	        chrome.tabs.create({ url: 'https://i.imgur.com/B6ycaRQ.png' });
            break;

	}
});

chrome.runtime.onInstalled.addListener(function () {
    var context = "link";
    var title = "Mark video as watched.";
    var id = chrome.contextMenus.create({
        "title": title,
        "contexts": [context],
        "id": "youtubeCollectionsRevampContextMenu"
    });
});

chrome.contextMenus.onClicked.addListener(markVideoAsWatched);

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});

// ************* Background Script Functions *************
function recordWatchedVideo(currentVideoUrl, responseFunc) {
    var connected = localStorage.getItem(CONNECTED_WITH_SERVER) === 'true';
    var areRemovingVideos = false;

    if (connected) {
        var urlQueryString = currentVideoUrl.replace('https://www.youtube.com/watch?', '');
        var params = $.getQueryParameters(urlQueryString);
        var videoId = params["v"];

        var userYoutubeId = util.unquotify(localStorage.getItem(USER_YOUTUBE_ID));
        var dateViewed = formatDateTime(new Date());

        invokeRecordWatchedVideo(videoId, userYoutubeId, dateViewed);

        areRemovingVideos = localStorage.getItem(ARE_COLLECTIONS_ON) === 'true' && localStorage.getItem(SELECTED_COLLECTION) !== 'null';
    }

    responseFunc({ success: connected, shouldRemoveVideos: areRemovingVideos });

}

function invokeRecordWatchedVideo(videoId, userYoutubeId, dateViewed) {
    console.log('SignalR Call: InsertWatchedVideo. Parameters: (' + videoId + ', ' + userYoutubeId + ', ' + dateViewed + ')');
    _hub.invoke('InsertWatchedVideo', videoId, userYoutubeId, dateViewed)
    .done(function () {
            console.log(videoId + ' INSERTED');
        })
    .fail(function () {
        console.log(videoId + ' FAILED! Trying again...');
            invokeRecordWatchedVideo(videoId, userYoutubeId, dateViewed);
        });
}

function markVideoAsWatched(info, tab) {
    var url = info.linkUrl;

    if (isYoutubeLink(url)) {
        // Get just the video id
        // Example url: https://www.youtube.com/watch?v=L0bF7Kj5rxI
        // We want L0bF7Kj5rxI
        var videoId = url.replace(/https:\/\/www.youtube.com\/watch\?v=/g, '');
        var userYoutubeId = util.unquotify(localStorage.getItem('USER_YOUTUBE_ID'));
        var dateViewed = formatDateTime(new Date());

        console.log('SignalR Call: MarkVideoAsWatched. Parameters: (' + videoId + ', ' + userYoutubeId + ', ' + dateViewed + ')');
        _hub.invoke('MarkVideoAsWatched', videoId, userYoutubeId, dateViewed);


        // Remove video in view
        // Because the user right clicked in the active window to mark the video
        // as watched, we can rely on the fact that the window is active and the
        // url has youtube in it
		chrome.tabs.query({ active: true, url: 'https://www.youtube.com/*' }, function (tabs) {

		    chrome.tabs.sendMessage(tabs[0].id, { 'message': REMOVE_VIDEO, 'videoId': videoId });

		});

    }

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
    _hub.on('onYoutubeIdAlreadyExists', onYoutubeIdAlreadyExists);
    _hub.on('onNewYoutubeIdInserted', onNewYoutubeIdInserted);

    _hubConnection.start()
    .done(function () {
        console.log('Connected with SignalR!');
        localStorage.setItem(CONNECTED_WITH_SERVER, 'true');
    })
    .fail(function () {
        console.log('Failed to connect with SignalR');
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

function changeRelatedVideos() {
    var userYoutubeId = util.unquotify(localStorage.getItem(USER_YOUTUBE_ID));
    var areCollectionsOn = util.unquotify(localStorage.getItem(ARE_COLLECTIONS_ON)) === 'true';
    var doesCollectionExist = localStorage.getItem(SELECTED_COLLECTION) !== 'null';

    if (areCollectionsOn && doesCollectionExist) {
        var selectedCollection = JSON.parse(localStorage.getItem(SELECTED_COLLECTION));
        console.log('SignalR Call: GetVideosForCollection. Parameters: (' + userYoutubeId + ', ' + selectedCollection.title + ')');
        _hub.invoke('GetVideosForCollection', userYoutubeId, selectedCollection.title);
    }

}

function verifyChannelId(request) {
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/subscriptions',
        data: {
            part: "snippet",
            channelId: request.channelId,
            key: YOUTUBE_BROWSER_KEY
        },
        success: function (data) {
            if (localStorage.getItem(CONNECTED_WITH_SERVER) === 'true') {
                localStorage.setItem(USER_YOUTUBE_ID, util.quotify(request.channelId));
                console.log('SignalR Call: InsertNewYoutubeChannelId. Parameters: (' + request.channelId + ')');
                _hub.invoke('InsertNewYoutubeChannelId', request.channelId);
            }
        },
        error: function (data) {
            var jsonResponse = JSON.parse(data.responseText);
            var errorMessage = jsonResponse.error.errors[0].reason;

            if (errorMessage === 'subscriberNotFound') {
                localStorage.setItem(EXTENSION_STATE, CHANNEL_ID_DOES_NOT_EXIST);
                chrome.runtime.sendMessage({ message: NOTIFY_CHANNEL_ID_DOES_NOT_EXIST });
            }
            else if (errorMessage === 'subscriptionForbidden') {
                localStorage.setItem(EXTENSION_STATE, SUBSCRIPTIONS_NOT_PUBLIC);
                chrome.runtime.sendMessage({ message: NOTIFY_SUBSCRIPTIONS_NOT_PUBLIC });
            }

        }
    });

}

function getYoutubeTabUrl(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        chrome.tabs.sendMessage(tab.id, { message: FOUND_CURRENT_YOUTUBE_URL, url: tab.url });
    });
}


/************************* Signalr Response Functions *************************/
function onRelatedVideosChange(msgObj) {
    console.log('SignalR Received Message: onRelatedVideosChange');

    var areCollectionsOn = util.unquotify(localStorage.getItem(ARE_COLLECTIONS_ON)) === 'true';
    var currentVideoUrl = util.unquotify(localStorage.getItem(CURRENT_VIDEO_BEING_WATCHED));

    if (areCollectionsOn) {
        // We change the related videos to the collection videos
        var collectionVideos = msgObj.CollectionVideos;

        chrome.tabs.query({ url: currentVideoUrl }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { message: UPDATE_RELATED_VIDEOS_WITH_COLLECTION_VIDEOS, videoData: collectionVideos});
        });
    }

}

function onWatchedVideoInserted(msgObj) {
    console.log('SignalR Received Message: onWatchedVideoInserted');
    changeRelatedVideos();
}

function onNewYoutubeIdInserted() {
    console.log('SignalR Received Message: onNewYoutubeIdInserted');
    localStorage.setItem(EXTENSION_STATE, util.quotify(CHANNEL_ID_FOUND));

    var userYoutubeId = util.unquotify(localStorage.getItem(USER_YOUTUBE_ID));
    chrome.runtime.sendMessage({ message: NOTIFY_CHANNEL_ID_FOUND, channelId: userYoutubeId });
}

function onYoutubeIdAlreadyExists() {
    console.log('SignalR Received Message: onYoutubeIdAlreadyExists');
    localStorage.setItem(EXTENSION_STATE, util.quotify(EXISTING_CHANNEL_ID_FOUND));

    var userYoutubeId = util.unquotify(localStorage.getItem(USER_YOUTUBE_ID));
    chrome.runtime.sendMessage({ message: NOTIFY_EXISTING_CHANNEL_ID_FOUND, channelId: userYoutubeId });
}
