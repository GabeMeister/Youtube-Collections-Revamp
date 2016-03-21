
app.controller('MainCtrl', function ($scope, youtubeCollectionsFactory) {
    var _hub = null;
    var _hubConnection = null;

    $scope.suscribedChannelsList = [];
    $scope.collectionChannelsList = [];
    $scope.collectionsList = [];
    $scope.youtubeChannelId = '';
    $scope.displayMessage = '';
    $scope.newCollectionTitle = '';
    $scope.collection = null;


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

        youtubeCollectionsFactory.restartInitialization(_hub);

        $scope.suscribedChannelsList = youtubeCollectionsFactory.clearList();

    }

    $scope.insertCollection = function () {

        // Check that there's actually text in the input
        if ($scope.newCollectionTitle != "" && !doesChannelExist($scope.newCollectionTitle, $scope.collectionsList)) {

            $scope.collectionsList = youtubeCollectionsFactory.insertCollection(_hub, $scope.newCollectionTitle);
            $scope.collection = findItem({title: $scope.newCollectionTitle}, $scope.collectionsList, function (item1, item2) {
                return item1.title === item2.title;
            });
            $scope.newCollectionTitle = '';

        }

    }

    $scope.insertChannelIntoCollection = function (channel, collection) {

        youtubeCollectionsFactory.insertChannelIntoCollection(_hub, channel, collection);

        $scope.collectionChannelsList = youtubeCollectionsFactory.getChannelsInSelectedCollection();

    }

    $scope.setSelectedCollection = function (collection) {
        localStorage.setItem(SELECTED_COLLECTION, JSON.stringify(collection));
        $scope.collectionChannelsList = youtubeCollectionsFactory.getChannelsInSelectedCollection();
    }

    $scope.getSelectedCollection = function () {
        var result = null;
        var storedCollection = JSON.parse(localStorage.getItem(SELECTED_COLLECTION));

        if (storedCollection !== null) {
            var result = findItem(storedCollection, $scope.collectionsList, function(coll1, coll2) {
                return coll1.title === coll2.title;
            });
        }
        
        return result;
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
        $scope.collectionsList = youtubeCollectionsFactory.initialCollectionsList();
        $scope.collectionChannelsList = youtubeCollectionsFactory.getChannelsInSelectedCollection();

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
        
    }

    function onProgressChanged(msgObj) {

        switch ($scope.getExtensionState()) {

            case FETCHING_SUBSCRIPTIONS:
                $scope.displayMessage = msgObj.Message;
                $scope.suscribedChannelsList = youtubeCollectionsFactory.insertChannel(msgObj);

                $scope.$apply();
                break;

            default:
                console.log("ERROR: Unknown extension state");
                break;

        }
        

    }

    function onCollectionInserted(collectionObj) {

        youtubeCollectionsFactory.onCollectionInserted(collectionObj);

    }


    /*********************** CHROME EXTENSION ***********************/
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.message) {

            

        }
    });



    /*********************** Utilities ***********************/
    function doesChannelExist(channelTitle, list) {

        var status = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i].title === channelTitle) {
                status = true;
                break;
            }
        }

        return status;
    }

    function findItem(item, list, func) {
        var result = null;
        for (var i = 0; i < list.length; i++) {
            var funcReturn = func(item, list[i]);
            if (funcReturn) {
                result = list[i];
                break;
            }
        }

        return result;
    }



});


