// General Constants
var HUB_SERVER_URL = 'http://localhost:3851';


// Chrome Runtime Messages
var FETCH_YOUTUBE_CHANNEL_ID_MSG = 'FETCH_YOUTUBE_CHANNEL_ID';
var GET_CHANNEL_ID_MSG = 'GET_CHANNEL_ID';
var NOTIFY_CHANNEL_ID_FOUND_MSG = 'NOTIFY_CHANNEL_ID_FOUND';
var NOTIFY_CHANNEL_ID_NOT_FOUND_MSG = 'NOTIFY_CHANNEL_ID_NOT_FOUND_MSG';
var REMOVE_VIDEO = 'REMOVE_VIDEO';
var RECORD_WATCHED_VIDEO = 'RECORD_WATCHED_VIDEO';
var CHANGE_RELATED_VIDEOS = 'CHANGE_RELATED_VIDEOS';
var BEGIN_REMOVING_RELATED_VIDEOS = 'BEGIN_REMOVING_RELATED_VIDEOS';
var UPDATE_RELATED_VIDEOS = 'UPDATE_RELATED_VIDEOS';
var UPDATE_RELATED_VIDEOS_WITH_COLLECTION_VIDEOS = 'UPDATE_RELATED_VIDEOS_WITH_COLLECTION_VIDEOS';
var REFRESH_VIDEO_OBJ = 'REFRESH_VIDEO_OBJ';
var CURRENT_VIDEO_URL_FOUND = 'CURRENT_VIDEO_URL_FOUND';
var GET_CURRENT_YOUTUBE_URL = 'GET_CURRENT_YOUTUBE_URL ';
var FOUND_CURRENT_YOUTUBE_URL = 'FOUND_CURRENT_YOUTUBE_URL';




// Local Storage Constant names
var USER_YOUTUBE_ID = 'USER_YOUTUBE_ID';
var SUBSCRIPTIONS_LIST = 'SUBSCRIPTIONS_LIST';
var COLLECTIONS_LIST = 'COLLECTIONS_LIST';
var EXTENSION_STATE = 'EXTENSION_STATE';
var SELECTED_COLLECTION = 'SELECTED_COLLECTION';
var NEW_COLLECTION_TITLE = 'NEW_COLLECTION_TITLE';
var DISPLAY_MESSAGE = 'DISPLAY_MESSAGE';
var LAST_PLAYED_VIDEO_URL = 'LAST_PLAYED_VIDEO_URL';
var CURRENT_VIDEO_BEING_WATCHED = 'CURRENT_VIDEO_BEING_WATCHED';
var ARE_COLLECTIONS_ON = 'ARE_COLLECTIONS_ON';
var CONNECTED_WITH_SERVER = 'CONNECTED_WITH_SERVER';



// Extension States
var FETCHING_YOUTUBE_CHANNEL_ID = 'FETCHING_YOUTUBE_CHANNEL_ID';
var CHANNEL_ID_FOUND = 'CHANNEL_ID_FOUND';
var CHANNEL_ID_NOT_FOUND = 'CHANNEL_ID_NOT_FOUND';
var FETCHING_SUBSCRIPTIONS = 'FETCHING_SUBSCRIPTIONS';
var INITIALIZED = 'INITIALIZED';
var RENAMING_COLLECTION = 'RENAMING_COLLECTION';
var FAILED_CONNECTION = 'FAILED_CONNECTION';
var SUCCESSFUL_CONNECTION = 'SUCCESSFUL_CONNECTION';



var RELATED_VIDEO_HTML_TEMPLATE = "<li class=\"video-list-item related-list-item show-video-time\"> " +
"<div class=\"content-wrapper\"> <a href=\"/watch?v={{VideoID}}\" class=\" " +
"content-link spf-link yt-uix-sessionlink\" title=\"{{VideoTitle}}\" rel=\"spf-prefetch\" " +
"data-sessionlink=\"feature=related&amp;ei=15gdVe3RMs62-gOnqIHABA&amp;ved=CBcQzRooEg\">" +
" <span dir=\"ltr\" class=\"title\" aria-describedby=\"description-id-251503\">" +
" {{VideoTitle}} </span> <span class=\"accessible-description\" id=\"description-id-251503\">" +
" - Duration: {{VideoTime}}. </span> <span class=\"stat attribution\"> <span class=\"" +
"g-hovercard\" data-ytid=\"{{VideoChannelId}}\" data-name=\"related\"> by <span class=\"" +
" g-hovercard\" data-ytid=\"{{VideoChannelId}}\" data-name=\"\">{{VideoChannel}}</span> " +
"</span> </span> <span class=\"stat view-count\">{{VideoViews}} views</span></a> </div><div " +
"class=\"thumb-wrapper\"> <a href=\"/watch?v={{VideoID}}\" class=\" thumb-link spf-link" +
" yt-uix-sessionlink\" tabindex=\"-1\" rel=\"spf-prefetch\" data-sessionlink=\"" +
"feature=related&amp;ei=15gdVe3RMs62-gOnqIHABA&amp;ved=CBcQzRooEg\" aria-hidden=\"true\">" +
"<span class=\"yt-uix-simple-thumb-wrap yt-uix-simple-thumb-related\" tabindex=\"0\" " +
"data-vid=\"{{VideoID}}\"><img src=\"{{VideoThumbnail}}\" aria-hidden=\"true\" alt=\"\" " +
"width=\"120\" height=\"90\" class=\"gif-delayer gif-delayer-loaded\"></span></a> " +
"<span class=\"video-time\"> {{VideoTime}} </span> <span class=\"thumb-menu " +
"dark-overflow-action-menu video-actions\"> <button class=\"yt-uix-button-reverse flip " +
"addto-watch-queue-menu spf-nolink hide-until-delayloaded yt-uix-button yt-uix-button-dark-" +
"overflow-action-menu yt-uix-button-size-default yt-uix-button-has-icon no-icon-markup " +
"yt-uix-button-empty\" aria-expanded=\"false\" aria-haspopup=\"true\" type=\"button\" " +
"onclick=\";return false;\"><span class=\"yt-uix-button-arrow yt-sprite\"></span><ul " +
"class=\"watch-queue-thumb-menu yt-uix-button-menu yt-uix-button-menu-dark-overflow-action-menu " +
"hid\"><li role=\"menuitem\" class=\"overflow-menu-choice addto-watch-queue-menu-choice " +
"addto-watch-queue-play-next yt-uix-button-menu-item\" data-action=\"play-next\" onclick=\";" +
"return false;\" data-video-ids=\"{{VideoID}}\"><span class=\"addto-watch-queue-menu-text\">" +
"Play next</span></li><li role=\"menuitem\" class=\"overflow-menu-choice " +
"addto-watch-queue-menu-choice addto-watch-queue-play-now yt-uix-button-menu-item\" " +
"data-action=\"play-now\" onclick=\";return false;\" data-video-ids=\"{{VideoID}}\"><span " +
"class=\"addto-watch-queue-menu-text\">Play now</span></li></ul></button> </span> <button" +
" class=\"yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty " +
"yt-uix-button-has-icon no-icon-markup addto-button addto-queue-button video-actions " +
"spf-nolink hide-until-delayloaded addto-tv-queue-button yt-uix-tooltip\" type=\"button\" " +
"onclick=\";return false;\" title=\"TV Queue\" data-video-ids=\"{{VideoID}}\" " +
"data-style=\"tv-queue\"></button> </div></li>";

















