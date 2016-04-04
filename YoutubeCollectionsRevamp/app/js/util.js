var util = {
    findChannel: function(channel, channelList) {
        var foundChannel = null;

        for (var i = 0; i < channelList.length; i++) {
            if (channelList[i].title === channel.title) {
                foundChannel = channelList[i];
                break;
            }
        }

        return foundChannel;
    },

    findCollection: function(collection, collectionList) {
        var foundCollection = null;

        if (collectionList !== null && collection !== null) {
            for (var i = 0; i < collectionList.length; i++) {
                if (collectionList[i].title === collection.title) {
                    foundCollection = collectionList[i];
                    break;
                }
            }
        }
        
        return foundCollection;
    },

    findCollectionByName: function(collectionTitle, collectionList) {
        var foundCollection = null;

        if (collectionList !== null) {
            for (var i = 0; i < collectionList.length; i++) {
                if (collectionList[i].title === collectionTitle) {
                    foundCollection = collectionList[i];
                    break;
                }
            }
        }
        
        return foundCollection;
    },

    filterCollection: function (channelTitle, list) {
        // If the channel's title doesn't match the title passed in, then we
        // add it into a collection and return it.
        var filteredCollection = [];

        if (list !== null) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].title !== channelTitle) {
                    filteredCollection.push(list[i]);
                }
            }
        }
        
        return filteredCollection;
    },

    doesChannelExist: function(channelTitle, list) {
        var status = false;

        if (list !== null) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].title === channelTitle) {
                    status = true;
                    break;
                }
            }
        }
        
        return status;
    },

    IsSame: function (var1, var2) {
        var result = false;

        if (var1 === null && var2 === null) {
            result = true;
        }
        else {
            var var1WithoutQuotes = var1.replace(/['"]+/g, '');
            var var2WithoutQuotes = var2.replace(/['"]+/g, '');

            if (var1WithoutQuotes === var2WithoutQuotes) {
                result = true;
            }
        }

        return result;

    },

    quotify: function (str) {
        return '"' + str + '"';
    },

    unquotify: function (str) {
        return str.replace(/['"]+/g, '');
    }

}

