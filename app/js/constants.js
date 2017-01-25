// General Constants
var HUB_SERVER_URL = 'http://localhost:3851';
// var HUB_SERVER_URL = 'https://youtubecollectionsrevampserver.azurewebsites.net/signalr';


// Chrome Runtime Messages
var FETCH_YOUTUBE_CHANNEL_ID_MSG = 'FETCH_YOUTUBE_CHANNEL_ID';
var GET_CHANNEL_ID_MSG = 'GET_CHANNEL_ID';
var VERIFY_CHANNEL_ID = 'VERIFY_CHANNEL_ID';
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
var SHOW_CHANNEL_ID_HELP_IMAGE = 'SHOW_CHANNEL_ID_HELP_IMAGE';
var NOTIFY_CHANNEL_ID_FOUND = 'NOTIFY_CHANNEL_ID_FOUND';
var NOTIFY_CHANNEL_ID_DOES_NOT_EXIST = 'NOTIFY_CHANNEL_ID_DOES_NOT_EXIST';
var NOTIFY_SUBSCRIPTIONS_NOT_PUBLIC = 'NOTIFY_SUBSCRIPTIONS_NOT_PUBLIC';
var NOTIFY_EXISTING_CHANNEL_ID_FOUND = 'NOTIFY_EXISTING_CHANNEL_ID_FOUND';




// Local Storage Constant names
var USER_YOUTUBE_ID = 'USER_YOUTUBE_ID';
var SUBSCRIPTIONS_LIST = 'SUBSCRIPTIONS_LIST';
var COLLECTIONS_LIST = 'COLLECTIONS_LIST';
var EXTENSION_STATE = 'EXTENSION_STATE';
var SELECTED_COLLECTION = 'SELECTED_COLLECTION';
var NEW_COLLECTION_TITLE = 'NEW_COLLECTION_TITLE';
var DISPLAY_MESSAGE = 'DISPLAY_MESSAGE';
var LAST_PLAYED_VIDEO = 'LAST_PLAYED_VIDEO';
var CURRENT_VIDEO_BEING_WATCHED = 'CURRENT_VIDEO_BEING_WATCHED';
var ARE_COLLECTIONS_ON = 'ARE_COLLECTIONS_ON';
var CONNECTED_WITH_SERVER = 'CONNECTED_WITH_SERVER';



// Extension States
var CHANNEL_ID_FOUND = 'CHANNEL_ID_FOUND';
var EXISTING_CHANNEL_ID_FOUND = 'EXISTING_CHANNEL_ID_FOUND';
var CHANNEL_ID_NOT_FOUND = 'CHANNEL_ID_NOT_FOUND';
var FETCHING_SUBSCRIPTIONS = 'FETCHING_SUBSCRIPTIONS';
var INITIALIZED = 'INITIALIZED';
var RENAMING_COLLECTION = 'RENAMING_COLLECTION';
var DELETING_COLLECTION = 'DELETING_COLLECTION';
var FAILED_CONNECTION = 'FAILED_CONNECTION';
var SUCCESSFUL_CONNECTION = 'SUCCESSFUL_CONNECTION';
var CHANNEL_ID_DOES_NOT_EXIST = 'CHANNEL_ID_DOES_NOT_EXIST';
var SUBSCRIPTIONS_NOT_PUBLIC = 'SUBSCRIPTIONS_NOT_PUBLIC';
var SYNCING_WITH_DATABASE = 'SYNCING_WITH_DATABASE';

var RELATED_VIDEO_HTML_TEMPLATE = "<li class=\"video-list-item related-list-item related-list-item-compact-video\">" +
"	<div class=\"related-item-dismissable\">" +
"		<div class=\"content-wrapper\">" +
"			<a href=\"/watch?v={{VideoID}}\" class=\" content-link spf-link yt-uix-sessionlink spf-link \" data-sessionlink=\"itct=CCkQpDAYAiITCLrJo9Og3NECFSEHfwodehwCjij4HTIHcmVsYXRlZEiDgs6NveepiTs\" title=\"{{VideoTitle}}\" rel=\"spf-prefetch\" data-visibility-tracking=\"CCkQpDAYAiITCLrJo9Og3NECFSEHfwodehwCjij4HUDql5LV8ump4YcB\">" +
"				<span dir=\"ltr\" class=\"title\" aria-describedby=\"description-id-942739\">" +
" {{VideoTitle}}" +
"				</span>" +
"				<span class=\"accessible-description\" id=\"description-id-942739\">" +
" - Duration: {{VideoTime}}." +
"				</span>" +
"				<span class=\"stat attribution\">" +
"					<span class=\"g-hovercard\" data-ytid=\"{{VideoChannelId}}\" data-name=\"related\">{{VideoChannel}}</span>" +
"				</span>" +
"				<span class=\"stat view-count\">{{VideoViews}}</span>" +
"			</a>" +
"		</div>" +
"		<div class=\"thumb-wrapper\">" +
"			<a href=\"/watch?v={{VideoID}}\" class=\"thumb-link spf-link yt-uix-sessionlink spf-link\" data-sessionlink=\"itct=CCkQpDAYAiITCLrJo9Og3NECFSEHfwodehwCjij4HTIHcmVsYXRlZEiDgs6NveepiTs\" rel=\"spf-prefetch\" tabindex=\"-1\" data-visibility-tracking=\"CCkQpDAYAiITCLrJo9Og3NECFSEHfwodehwCjij4HUDql5LV8ump4YcB\" aria-hidden=\"true\">" +
"				<span class=\"yt-uix-simple-thumb-wrap yt-uix-simple-thumb-related\" tabindex=\"0\" data-vid=\"{{VideoID}}\">" +
"					<img alt=\"\" aria-hidden=\"true\" style=\"top: 0px\" height=\"94\" width=\"168\" src=\"{{VideoThumbnail}}\">" +
"				</span>" +
"			</a>" +
"			<span class=\"video-time\">" +
"{{VideoTime}}" +
"			</span>" +
"			<button class=\"yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup addto-button video-actions spf-nolink hide-until-delayloaded addto-watch-later-button yt-uix-tooltip\" type=\"button\" onclick=\";return false;\" title=\"Watch Later\" role=\"button\" data-video-ids=\"{{VideoID}}\"/>" +
"			<span class=\"thumb-menu dark-overflow-action-menu video-actions\">" +
"				<button aria-haspopup=\"true\" aria-expanded=\"false\" onclick=\";return false;\" class=\"yt-uix-button-reverse flip addto-watch-queue-menu spf-nolink hide-until-delayloaded yt-uix-button yt-uix-button-dark-overflow-action-menu yt-uix-button-size-default yt-uix-button-has-icon no-icon-markup yt-uix-button-empty\" type=\"button\">" +
"					<span class=\"yt-uix-button-arrow yt-sprite\"/>" +
"					<ul class=\"watch-queue-thumb-menu yt-uix-button-menu yt-uix-button-menu-dark-overflow-action-menu hid\">" +
"						<li role=\"menuitem\" class=\"overflow-menu-choice addto-watch-queue-menu-choice addto-watch-queue-play-next yt-uix-button-menu-item\" data-action=\"play-next\" onclick=\";return false;\" data-video-ids=\"{{VideoID}}\">" +
"							<span class=\"addto-watch-queue-menu-text\">Play next</span>" +
"						</li>" +
"						<li role=\"menuitem\" class=\"overflow-menu-choice addto-watch-queue-menu-choice addto-watch-queue-play-now yt-uix-button-menu-item\" data-action=\"play-now\" onclick=\";return false;\" data-video-ids=\"{{VideoID}}\">" +
"							<span class=\"addto-watch-queue-menu-text\">Play now</span>" +
"						</li>" +
"					</ul>" +
"				</button>" +
"			</span>" +
"			<button class=\"yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup addto-button addto-queue-button video-actions spf-nolink hide-until-delayloaded addto-tv-queue-button yt-uix-tooltip\" type=\"button\" onclick=\";return false;\" title=\"Queue\" data-style=\"tv-queue\" data-video-ids=\"{{VideoID}}\"/>" +
"		</div>" +
"		<div class=\"yt-uix-menu-container related-item-action-menu\">" +
"			<div class=\"yt-uix-menu yt-uix-menu-flipped hide-until-delayloaded\">" +
"				<button class=\"yt-uix-button yt-uix-button-size-default yt-uix-button-action-menu yt-uix-button-empty yt-uix-button-has-icon no-icon-markup yt-uix-menu-trigger\" type=\"button\" onclick=\";return false;\" aria-haspopup=\"true\" aria-label=\"Action menu.\" role=\"button\" aria-pressed=\"false\">" +
"					<span class=\"yt-uix-button-arrow yt-sprite\"/>" +
"				</button>" +
"				<div class=\"yt-uix-menu-content yt-ui-menu-content yt-uix-menu-content-hidden\" role=\"menu\">" +
"					<ul>" +
"						<li role=\"menuitem\">" +
"							<div class=\"service-endpoint-action-container hid\">" +
"								<div class=\"service-endpoint-replace-enclosing-action-notification hid\">" +
"									<div class=\"replace-enclosing-action-message\">" +
"										<span aria-label=\"Video removed: {{VideoTitle}}.\">Video removed.</span>" +
"									</div>" +
"									<div class=\"replace-enclosing-action-options\">" +
"										<button class=\"yt-uix-button yt-uix-button-size-default yt-uix-button-link undo-replace-action\" type=\"button\" onclick=\";return false;\" data-feedback-token=\"AB9zfpLHsICp9VDrLo1V5-FbZj3zBL6o0WpXNEvr_8OU_9fdd8JrgtfOWI28bv1VkzmuX3NkRj11YU--UNRFmY-iY_oQyc8iDBNemkK3VjpNuPNpf3dyJo5SX0jxWg26I68Awitu-eNl\">" +
"											<span class=\"yt-uix-button-content\">Undo</span>" +
"										</button>" +
"									</div>" +
"" +
"								</div>" +
"" +
"							</div>" +
"							<button type=\"button\" class=\"yt-ui-menu-item yt-uix-menu-close-on-select dismiss-menu-choice\" data-feedback-token=\"AB9zfpIHjfxUgi7yMRUa7HFQG4c9cSQYgJUwi8SBDZhWqSNBbSPRLQB3WF-V0WEMT6pYTQDo44vUqiQjXmzMdCh0r_Uf-VgRzuggWOGwiMEgTUxwAiuHApufGRUwWXwVSQFOoqZgER5E\" data-innertube-clicktracking=\"CCkQpDAYAiITCLrJo9Og3NECFSEHfwodehwCjij4HQ\" data-action=\"replace-enclosing-action\">" +
"								<span class=\"yt-ui-menu-item-label\">Not interested</span>" +
"							</button>" +
"						</li>" +
"					</ul>" +
"				</div>" +
"			</div>" +
"		</div>" +
"	</div>" +
"	<div class=\"related-item-dismissed-container hid\"/>" +
"</li>";


// var RELATED_VIDEO_HTML_TEMPLATE = "<li class=\"video-list-item related-list-item show-video-time\"> " +
// "<div class=\"content-wrapper\"> <a href=\"/watch?v={{VideoID}}\" class=\" " +
// "content-link spf-link yt-uix-sessionlink\" title=\"{{VideoTitle}}\" rel=\"spf-prefetch\" " +
// "data-sessionlink=\"feature=related&amp;ei=15gdVe3RMs62-gOnqIHABA&amp;ved=CBcQzRooEg\">" +
// " <span dir=\"ltr\" class=\"title\" aria-describedby=\"description-id-251503\">" +
// " {{VideoTitle}} </span> <span class=\"accessible-description\" id=\"description-id-251503\">" +
// " - Duration: {{VideoTime}}. </span> <span class=\"stat attribution\"> <span class=\"" +
// "g-hovercard\" data-ytid=\"{{VideoChannelId}}\" data-name=\"related\"> by <span class=\"" +
// " g-hovercard\" data-ytid=\"{{VideoChannelId}}\" data-name=\"\">{{VideoChannel}}</span> " +
// "</span> </span> <span class=\"stat view-count\">{{VideoViews}} views</span></a> </div><div " +
// "class=\"thumb-wrapper\"> <a href=\"/watch?v={{VideoID}}\" class=\" thumb-link spf-link" +
// " yt-uix-sessionlink\" tabindex=\"-1\" rel=\"spf-prefetch\" data-sessionlink=\"" +
// "feature=related&amp;ei=15gdVe3RMs62-gOnqIHABA&amp;ved=CBcQzRooEg\" aria-hidden=\"true\">" +
// "<span class=\"yt-uix-simple-thumb-wrap yt-uix-simple-thumb-related\" tabindex=\"0\" " +
// "data-vid=\"{{VideoID}}\"><img src=\"{{VideoThumbnail}}\" aria-hidden=\"true\" alt=\"\" " +
// "width=\"120\" height=\"90\" class=\"gif-delayer gif-delayer-loaded\"></span></a> " +
// "<span class=\"video-time\"> {{VideoTime}} </span> <span class=\"thumb-menu " +
// "dark-overflow-action-menu video-actions\"> <button class=\"yt-uix-button-reverse flip " +
// "addto-watch-queue-menu spf-nolink hide-until-delayloaded yt-uix-button yt-uix-button-dark-" +
// "overflow-action-menu yt-uix-button-size-default yt-uix-button-has-icon no-icon-markup " +
// "yt-uix-button-empty\" aria-expanded=\"false\" aria-haspopup=\"true\" type=\"button\" " +
// "onclick=\";return false;\"><span class=\"yt-uix-button-arrow yt-sprite\"></span><ul " +
// "class=\"watch-queue-thumb-menu yt-uix-button-menu yt-uix-button-menu-dark-overflow-action-menu " +
// "hid\"><li role=\"menuitem\" class=\"overflow-menu-choice addto-watch-queue-menu-choice " +
// "addto-watch-queue-play-next yt-uix-button-menu-item\" data-action=\"play-next\" onclick=\";" +
// "return false;\" data-video-ids=\"{{VideoID}}\"><span class=\"addto-watch-queue-menu-text\">" +
// "Play next</span></li><li role=\"menuitem\" class=\"overflow-menu-choice " +
// "addto-watch-queue-menu-choice addto-watch-queue-play-now yt-uix-button-menu-item\" " +
// "data-action=\"play-now\" onclick=\";return false;\" data-video-ids=\"{{VideoID}}\"><span " +
// "class=\"addto-watch-queue-menu-text\">Play now</span></li></ul></button> </span> <button" +
// " class=\"yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty " +
// "yt-uix-button-has-icon no-icon-markup addto-button addto-queue-button video-actions " +
// "spf-nolink hide-until-delayloaded addto-tv-queue-button yt-uix-tooltip\" type=\"button\" " +
// "onclick=\";return false;\" title=\"TV Queue\" data-video-ids=\"{{VideoID}}\" " +
// "data-style=\"tv-queue\"></button> </div></li>";
