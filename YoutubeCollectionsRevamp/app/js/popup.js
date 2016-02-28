var app = angular.module('angular-dragula-demo', [angularDragula(angular)]);


app.controller('MainCtrl', function ($scope, dragulaService) {
    $scope.SuscribedChannelsList = [];
    $scope.CollectionChannelsList = [];
    $scope.CollectionsList = [];
    $scope.YoutubeChannelId = '';



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
        // TODO
        localStorage.setItem('ExtensionState', 'fetchingSubscriptions');
        console.log('About to fetch subscriptions');
    }

    $scope.restartInitialization = function () {
        localStorage.clear();
    }



    







    /*********************** CLASS FUNCTIONS ***********************/

    function initialize() {
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


