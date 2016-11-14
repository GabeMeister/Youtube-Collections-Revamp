$(document).ready(function () {
    var _video = null;

    initialize();

    chrome.runtime.onMessage.addListener(function (request, sender, response) {

        switch (request.message) {

            case GET_CHANNEL_ID_MSG:
                getChannelId();
                break;

            case REMOVE_VIDEO:
                removeVideo(request.videoId);
                break;

            case UPDATE_RELATED_VIDEOS_WITH_COLLECTION_VIDEOS:
                updateRelatedVideosWithCollectionVideos(request.videoData);
                break;

            case FOUND_CURRENT_YOUTUBE_URL:
                setVideoEventsIfOnVideo(request.url);
                break;

            case TOGGLE_PLAY:
                togglePlay();
                break;

        }

    });

    function getChannelId() {
        var foundId = false;
        $('.guide-item.yt-uix-sessionlink.yt-valign.spf-link').each(function (index) {
            if ($(this).text().indexOf('My Channel') > -1) {
                var channelIdStr = $(this).attr('href').replace('/channel/', '');
                chrome.runtime.sendMessage({ message: VERIFY_CHANNEL_ID, channelId: channelIdStr });
                foundId = true;
                return false;

                // FOR TEST PURPOSES: dummy account
                //chrome.runtime.sendMessage({ message: 'channelIdFound', channelId: 'UCbWFwb-TieRunM1l3-v5GuA' });
                //return false;

            }
        });

        if (!foundId) {
            // Handle channelIdNotFound case
            chrome.runtime.sendMessage({ message: NOTIFY_CHANNEL_ID_NOT_FOUND_MSG });
        }
    }

    function removeVideo(videoId) {

        var relatedVidToRemove = null;
        var relatedVideos = $(".related-list-item");

        for (var i = 0; i < relatedVideos.length; i++) {
            var linkUrl = relatedVideos.eq(i).find('a').eq(0).attr('href');
            if (linkUrl.indexOf(videoId) > -1) {
                relatedVidToRemove = relatedVideos.eq(i);
                break;
            }
        }

        relatedVidToRemove.remove();


        ensureAutoplayVideoIsPresent();

    }

    function initialize() {
        waitUntilUserBrowsesToVideo();
    }


    /************************* DOM Interactions *************************/
    function removeRelatedVideos() {
        var relatedVidsList = getAllRelatedVideos();
        for (var i = 0; i < relatedVidsList.length; i++) {
            relatedVidsList.eq(i).remove();
        }
    }

    function waitUntilUserBrowsesToVideo() {
        // This is called regardless if the user directly pasted in a youtube video
        // or browsed to youtube and selected a video. Due to weird timings of onLoad events
        // the script must wait for a couple of seconds before it sets the video event handlers
        setTimeout(function () {
            chrome.runtime.sendMessage({ message: GET_CURRENT_YOUTUBE_URL });
        }, 1000);
    }

    function getCurrentVideoChannelId() {
        // We get the specific link of the channel the current video is on
        var channelId = $("div.yt-user-info a.yt-uix-sessionlink.spf-link.g-hovercard").attr("href").replace("/channel/", "");
        return channelId;
    }

    /************************* Formatting Functions *************************/
    function formatVideoViews(views) {
        return views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function getRelatedVidHTML(videoInfo) {
        var videoHTML = RELATED_VIDEO_HTML_TEMPLATE;

        var videoIdRegex = /{{VideoID}}/g;
        var videoTitleRegex = /{{VideoTitle}}/g;
        var videoTimeRegex = /{{VideoTime}}/g;
        var videoThumbnailRegex = /{{VideoThumbnail}}/g;
        var videoChannelRegex = /{{VideoChannel}}/g;
        var videoChannelIdRegex = /{{VideoChannelId}}/g;
        var videoViewsRegex = /{{VideoViews}}/g;

        videoHTML = videoHTML.replace(videoIdRegex, videoInfo.YoutubeId);
        videoHTML = videoHTML.replace(videoTitleRegex, videoInfo.Title);
        videoHTML = videoHTML.replace(videoThumbnailRegex, videoInfo.Thumbnail);
        videoHTML = videoHTML.replace(videoChannelRegex, videoInfo.ChannelTitle);
        videoHTML = videoHTML.replace(videoChannelIdRegex, videoInfo.YoutubeChannelId);

        var formattedDuration = formatDuration(videoInfo.Duration);
        videoHTML = videoHTML.replace(videoTimeRegex, formattedDuration);

        var viewCountWithCommas = formatVideoViews(videoInfo.ViewCount);
        videoHTML = videoHTML.replace(videoViewsRegex, viewCountWithCommas);

        return videoHTML;
    }

    function formatDuration(duration) {
        var result = '';
        if (duration.startsWith('00:')) {
            result = duration.replace('00:', '');
        }

        return result;
    }

    /************************* Signalr Response Functions *************************/
    function updateRelatedVideosWithCollectionVideos(videoData) {

        // Handle filling in the auto-play video
        if (videoData.length > 0) {
            var autoplayList = getAutoplayVideoList();
            var autoPlayVideoHtml = getRelatedVidHTML(videoData[0]);
            autoplayList.append(autoPlayVideoHtml);
        }

        if (videoData.length > 1) {
            // Add remaining videos to the regular related videos list after the last video
            var lastElement = getLastItemRelatedVideosList();

            for (var i = 1; i < videoData.length; i++) {
                var collectionVideoHtml = getRelatedVidHTML(videoData[i]);
                lastElement.before(collectionVideoHtml);
            }
        }

    }

    function getAutoplayVideoList() {
        return $('.autoplay-bar').find('ul.video-list').first();
    }

    function getAutoplayVideo() {
        // Returns just the auto play video
        return getAutoplayVideoList().find('.video-list-item').first();
    }

    function getRegularRelatedVideosList() {
        return $('#watch-related');
    }

    function getFirstRegularRelatedVideo() {
        return getRegularRelatedVideosList().find('.video-list-item').first();
    }

    function getAllRelatedVideos() {
        return $('.related-list-item');
    }

    function getLastItemRelatedVideosList() {
        // We assume this function is called when there are no videos in the related videos list
        // Because of no videos in the list, we actually just grab the first child,
        // and start adding stuff before it to "add" videos
        return getRegularRelatedVideosList().children().first();
    }

    function setVideoEventsIfOnVideo(url) {

        if (url.indexOf('/watch?v=') > -1) {
            _video = $('video').get(0);

            _video.addEventListener('ended', videoEndedEventHandler);
            _video.addEventListener('progress', videoProgressEventHandler);
        }
        else {
            waitUntilUserBrowsesToVideo();
        }

    }

    function ensureAutoplayVideoIsPresent()
    {
        var autoPlayVideo = getAutoplayVideo();
        if (autoPlayVideo.length === 0) {
            // The up next video got removed, we have to move a video up
            var firstRelatedVideo = getFirstRegularRelatedVideo();
            var autoPlayBarVideoList = getAutoplayVideoList();
            autoPlayBarVideoList.append(firstRelatedVideo);
        }
    }

    /************************* Video Event Handlers *************************/
    function videoEndedEventHandler(e) {
        chrome.runtime.sendMessage({ message: 'ARE_COLLECTIONS_ON' }, function(response) {
            if (response.areCollectionsOn) {
                var autoplayLink = getAutoplayVideo().find('a').get(0);
                autoplayLink.click();
            }
        });
    }

    function videoProgressEventHandler(e) {
        // When a video starts we remove related videos that the user has already seen
        // We use the progress event because the start event doesn't always get fired
        var lastPlayedVideoUrl = localStorage.getItem(LAST_PLAYED_VIDEO);
        var currVideoUrl = $('.ytp-title-link.yt-uix-sessionlink').eq(0).attr('href');

        if (util.quotify(currVideoUrl) !== lastPlayedVideoUrl) {
            // This is a new video the user has browsed to, we need to change the related videos
            // First record the current video url to local storage as "last played"
            localStorage.setItem(LAST_PLAYED_VIDEO, util.quotify(currVideoUrl));

            // Even though the video hasn't ended yet, we add it to the user's watched video list
            chrome.runtime.sendMessage({ message: RECORD_WATCHED_VIDEO, currentVideoId: currVideoUrl }, function (response) {
                if (response.success && response.shouldRemoveVideos === true) {
                    removeRelatedVideos();
                }
            });


        }
    }

    function togglePlay() {
        if (_video !== null && _video.paused) {
          _video.play();
        }
        else if (_video !== null && !_video.paused) {
          _video.pause();
        }
    }

});
