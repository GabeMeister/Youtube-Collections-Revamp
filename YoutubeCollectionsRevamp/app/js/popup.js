app.controller('MainCtrl', function ($scope, storage) {
    var _hub = null;
    var _hubConnection = null;
    var _isConnected = false;
    

    initializeScope();
    initializeHub();
    

    /*********************** SCOPE ***********************/
    $scope.$watch('selectedCollection', function () {
        // Change collection items to the new currently selected collection
        $scope.collectionItemsList = getCollectionItems();
    });

    $scope.$watch('selectedCollection.channelItems', function() {
        // Change collection items to the new currently selected collection
        $scope.collectionItemsList = getCollectionItems();
    });

    $scope.fetchYoutubeChannelId = function () {

        // We check for the youtube channel id in the local storage. 
        // If it isn't there, we fetch the youtube channel id from the 
        // user's homepage.
        $scope.extensionState = FETCHING_YOUTUBE_CHANNEL_ID;

        chrome.runtime.sendMessage({ message: FETCH_YOUTUBE_CHANNEL_ID_MSG });

    }

    $scope.syncUserWithDatabase = function() {
        console.log('Syncing with database');
    }

    $scope.fetchYoutubeSubscriptions = function () {
        
        $scope.extensionState = FETCHING_SUBSCRIPTIONS;
        
        // Completed inserting channel id, now fetch all subscriptions
        $scope.displayMessage = 'Fetching channel subscriptions...';
        _hub.invoke('FetchAndInsertChannelSubscriptions', $scope.userYoutubeId);

    }

    $scope.restartInitialization = function () {
        _hub.invoke('RestartInitialization');
        clearScope();
    }

    $scope.restartCollectionItems = function () {
        _hub.invoke('RestartCollectionItems');

        for (var i = 0; i < $scope.collectionsList.length; i++) {
            $scope.collectionsList[i].channelItems = [];
        }
    }

    $scope.insertCollection = function () {

        // Check that there's actually text in the input and the collection name
        // doesn't already exist
        if ($scope.newCollectionTitle !== "" && !util.doesChannelExist($scope.newCollectionTitle, $scope.collectionsList)) {
            var newCollItem = createLocalStorageCollection($scope.newCollectionTitle);

            // Add new collection to existing collections list
            $scope.collectionsList.push(newCollItem);
            sortCollectionsList();

            // Query the database
            _hub.invoke('InsertCollection', newCollItem.title, $scope.userYoutubeId);

            // Set new collection as selected
            $scope.selectedCollection = util.findCollectionByName($scope.newCollectionTitle, $scope.collectionsList);

            // Remove text because collection was inserted
            $scope.newCollectionTitle = '';

        }

    }

    $scope.insertChannelIntoCollection = function (channel) {

        // If no collection is selected or there are no collections then we don't
        // do anything
        if ($scope.selectedCollection !== null && !util.doesChannelExist(channel.title, $scope.selectedCollection.channelItems)) {
            $scope.selectedCollection.channelItems.push(channel);
            // Query database with new channel in collection
            _hub.invoke('InsertCollectionItem', channel.id, $scope.selectedCollection.title, $scope.userYoutubeId);
        }
        
    }

    $scope.deleteChannelFromCollection = function (channel) {
        $scope.selectedCollection.channelItems = util.filterCollection(channel.title, $scope.selectedCollection.channelItems);
        // Query database with new channel in collection
        _hub.invoke('DeleteCollectionItem', channel.id, $scope.selectedCollection.title, $scope.userYoutubeId);
    }

    $scope.getChannelStatusCss = function (channelName) {
        // The default color is not-in-collection class
        var className = 'not-in-collection';
        var allChannels = JSON.parse(localStorage.getItem(SUBSCRIPTIONS_LIST));
        var currentChannel = util.findChannelByName(channelName, allChannels);

        // First check if channel has videos. If it doesn't, then we mark it red
        if (currentChannel !== null && !currentChannel.loaded) {
            className = 'videos-not-loaded';
        }
        else if ($scope.selectedCollection !== null && util.doesChannelExist(channelName, $scope.selectedCollection.channelItems)) {
            className = 'in-collection';
        }

        return className;
    }

    $scope.getChannelThumbnail = function (channel) {
        var thumbnail = channel.thumbnail;
        if (!channel.loaded) {
            // Couldn't figure out how to show a local picture, just using imgur for now
            thumbnail = "https://i.imgur.com/uGSuKTt.png";
        }
        return thumbnail;
    }

    $scope.renameCollection = function (collectionName) {
        $scope.oldCollectionName = $scope.selectedCollection.title;
        $scope.newCollectionName = $scope.selectedCollection.title;
        $scope.extensionState = RENAMING_COLLECTION;
    }

    $scope.confirmCollectionRename = function (newCollectionName) {
        if ($scope.oldCollectionName !== newCollectionName) {
            $scope.selectedCollection.title = newCollectionName;
            var userYoutubeId = util.unquotify(localStorage.getItem(USER_YOUTUBE_ID));
            _hub.invoke('RenameCollection', $scope.oldCollectionName, newCollectionName, userYoutubeId);
        }

        // Removes popup window
        $scope.extensionState = INITIALIZED;
        
    }

    $scope.setNotLoadedWarning = function (channel) {
        // If channel's loaded, then no warning. 
        // If channel's not loaded, then yes, we want the warning to show
        $scope.isHoveringOnNotLoadedChannel = !channel.loaded;
    }

    $scope.rescanSubscriptions = function() {
        // Make call to server
        _hub.invoke('UpdateSubscriptions', $scope.userYoutubeId);

    }

    $scope.addAthlean = function () {
        // Add ATHLEAN to subscription list
        $scope.subscriptionList.push({
            id: 'UCe0TLA0EsQbE-MjuHXevj2A',
            title: 'ATHLEAN-X',
            thumbnail: 'https://yt3.ggpht.com/-tN0EMmN9rXc/AAAAAAAAAAI/AAAAAAAAAAA/KQgPgMaouVA/s240-c-k-no-rj-c0xffffff/photo.jpg',
            loaded: true
        });

        sortSubscriptionsList();

        _hub.invoke('AddAthlean');
    }

    $scope.removeAthlean = function () {
        var athleanId = 'UCe0TLA0EsQbE-MjuHXevj2A';

        // Remove ATHLEAN from subscription list
        $scope.subscriptionList = util.filterChannelIdFromList(athleanId, $scope.subscriptionList);

        // Remove ATHLEAN from any possible collections
        for (var i = 0; i < $scope.collectionsList.length; i++) {
            util.filterChannelIdFromCollection(athleanId, $scope.collectionsList[i]);
        }

        _hub.invoke('DeleteAthlean');
    }

    /*********************** CLASS FUNCTIONS ***********************/

    function initializeHub() {
        
        _hubConnection = $.hubConnection(HUB_SERVER_URL);
        _hub = _hubConnection.createHubProxy('YoutubeCollectionsServer');
        _hub.on('onSubscriptionsInserted', onSubscriptionsInserted);
        _hub.on('onProgressChanged', onProgressChanged);
        _hub.on('onSubscriptionUpdated', onSubscriptionUpdated);
        _hub.on('onChannelsToDownloadFetched', onChannelsToDownloadFetched);
        _hub.on('onChannelVideosInserted', onChannelVideosInserted);
        
        _hubConnection.start()
            .done(function () {
                console.log('SignalR Connected!');

                if ($scope.extensionState === FAILED_CONNECTION) {
                    $scope.extensionState = INITIALIZED;
                }
                
                _isConnected = true;
                $scope.$apply();

                // Get any channels that don't have videos loaded
                // Send list to hub to respond with any channels that have recently had videos loaded
                _hub.invoke('GetChannelsWithVideosInserted', getNotLoadedChannels());
            
            })
            .fail(function() {
                console.log('SignalR Failed to Connect!');
                $scope.extensionState = FAILED_CONNECTION;
                _isConnected = false;
                $scope.$apply();
            });
    }

    function initializeScope() {
        storage.bind($scope, 'subscriptionList', { defaultValue: [], storeName: SUBSCRIPTIONS_LIST });
        storage.bind($scope, 'collectionsList', { defaultValue: [], storeName: COLLECTIONS_LIST });
        storage.bind($scope, 'selectedCollection', { defaultValue: null, storeName: SELECTED_COLLECTION });
        storage.bind($scope, 'newCollectionTitle', { defaultValue: '', storeName: NEW_COLLECTION_TITLE });
        storage.bind($scope, 'displayMessage', { defaultValue: '', storeName: DISPLAY_MESSAGE });
        storage.bind($scope, 'userYoutubeId', { defaultValue: '', storeName: USER_YOUTUBE_ID });
        storage.bind($scope, 'extensionState', { defaultValue: '', storeName: EXTENSION_STATE });
        storage.bind($scope, 'areCollectionsOn', { defaultValue: false, storeName: ARE_COLLECTIONS_ON });
        
        // The selected collection needs to be an exact reference to an item in the collections list
        // If you store an item to local storage and then retrieve it from local storage, it's a different
        // reference
        $scope.selectedCollection = util.findCollection($scope.selectedCollection, $scope.collectionsList);

        // We don't actually store the collection items in local storage, they are
        // already stored via the selected collection channel items
        $scope.collectionItemsList = [];

        $scope.isHoveringOnNotLoadedChannel = false;

    }

    function clearScope() {
        // This is for when we are doing a full restart
        $scope.subscriptionList = [];
        $scope.collectionsList = [];
        $scope.selectedCollection = null;
        $scope.newCollectionTitle = '';
        $scope.displayMessage = '';
        $scope.userYoutubeId = '';
        $scope.extensionState = '';
        $scope.collectionItemsList = [];
    }



    /*********************** SIGNALR ***********************/
    function onSubscriptionsInserted() {

        // Completed inserting subscription id
        $scope.displayMessage = 'Done fetching channel subscriptions!';
        $scope.$apply();

        // We set a timeout here because the user needs to have a little bit of 
        // time to read the display message, because it will automatically dissappear.
        setTimeout(function () {
            $scope.extensionState = INITIALIZED;
            $scope.$apply();
        }, 2000);
        
    }

    function onSubscriptionUpdated(subscriptionObj) {

        if (subscriptionObj.Message === 'SubscriptionDelete') {
            // Remove subscription from any collections
            var deletedYoutubeId = subscriptionObj.YoutubeIdAffected;

            for (var i = 0; i < $scope.collectionsList.length; i++) {
                var collection = $scope.collectionsList[i];
                collection.channelItems = util.filterChannelIdFromList(deletedYoutubeId, collection.channelItems);
            }

            $scope.subscriptionList = util.filterChannelIdFromList(deletedYoutubeId, $scope.subscriptionList);
        }
        else {
            addSubscription(subscriptionObj);
        }

        $scope.$apply();
    }

    function onChannelsToDownloadFetched(message) {
        // We received a message from the server containing channels that still 
        // haven't been downloaded yet
        var channelsNotDownloadedYet = message.YoutubeIds;

        for (var i = 0; i < $scope.subscriptionList.length; i++) {
            var channel = $scope.subscriptionList[i];
            
            // We only mark a channel normal if it is not loaded yet and
            // the channel isn't in the list returned back from the server
            // (because that channel list is everything that still isn't downloaded yet)
            if (channel.loaded === false && channelsNotDownloadedYet.indexOf(channel.id) < 0) {
                channel.loaded = true;
                $scope.$apply();
            }
        }



    }

    function onProgressChanged(msgObj) {

        switch ($scope.extensionState) {

            case FETCHING_SUBSCRIPTIONS:
                $scope.displayMessage = msgObj.Message;
                addSubscription(msgObj);
                $scope.$apply();
                break;

            default:
                console.log("ERROR: Unknown extension state");
                break;

        }
        

    }

    function onChannelVideosInserted(msgObj) {
        var loadedChannelId = msgObj.ChannelId;
        
        for (var i = 0; i < $scope.subscriptionList.length; i++) {
            if ($scope.subscriptionList[i].id === loadedChannelId) {
                $scope.subscriptionList[i].loaded = true;
                break;
            }
        }

        $scope.$apply();
    }

    /*********************** HELPER FUNCTIONS ***********************/
    function convertToLocalStorageChannel(channel) {

        return {
            id: channel.SubscriptionYoutubeChannelId,
            title: channel.SubscriptionChannelTitle,
            thumbnail: channel.SubscriptionChannelThumbnail,
            loaded: channel.AreVideosLoaded
        };

    }

    function createLocalStorageCollection(collName) {

        return {
            title: collName,
            channelItems: []
        };

    }

    function addSubscription(subscriptionObj) {
        $scope.subscriptionList.push(convertToLocalStorageChannel(subscriptionObj));
        sortSubscriptionsList();
    }

    function sortSubscriptionsList() {
        $scope.subscriptionList.sort(function (a, b) {
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
    }

    function sortCollectionsList() {
        $scope.collectionsList.sort(function (a, b) {
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
    }

    function getCollectionItems() {
        var result = null;
        if ($scope.selectedCollection !== null) {
            result = $scope.selectedCollection.channelItems;
        }
        return result;
    }

    function getNotLoadedChannels() {
        var channelsNotLoaded = [];

        for (var i = 0; i < $scope.subscriptionList.length; i++) {
            var channel = $scope.subscriptionList[i];
            
            if (channel.loaded === false) {
                channelsNotLoaded.push(channel.id);
            }
        }

        return channelsNotLoaded;
    }



    /*********************** CHROME EXTENSION ***********************/
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.message) {

            

        }
    });


});


