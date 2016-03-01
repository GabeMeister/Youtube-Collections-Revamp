var app = angular.module('angular-dragula-demo', [angularDragula(angular)]);


app.controller('MainCtrl', function ($scope, dragulaService) {
    $scope.SuscribedChannelsList = [];
    $scope.CollectionChannelsList = [];
    $scope.CollectionsList = [];
    $scope.YoutubeChannelId = '';
    $scope.DisplayMessage = '';
    
    var _hub = null;
    var _hubConnection = null;



    initialize();



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
        localStorage.clear();
    }



    







    /*********************** CLASS FUNCTIONS ***********************/

    function initialize() {
        
        _hubConnection = $.hubConnection(constants.hubServerUrl);
        _hub = _hubConnection.createHubProxy('YoutubeCollectionsServer');
        _hub.on('onChannelIdInserted', onChannelIdInserted);
        _hub.on('onSubscriptionsInserted', onSubscriptionsInserted);
        _hub.on('onProgressChanged', onProgressChanged);

        _hubConnection.start();
        



        //var extensionState = localStorage.getItem('ExtensionState');
        //switch (extensionState) {
        //    case null:
        //        // The user is viewing the chrome extension for the first time

        //        break;
        //    case 'undefined':
        //        // There was an error before, just re-initialize the extension
        //        break;
        //    case 'channelIdFound':
        //        // We successfully found the user's channel id.

        //        break;
        //    case 'channelIdNotFound':
        //        // The user isn't logged in and we weren't able to find their channel id.

        //        break;
        //    case 'fetchingSubscriptions':
        //        // In the middle of fetching subscriptions and all videos

        //        break;
        //    case 'initialized':
        //        // Regular usage of the extension

        //        break;
        //    default:
        //        console.log('Unidentified extension state.');
        //        break;
        //}

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
        }, 1000);

        console.log('Finished inserting subscriptions');

    }

    function onProgressChanged(msg) {

        $scope.DisplayMessage = msg;
        $scope.$apply();

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
            return $scope.CollectionChannelsList.indexOf(el.innerText) > -1;
        }
    });




});


