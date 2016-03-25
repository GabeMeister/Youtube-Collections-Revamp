app.factory('youtubeCollectionsFactory', function () {

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

    function findItem(item, list, func) {
        var result = null;

        if (list !== null) {
            for (var i = 0; i < list.length; i++) {
                var funcReturn = func(item, list[i]);
                if (funcReturn) {
                    result = list[i];
                    break;
                }
            }
        }
        

        return result;
    }

    function filterCollection(list, channelTitle) {
        // If the channel's title doesn't match the title passed in, then we
        // add it into a collection and return it.
        var filteredCollection = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].title !== channelTitle) {
                filteredCollection.push(list[i]);
            }
        }

        return filteredCollection;
    }

    return {

        initialChannelList: function () {

            var allChannelsList = JSON.parse(localStorage.getItem(ALL_CHANNELS_LIST));;

            if (allChannelsList === null) {
                allChannelsList = [];
            }

            return allChannelsList;

        },

        initialCollectionsList: function () {

            var allCollectionsList = JSON.parse(localStorage.getItem(COLLECTIONS_LIST));

            if (allCollectionsList === null) {
                allCollectionsList = [];
            }
            return allCollectionsList;

        },

        insertChannel: function (collectionObj) {

            var allChannelsList = JSON.parse(localStorage.getItem(ALL_CHANNELS_LIST));
            var newCollection = convertToLocalStorageChannel(collectionObj);

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

        insertCollection: function (hub, collTitle) {

            var collectionsList = JSON.parse(localStorage.getItem(COLLECTIONS_LIST));
            var newCollItem = createLocalStorageCollection(collTitle);

            if (collectionsList === null) {

                // Add collection to localstorage list
                collectionsList = [newCollItem];

            }
            else {

                // Add new collection to existing collections list
                collectionsList.push(newCollItem);

            }

            // Save item to local storage
            localStorage.setItem(COLLECTIONS_LIST, JSON.stringify(collectionsList));

            // Query the database
            hub.invoke('InsertCollection', collTitle, localStorage.getItem(YOUTUBE_CHANNEL_ID));

            return collectionsList;

        },

        insertChannelIntoCollection: function (hub, channel, collection) {

            // Add channel to local storage
            var collectionList = JSON.parse(localStorage.getItem(COLLECTIONS_LIST));
            var collInsertingInto = findItem(collection, collectionList, function(col1, col2) {
                return col1.title === col2.title;
            });

            collInsertingInto.channelItems.push(channel);
            localStorage.setItem(SELECTED_COLLECTION, JSON.stringify(collInsertingInto));

            localStorage.setItem(COLLECTIONS_LIST, JSON.stringify(collectionList));

            var userYoutubeId = localStorage.getItem(YOUTUBE_CHANNEL_ID);

            // Query database with new channel in collection
            hub.invoke('InsertCollectionItem', channel.id, collection.title, userYoutubeId);


        },

        deleteChannelFromCollection: function(hub, channel, collection) {
            // Delete channel from local storage
            var collectionList = JSON.parse(localStorage.getItem(COLLECTIONS_LIST));
            var collDeletingFrom = findItem(collection, collectionList, function(col1, col2) {
                return col1.title === col2.title;
            });

            collDeletingFrom.channelItems = filterCollection(collDeletingFrom.channelItems, channel.title);

            localStorage.setItem(COLLECTIONS_LIST, JSON.stringify(collectionList));

            var userYoutubeId = localStorage.getItem(YOUTUBE_CHANNEL_ID);

            // Query database with new channel in collection
            hub.invoke('DeleteCollectionItem', channel.id, collection.title, userYoutubeId);
        },

        getSelectedCollection: function(collection) {
            
        },

        getChannelsInSelectedCollection: function() {
            
            // Get selected collection from local storage
            var storedCollection = JSON.parse(localStorage.getItem(SELECTED_COLLECTION));
            var storedCollectionsList = JSON.parse(localStorage.getItem(COLLECTIONS_LIST));

            if (selectedCollection === null || storedCollectionsList === null) {
                return null;
            }

            var selectedCollection = null;
            selectedCollection = findItem(storedCollection, storedCollectionsList, function(item1, item2) {
                return item1.title === item2.title;
            });

            return selectedCollection.channelItems;
        },

        clearList: function () {

            localStorage.clear();
            return null;

        },
        
        restartInitialization: function (hub) {

            hub.invoke('RestartInitialization');

        },

        restartCollectionItems: function (hub) {
            hub.invoke('RestartCollectionItems');

            var collectionsList = JSON.parse(localStorage.getItem(COLLECTIONS_LIST));

            for (var i = 0; i < collectionsList.length; i++) {
                collectionsList[i].channelItems = [];
            }

            localStorage.setItem(COLLECTIONS_LIST, JSON.stringify(collectionsList));
        }
    }
});

