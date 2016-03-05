var app = angular.module('angular-dragula-demo', [angularDragula(angular)]);

app.factory('youtubeCollectionsFactory', function () {
    return {
        initialList: function () {

            var collectionsArr = localStorage.getItem('collectionsArr');
            return JSON.parse(collectionsArr);

        },
        addToCollection: function (collectionObj) {

            var collectionsArr = JSON.parse(localStorage.getItem('collectionsArr'));

            if (collectionsArr === null) {
                collectionsArr = [collectionObj];
                localStorage.setItem('collectionsArr', JSON.stringify(collectionsArr));
            }
            else {

                collectionsArr.push(collectionObj);
                collectionsArr.sort(function (a, b) {
                    if (a.SubscriptionChannelTitle < b.SubscriptionChannelTitle) {
                        return -1;
                    }
                    else if (a.SubscriptionChannelTitle > b.SubscriptionChannelTitle) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });

                localStorage.setItem('collectionsArr', JSON.stringify(collectionsArr));

            }
            
            
            return collectionsArr;
        },
        clearList: function () {
            localStorage.clear();
            return null;
        }
    }
})

app.controller('MainCtrl', function ($scope, dragulaService, youtubeCollectionsFactory) {
    var _hub = null;
    var _hubConnection = null;

    initialize();

    $scope.SuscribedChannelsList = youtubeCollectionsFactory.initialList();
    $scope.CollectionChannelsList = [];
    $scope.CollectionsList = [];
    $scope.YoutubeChannelId = '';
    $scope.DisplayMessage = '';

    
    
    
    

    

    



    /*********************** SCOPE ***********************/
    $scope.$watch('$viewContentLoaded', function () {
        
    });

    $scope.getExtensionState = function () {
        return localStorage.getItem('ExtensionState');
    }

    $scope.fetchYoutubeChannelId = function () {
        // We check for the youtube channel id in the local storage. 
        // If it isn't there, we fetch the youtube channel id from the 
        // user's homepage.
        localStorage.setItem('ExtensionState', 'fetchingYoutubeChannelId');
        chrome.runtime.sendMessage({ message: 'fetchYoutubeId' });
    }

    $scope.fetchYoutubeSubscriptions = function () {

        localStorage.setItem('ExtensionState', 'fetchingSubscriptions');
        
        // Insert the youtube id, then in the signalr callback we actually
        // start fetching the subscriptions
        $scope.DisplayMessage = 'Inserting channel id...';
        _hub.invoke('InsertYoutubeId', localStorage.getItem('YoutubeChannelId'));
        

        



    }

    $scope.restartInitialization = function () {
        $scope.SuscribedChannelsList = youtubeCollectionsFactory.clearList();
        
    }

    







    /*********************** CLASS FUNCTIONS ***********************/

    function initialize() {
        
        _hubConnection = $.hubConnection(constants.hubServerUrl);
        _hub = _hubConnection.createHubProxy('YoutubeCollectionsServer');
        _hub.on('onChannelIdInserted', onChannelIdInserted);
        _hub.on('onSubscriptionsInserted', onSubscriptionsInserted);
        _hub.on('onProgressChanged', onProgressChanged);

        _hubConnection.start();
        








    }

    function doesLocalStorageItemExist(key) {
        var result = true;
        if (localStorage.getItem(key) === null || localStorage.getItem(key) === "undefined") {
            result = false;
        }
        return result;
    }

    function sillyFunction() {
        return SillyVariable;
    }


    /*********************** SIGNALR ***********************/
    function onChannelIdInserted() {

        // Completed inserting channel id, now fetch all subscriptions
        $scope.DisplayMessage = 'Fetching channel subscriptions...';
        $scope.$apply();
        _hub.invoke('FetchAndInsertChannelSubscriptions', localStorage.getItem('YoutubeChannelId'));

    }

    function onSubscriptionsInserted() {

        // Completed inserting subscription id
        $scope.DisplayMessage = 'Done fetching channel subscriptions!';
        $scope.$apply();

        setTimeout(function () {
            localStorage.setItem('ExtensionState', 'initialized');
            $scope.$apply();
            window.close();
        }, 2000);

        console.log('Finished inserting subscriptions');

    }

    function onProgressChanged(msgObj) {

        switch ($scope.getExtensionState()) {

            case 'fetchingSubscriptions':
                $scope.DisplayMessage = msgObj.Message;
                $scope.SuscribedChannelsList = youtubeCollectionsFactory.addToCollection(msgObj);

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



    /*********************** DRAGULA ***********************/
    dragulaService.options($scope, 'first-bag', {
        copy: true,
        invalid: function (el, handle) {
            return doesChannelExist($scope.CollectionChannelsList, el.innerText);
        }
    });

    function doesChannelExist(list, channelName) {
        var status = false;
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i].SubscriptionChannelTitle === channelName) {
                status = true;
                break;
            }
        }

        return status;
    }



});


