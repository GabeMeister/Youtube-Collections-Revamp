
chrome.runtime.onMessage.addListener(function (request, sender, response) {

    switch (request.message) {

        case 'getChannelId':
            getChannelId();
            break;

    }

});

function getChannelId() {
    $('.guide-item.yt-uix-sessionlink.yt-valign.spf-link').each(function (index) {
        if ($(this).text().indexOf('My Channel') > -1) {

            var channelIdStr = $(this).attr('href').replace('/channel/', '');
            console.log('Found ' + channelIdStr);
            chrome.runtime.sendMessage({ message: 'channelIdFound', channelId: channelIdStr });
            return false;

        }

        // TODO: handle channelIdNotFound case
    });


}