$(document).ready(function () {
    var _video;


    initialize();

    chrome.runtime.onMessage.addListener(function (request, sender, response) {

        switch (request.message) {

            case GET_CHANNEL_ID_MSG:
                getChannelId();
                break;

            case REMOVE_VIDEO:
                removeVideo(request.videoId);
                break;

            case UPDATE_RELATED_VIDEOS:
                updateRelatedVideos(request.unseenVideoIds);
                break;

        }

    });

    function getChannelId() {
        $('.guide-item.yt-uix-sessionlink.yt-valign.spf-link').each(function (index) {
            if ($(this).text().indexOf('My Channel') > -1) {

                var channelIdStr = $(this).attr('href').replace('/channel/', '');

                chrome.runtime.sendMessage({ message: NOTIFY_CHANNEL_ID_FOUND_MSG, channelId: channelIdStr });
                return false;


                // FOR TEST PURPOSES: dummy account
                //chrome.runtime.sendMessage({ message: 'channelIdFound', channelId: 'UCbWFwb-TieRunM1l3-v5GuA' });
                //return false;

            }

            // TODO: handle channelIdNotFound case
        });


    }

    function fetchChannelId() {
        var channelIdStr = null;
        $('.guide-item.yt-uix-sessionlink.yt-valign.spf-link').each(function (index) {
            if ($(this).text().indexOf('My Channel') > -1) {
                channelIdStr = $(this).attr('href').replace('/channel/', '');
                return false;
            }

            // TODO: handle channelIdNotFound case
        });

        return channelIdStr;
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

    }

    
    _video.addEventListener('ended', function (e) {
        // When a video ends we add it to the user's watched video list
        chrome.runtime.sendMessage({ message: RECORD_WATCHED_VIDEO });
    });

    _video.addEventListener('progress', function (e) {
        // When a video starts we remove related videos that the user has already seen
        // We use the progress event because the start event doesn't always get fired
        var currVideoUrl = $('.ytp-title-link.yt-uix-sessionlink').eq(0).attr('href');
        var lastPlayedVideoUrl = localStorage.getItem(LAST_PLAYED_VIDEO_URL);

        if (lastPlayedVideoUrl !== undefined && util.quotify(currVideoUrl) !== lastPlayedVideoUrl)
        {
            // This is a new video, we need to change the related videos
            // First record video url to local storage
            localStorage.setItem(LAST_PLAYED_VIDEO_URL, util.quotify(currVideoUrl));

            // Now change related videos
            RemoveWatchedRelatedVideos();

        }
        

    });


    





    function initialize() {
        _video = $('video').get(0);
    }


    /************************* DOM Interactions *************************/
    function RemoveWatchedRelatedVideos() {
        var relatedVideoIds = GetRelatedVideoIds();
        var currentVideoIdBeingWatched = util.unquotify(localStorage.getItem(LAST_PLAYED_VIDEO_URL));

        chrome.runtime.sendMessage({ message: CHANGE_RELATED_VIDEOS, videoIds: relatedVideoIds, currentVideoId: currentVideoIdBeingWatched });

        var relatedVids = $('.related-list-item');
        for (var i = 0; i < relatedVids.length; i++) {
            relatedVids.eq(i).css('visibility', 'hidden');
        }
    }

    function GetRelatedVideoIds() {
        var relatedVideoIds = [];
        var relatedVids = $('.related-list-item');

        for (var i = 0; i < relatedVids.length; i++) {
            var relatedVideoItemUrl = relatedVids.eq(i).find('a').attr('href').replace('/watch?', '');
            var params = $.getQueryParameters(relatedVideoItemUrl);
            var videoId = params["v"];

            relatedVideoIds.push(videoId);
        }

        return relatedVideoIds;
    }

    function WaitUntilPageLoaded(sortType) {
        var found = false;
        while (!found) {
            var relatedVideos = $('.related-list-item');
            if (relatedVideos != null) {
                found = true;
            }
        }

        // We actually do the sorting here
        PerformSortAction(sortType);
    }

    function GetChannelId() {
        // We get the specific link of the channel the current video is on
        var channelId = $("div.yt-user-info a.yt-uix-sessionlink.spf-link.g-hovercard").attr("href").replace("/channel/", "");
        return channelId;
    }

    function RemoveRelatedVids() {
        $(".related-list-item").remove();
    }

    function RemoveUnneededPlaylists() {
        $('.related-list-item').has('.related-playlist').remove();
    }

    function RemoveUnneededRecommendedVids() {
        $('.related-list-item').has('span:contains("Recommended for you")').remove();
    }

    function RemoveShowMoreButton() {
        $("#watch-more-related").remove();
        $("#watch-more-related-button").remove();
    }




    /******************** Sort Actions *************************/
    function PerformSortAction(sortType) {
        if (sortType === "sortByViews") {
            SortByViews();
        }
        else if (sortType === "sortByDate") {
            SortByDate();
        }
        else if (sortType === "recentVids") {
            GetVidsForChannel();
        }
    }

    function SortByViews() {
        console.log("Sorting by views function!");

        RemoveUnneededPlaylists();
        RemoveUnneededRecommendedVids();
        RemoveShowMoreButton();

        var relatedVideos = $(".related-list-item").sort(function (a, b) {
            var num1String = $(a).find(".view-count").text();
            var num2String = $(b).find(".view-count").text();
            var num1 = parseInt(num1String.replace(" views", "").replace(/,/g, "").trim());
            var num2 = parseInt(num2String.replace(" views", "").replace(/,/g, "").trim());

            var result = num1 < num2;
            if (result === true) {
                result = 1;
            }
            else {
                result = -1;
            }
            return result;
        });

        RemoveRelatedVids();

        for (var i = 0; i < relatedVideos.length; i++) {
            var num = relatedVideos.eq(i).find(".view-count").text();
            console.log(num);
            $("#watch-related").append(relatedVideos.eq(i));
        }
    }

    function SortByDate() {
        console.log("Sorting by date function!");

        RemoveUnneededPlaylists();
        RemoveShowMoreButton();

        // Not paying attention to playlists
        // Get a list of video ids from related videos
        var relatedVidList = $('.related-list-item').find('.content-link.spf-link.yt-uix-sessionlink');
        var relatedVidUrlList = [];
        for (var i = 0; i < relatedVidList.length; i++) {
            relatedVidUrlList.push(relatedVidList.eq(i).attr('href').replace("/watch?v=", ""));
        }

        GetVideoDates(relatedVidUrlList);
    }




    /************************* YouTube API Functions *************************/
    function GetVidsForChannel() {
        RemoveUnneededPlaylists();
        RemoveUnneededRecommendedVids();
        RemoveShowMoreButton();
        RemoveRelatedVids();

        var channelId = GetChannelId();
        console.log("Channel id to fetch: " + channelId);

        $.get(
            "https://www.googleapis.com/youtube/v3/channels",
            {
                part: "contentDetails",
                id: channelId,
                key: apiKey
            },
            function (data) {
                $.each(data.items, function (i, item) {
                    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;
                    var channelId = item.id;
                    GetVidsFromChannelUploadPlaylist(channelId, uploadsPlaylistId);
                });
            }
        );
    }

    function GetVideoDates(vidInfoList) {
        // Form a string out of the array
        var vidIds = "";
        for (var i = 0; i < vidInfoList.length; i++) {
            vidIds += vidInfoList[i] + ",";
        }
        vidIds = vidIds.substring(0, vidIds.length - 1);


        $.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                part: "snippet",
                id: vidIds,
                key: apiKey
            },
            function (data) {
                var apiVidList = [];

                for (var i = 0; i < data.items.length; i++) {
                    var videoDateStr = data.items[i].snippet.publishedAt;
                    var videoDate = new Date(videoDateStr);
                    var videoId = data.items[i].id;

                    apiVidList.push({ "id": videoId, "date": videoDate });

                }

                var sortedVidInfoList = apiVidList.sort(function (a, b) {
                    var status = 0;
                    if (a.date < b.date) {
                        status = 1;
                    }
                    else {
                        status = -1;
                    }
                    return status;
                });

                // Current related videos
                var relatedVids = $('.related-list-item');

                // We store to this sorted array
                var sortedRelatedVids = [];

                // Iterate through the sorted info list determined from the api
                $.each(sortedVidInfoList, function (i, item) {
                    for (var i = 0; i < relatedVids.length; i++) {
                        var relatedVidId = relatedVids.eq(i).find('.content-link.spf-link.yt-uix-sessionlink')
                            .attr('href').replace("/watch?v=", "");
                        if (relatedVidId === item.id) {
                            console.log(item.date);
                            sortedRelatedVids.push(relatedVids.eq(i));
                        }
                    }
                });

                // Get rid of current related videos
                RemoveRelatedVids();

                // Add related video to page
                $.each(sortedRelatedVids, function (i, item) {
                    $("#watch-related").append(item);
                });


            }
        );
    }

    function GetVidsFromChannelUploadPlaylist(channelId, uploadsPlaylistId) {
        $.get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            {
                part: "snippet",
                playlistId: uploadsPlaylistId,
                maxResults: 50,
                key: apiKey
            },
            function (data) {
                var vidInfoList = [];

                for (var i = 0; i < data.items.length; i++) {
                    var _videoTitle = data.items[i].snippet.title;
                    var _videoId = data.items[i].snippet.resourceId.videoId;
                    var _videoChannel = data.items[i].snippet.channelTitle;
                    var _videoChannelId = channelId;
                    var _videoThumbnail = data.items[i].snippet.thumbnails.default.url;

                    var videoInfoItem = {
                        videoId: _videoId,
                        videoTitle: _videoTitle,
                        videoThumbnail: _videoThumbnail,
                        videoChannelId: _videoChannelId,
                        videoChannel: _videoChannel
                    };

                    console.log(videoInfoItem.videoTitle);
                    vidInfoList.push(videoInfoItem);
                }

                GetVideoInformation(vidInfoList);
            }
        );
    }

    function GetVideoInformation(vidInfoList) {
        var vidIds = "";
        for (var i = 0; i < vidInfoList.length; i++) {
            vidIds += vidInfoList[i].videoId + ",";
        }
        vidIds = vidIds.substring(0, vidIds.length - 1);


        $.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                part: "contentDetails,statistics",
                id: vidIds,
                key: apiKey
            },
            function (data) {
                for (var i = 0; i < data.items.length; i++) {
                    vidInfoList[i].videoDuration = FormatVideoDuration(data.items[i].contentDetails.duration);
                    vidInfoList[i].videoViews = FormatVideoViews(data.items[i].statistics.viewCount);

                    // Add the related video html to the page
                    $("#watch-related").append(GetRelatedVidHTML(vidInfoList[i]));
                }
            }
        );
    }




    /************************* Formatting Functions *************************/
    function FormatVideoDuration(durationStr) {
        var PTRegex = /PT/g;
        var SRegex = /S/g;

        // Duration comes in the format of PT{minutes}M{seconds}S
        // We drop the PT and S, and tokenize by M
        var formattedDuration = durationStr.replace(PTRegex, "").replace(SRegex, "");
        var times = formattedDuration.split("M");
        var finalDurationFormat = times[0] + ":" + times[1];
        return finalDurationFormat;
    }

    function FormatVideoViews(views) {
        return views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function GetRelatedVidHTML(videoInfo) {
        var videoHTML = RelatedVideoTemplate;

        var videoIdRegex = /{{VideoID}}/g;
        var videoTitleRegex = /{{VideoTitle}}/g;
        var videoTimeRegex = /{{VideoTime}}/g;
        var videoThumbnailRegex = /{{VideoThumbnail}}/g;
        var videoChannelRegex = /{{VideoChannel}}/g;
        var videoChannelIdRegex = /{{VideoChannelId}}/g;
        var videoViewsRegex = /{{VideoViews}}/g;

        videoHTML = videoHTML.replace(videoIdRegex, videoInfo.videoId);
        videoHTML = videoHTML.replace(videoTitleRegex, videoInfo.videoTitle);
        videoHTML = videoHTML.replace(videoThumbnailRegex, videoInfo.videoThumbnail);
        videoHTML = videoHTML.replace(videoChannelRegex, videoInfo.videoChannel);
        videoHTML = videoHTML.replace(videoChannelIdRegex, videoInfo.videoChannelId);
        videoHTML = videoHTML.replace(videoTimeRegex, videoInfo.videoDuration);
        videoHTML = videoHTML.replace(videoViewsRegex, videoInfo.videoViews);

        return videoHTML;
    }

    /************************* Signalr Response Functions *************************/
    function updateRelatedVideos(unseenVideos) {
        var relatedVideos = $(".related-list-item");

        for (var i = 0; i < relatedVideos.length; i++) {
            var relatedVideo = relatedVideos.eq(i);
            var relatedVideoItemUrl = relatedVideo.find('a').attr('href').replace('/watch?', '');
            var params = $.getQueryParameters(relatedVideoItemUrl);
            var videoId = params["v"];

            // If the video id isn't found in the unseen videos list, then
            // we should remove it because the user has seen it
            if (unseenVideos.indexOf(videoId) === -1) {
                relatedVideo.remove();
            }
            else {
                // We set the visibility property to hidden, we will restore that now
                relatedVideo.css('visibility', 'visible');
            }

        }

        // If the auto play video isn't present, then we have to add in a related video from
        // the other regular related videos
        var autoPlayBarVideoList = $('.autoplay-bar').first().find('.watch-sidebar-body').first().find('.video-list').first();
        var autoPlayVideo = autoPlayBarVideoList.find('a').first();
        
        if (autoPlayVideo.length === 0) {
            // The up next video got removed, we have to move a video up
            var watchRelated = $('#watch-related').first();
            var firstRelatedVideo = watchRelated.find('.related-list-item').first();

            autoPlayBarVideoList.append(firstRelatedVideo);

        }

    }
    
});

