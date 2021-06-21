// background

let color = "#3aa757";
let PLAY_SEARCH_URL = "https://bukaivip.com/index.php/vod/search.html?wd="

function search_bukaivip(name) {
    let play;
    url = PLAY_SEARCH_URL + name;
    $.get(url, (rsp) => {
        console.log("play info ok:", name);
        play = "play test";
    });
    return play;
}

// on installed event
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        color
    });
    console.log('Default background color set to %cgreen', `color: ${color}`);
});

// This will run when a bookmark is created.
// chrome.bookmarks.onCreated.addListener(function() {
//     // do something
//   });



// listen message from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case "message":
            break;
            // imdb star request
        case "imdb":
            let imdb = request.data.imdb;
            let IMDB_STAR_URL = "https://www.imdb.com/title/" + imdb + "/ratings/"
            fetch(IMDB_STAR_URL)
                .then(r => r.text())
                .then(text => {
                    sendResponse({
                        imdbhtml: text
                    });
                })
                .catch(error => {
                    console.error(error);
                });
            break;
            // subtitle
        case "assrt":
            const movie_name = request.data.name;
            const TOKEN = "0cmX0DaQaT9A2DvdTIOqfiJkaVc4GFKw"
            const ASSRT_SEARCH_API = "https://api.assrt.net/v1/sub/search?q=" + movie_name;

            let headers = {
                "Authorization": "Bearer " + TOKEN
            }
            fetch(ASSRT_SEARCH_API, {
                headers: headers
            }).then(rsp=>rsp.json()).then(data => {
                console.log("assrt: ", data);
                if (data.status === 0) {
                    let max = -1;
                    let choice;
                    data.sub.subs.forEach(e => {
                        if (e.vote_score > max) {
                            max = e.vote_score;
                            choice = e;
                        }
                    });
                    console.log("choice id: ", choice.id);
                    const ASSRT_detail_API = "https://api.assrt.net/v1/sub/detail?id=" + choice.id;
                    // detch assrt detail
                    fetch(ASSRT_detail_API, {
                        headers: headers
                    }).then(rsp=>rsp.json()).then(detail => {
                        if (detail.status === 0) {
                            detail = detail.sub.subs[0];
                            console.log("detail: ", detail);
                            sendResponse({
                                assrt: {
                                    title: detail.filename,
                                    download: detail.url,
                                    score: detail.vote_score
                                }
                            });
                        }

                    }).catch(error => console.error('Error:', error));
                }
            }).catch(error => console.error('Error:', error));
            break;
        default:
            break;
    }
    return true;
});