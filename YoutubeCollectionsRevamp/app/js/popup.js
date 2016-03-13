var app = angular.module('youtube-collections-revamp', []);

app.factory('youtubeCollectionsFactory', function () {

    function convertToLocalStorageCollection(coll) {

        return {
            id: coll.SubscriptionChannelId,
            title: coll.SubscriptionChannelTitle
        };

    }

    return {

        initialChannelList: function () {

            var allChannelsList = localStorage.getItem(ALL_CHANNELS_LIST);
            return JSON.parse(allChannelsList);

        },

        addChannel: function (collectionObj) {

            var allChannelsList = JSON.parse(localStorage.getItem(ALL_CHANNELS_LIST));
            var newCollection = convertToLocalStorageCollection(collectionObj);

            if (allChannelsList === null) {

                allChannelsList = [newCollection];
                localStorage.setItem(ALL_CHANNELS_LIST, JSON.stringify(allChannelsList));

            }
            else {

                allChannelsList.push(newCollection);

                // Keep channels in alphabetical order
                allChannelsList.sort(function (a, b) {
                    if (a.title < b.title) {
                        return -1;
                    }
                    else if (a.title > b.title) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });

                localStorage.setItem(ALL_CHANNELS_LIST, JSON.stringify(allChannelsList));

            }
            
            
            return allChannelsList;
        },

        addCollection: function(collectionName) {

            var collectionsList = JSON.parse(localStorage.getItem(COLLECTIONS_LIST));

            if (collectionsList === null) {

                // Query the database

                
            }
            else {

                // Add new collection

            }

        },

        clearList: function () {
            localStorage.clear();
            return null;
        }

    }
});

app.controller('MainCtrl', function ($scope, youtubeCollectionsFactory) {
    var _hub = null;
    var _hubConnection = null;

    $scope.suscribedChannelsList = [];
    $scope.collectionChannelsList = [];
    $scope.collectionsList = [];
    $scope.youtubeChannelId = '';
    $scope.displayMessage = '';
    $scope.newCollectionName = '';


    initialize();
    initializeScope();
    



    /*********************** SCOPE ***********************/
    $scope.getExtensionState = function () {

        return localStorage.getItem(EXTENSION_STATE);

    }

    $scope.fetchYoutubeChannelId = function () {

        // We check for the youtube channel id in the local storage. 
        // If it isn't there, we fetch the youtube channel id from the 
        // user's homepage.
        localStorage.setItem(EXTENSION_STATE, FETCHING_YOUTUBE_CHANNEL_ID);
        chrome.runtime.sendMessage({ message: FETCH_YOUTUBE_CHANNEL_ID_MSG });

    }

    $scope.fetchYoutubeSubscriptions = function () {

        localStorage.setItem(EXTENSION_STATE, FETCHING_SUBSCRIPTIONS);
        
        // Kinda subtle, but we insert the youtube id, and THEN in the signalr callback we actually
        // start fetching the subscriptions
        $scope.displayMessage = 'Inserting channel id...';
        _hub.invoke('InsertYoutubeId', localStorage.getItem(YOUTUBE_CHANNEL_ID));

    }

    $scope.restartInitialization = function () {

        $scope.suscribedChannelsList = youtubeCollectionsFactory.clearList();

    }

    $scope.createNewCollection = function() {

    }

    $scope.addChannelToCollection = function () {

    }


    

    /*********************** CLASS FUNCTIONS ***********************/

    function initialize() {
        
        _hubConnection = $.hubConnection(HUB_SERVER_URL);
        _hub = _hubConnection.createHubProxy('YoutubeCollectionsServer');
        _hub.on('onChannelIdInserted', onChannelIdInserted);
        _hub.on('onSubscriptionsInserted', onSubscriptionsInserted);
        _hub.on('onProgressChanged', onProgressChanged);

        _hubConnection.start();
        
    }

    function initializeScope() {

        $scope.suscribedChannelsList = youtubeCollectionsFactory.initialChannelList();

    }

    function doesLocalStorageItemExist(key) {

        var result = true;
        if (localStorage.getItem(key) === null || localStorage.getItem(key) === "undefined") {
            result = false;
        }
        return result;

    }



    /*********************** SIGNALR ***********************/
    function onChannelIdInserted() {

        // Completed inserting channel id, now fetch all subscriptions
        $scope.displayMessage = 'Fetching channel subscriptions...';
        $scope.$apply();
        _hub.invoke('FetchAndInsertChannelSubscriptions', localStorage.getItem(YOUTUBE_CHANNEL_ID));

    }

    function onSubscriptionsInserted() {

        // Completed inserting subscription id
        $scope.displayMessage = 'Done fetching channel subscriptions!';
        $scope.$apply();

        setTimeout(function () {
            localStorage.setItem(EXTENSION_STATE, INITIALIZED);
            $scope.$apply();
        }, 2000);

        console.log('Finished inserting subscriptions');

    }

    function onProgressChanged(msgObj) {

        switch ($scope.getExtensionState()) {

            case FETCHING_SUBSCRIPTIONS:
                $scope.displayMessage = msgObj.Message;
                $scope.suscribedChannelsList = youtubeCollectionsFactory.addChannel(msgObj);

                $scope.$apply();
                break;

            default:
                console.log("ERROR: Unknown extension state");
                break;

        }
        

    }



    /*********************** CHROME EXTENSION ***********************/
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.message) {

            

        }
    });



    /*********************** Utilities ***********************/
    function doesChannelExist(list, channelName) {
        var status = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].SubscriptionChannelTitle === channelName) {
                status = true;
                break;
            }
        }

        return status;
    }



});


