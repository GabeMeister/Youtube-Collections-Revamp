
app.controller('MainCtrl', function ($scope, storage) {
    var _hub = null;
    var _hubConnection = null;



    initializeHub();
    initializeScope();
    



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

    $scope.fetchYoutubeSubscriptions = function () {
        
        $scope.extensionState = FETCHING_SUBSCRIPTIONS;
        
        // Kinda subtle, but we insert the youtube id, and THEN in the signalr callback we actually
        // start fetching the subscriptions
        $scope.displayMessage = 'Inserting channel id...';
        _hub.invoke('InsertYoutubeId', $scope.userYoutubeId);

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

    $scope.isChannelInCollection = function (channelName) {
        var className = 'not-in-collection';
        if (util.doesChannelExist(channelName, $scope.selectedCollection.channelItems)) {
            className = 'in-collection';
        }
        return className;
    }


    

    /*********************** CLASS FUNCTIONS ***********************/

    function initializeHub() {
        
        _hubConnection = $.hubConnection(HUB_SERVER_URL);
        _hub = _hubConnection.createHubProxy('YoutubeCollectionsServer');
        _hub.on('onChannelIdInserted', onChannelIdInserted);
        _hub.on('onSubscriptionsInserted', onSubscriptionsInserted);
        _hub.on('onProgressChanged', onProgressChanged);

        _hubConnection.start();
        
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
    function onChannelIdInserted() {

        // Completed inserting channel id, now fetch all subscriptions
        $scope.displayMessage = 'Fetching channel subscriptions...';
        $scope.$apply();
        _hub.invoke('FetchAndInsertChannelSubscriptions', $scope.userYoutubeId);

    }

    function onSubscriptionsInserted() {

        // Completed inserting subscription id
        $scope.displayMessage = 'Done fetching channel subscriptions!';
        $scope.$apply();

        setTimeout(function () {
            $scope.extensionState = INITIALIZED;
            $scope.$apply();
        }, 2000);
        
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

    function convertToLocalStorageChannel(channel) {

        return {
            id: channel.SubscriptionYoutubeChannelId,
            title: channel.SubscriptionChannelTitle
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


    /*********************** CHROME EXTENSION ***********************/
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        switch (request.message) {

            

        }
    });


});


