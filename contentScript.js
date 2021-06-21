// make douban better

$(document).ready(function () {
    console.log("ready!");

    // get movie name in douban
    let movie_name = $("span[property='v:itemreviewed']").text();
    // let movie_language = $("#id span").contain("语言")

    // -- download poster --- //
    let movie_img_url = $("#mainpic a img").prop('src');
    let img_id = movie_img_url.split("/").slice(-1)[0].split(".")[0];
    let movie_download_url = `https://img9.doubanio.com/view/photo/raw/public/${img_id}.jpg`;
    $("p[class='gact']").append("<br/>");
    // TODO: 图片直接下载而不是打开图片
    $("p[class='gact']").append(`
        <a id="poster" href="${movie_download_url}" download>下载该海报</a>`);

    $("#poster").click(()=>{
        chrome.downloads.download({url: movie_download_url, saveAs: true}, (id)=>{
            console.log(id);
        });
    });

    // --- add IMDb link --- //

    // get imdb code
    let imdb = $("div[id='info']").contents().eq(-3);
    let imdb_text = $.trim(imdb.text());
    // imdb url
    let imdb_url = "https://www.imdb.com/title/" + imdb_text;
    // append link
    imdb.wrap('<a style="color:#3377AA" target="_blank" href="' + imdb_url + '"></a>');


    // --- add IMDb star --- //
    chrome.runtime.sendMessage({
            type: 'imdb',
            data: {
                imdb: imdb_text
            }
        },
        response => {
            star_info = parse_imdb_star(response.imdbhtml);
            console.log(star_info);
            $("div[class='rating_wrap clearbox']")
                .after(imdb_star_html(imdb_text, star_info.star, star_info.count));

        });

    // --- add assrt for movie -- //

    if (movie_name){
        chrome.runtime.sendMessage({
            type: 'assrt',
            data: {
                name: movie_name
            }
        }, response => {
            console.log("datail cs: ", response.assrt);
            title = response.assrt.title;
            download = response.assrt.download.replace("http", "https");
            score = response.assrt.score;
            $(".tags").before(`<div style="margin-bottom: 30px">
            <h2><i class>下载精选字幕</i> · · · · · ·</h2>
            <a href=${download} download>${title}</a> score: ${score}
            </div>`)
        });
    }
    

});


function parse_imdb_star(contents) {
    /* parse imdb html get star and count */

    // star
    star = $(contents).find("div[class='ipl-rating-star '] span[class='ipl-rating-star__rating']").text();

    // star user count
    star_count = $.trim($(contents).find("div[class='title-ratings-sub-page'] .allText .allText")
        .contents()
        .first()
        .text()
        .split("\n")[1])

    return {
        "star": star,
        "count": star_count
    }
}

function imdb_star_html(imdb, star, count) {
    /* render imdb star */
    let html = `
    <div class="rating_wrap clearbox" rel="v:rating">
        <div class="clearfix">
          <div class="rating_logo ll">IMDB评分</div>
        </div>
        
        <div class="rating_self clearfix" typeof="v:Rating">
            <strong class="ll rating_num" property="v:average">${star}</strong>
            <span property="v:best" content="10.0"></span>
            <div class="rating_right ">
                <div class="ll bigstar bigstar35"></div>
                <div class="rating_sum">
                        <a href="https://imdb.com/title/${imdb}/reviews" class="rating_people">
                            <span property="v:votes">${count}</span>人评价
                        </a>
                </div>
            </div>
        </div>
    </div>`

    return html
}
