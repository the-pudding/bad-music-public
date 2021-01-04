import { selectAll } from "./utils/dom";
import howler from 'howler';
import parseTrackName from "./parseTrackName";
import getData from "./getData";
import typeOutText from './typeOutText'
import coverFlow from './coverFlow'




let imageWidth = 120;
let albumsShifted = 0;
let coverFlowImages = [];
let scoreNumContainer = d3.select(".score-num");
let tracks = null;
let tokenExists = false;
let finalScore = null;
let artists = null;
let playlists = null;
let artistRecentUrl = null;
let workoutPlaylists = null;
let partyPlaylists = null;
let genres = null;
let recentPlaylists = null;
let allPlaylists = null;
let songPreviewChat = null;
let songPreviewLoop = null;
let previewPlayPauseButton = null;
let playSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-play-circle"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>'
let pauseSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause-circle"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>'
let responses = null;
let input = null;
let artistsRecent = null;
let artistsLong = null;

let loginResponse = null;



function sleeper(ms) {
      return new Promise(function(resolve){
          setTimeout(function(){
            resolve();
          },ms);
      })
}



function appendText(weight,text,container){
        return new Promise(function(resolve){

            console.log("promise",text);

            d3.select(container)
                .append("p")
                .attr("class",function(d){
                    if(weight == "bold" && container == ".data-output"){
                        return "data-label"
                    }
                    return null;
                })
                .append("span")
                .html(text.replace(" (Deluxe)",""));
            resolve();

        });
    // };
}

function appendImage(image,container){
    return new Promise(function(resolve){

        d3.select(container).append("p").attr("class","row-image").append("span")
            .each(function(d,i){
                let art = d3.select(this).node().appendChild(image[i]);
                d3.select(art).attr("class","art")
            });

        resolve();
    });
}

function incrementScore(end){

    let num = null;

    if (d3.select(".score-text").html() == '<span>Awaiting Data</span>'){
        num = 70;
        d3.select(".score-text").html("/100<span></span>");

    }
    else {
        console.log("there");
        num = +scoreNumContainer.text();
    }

    console.log(num);

    let scale = d3.scaleQuantize()
        .domain([0,100])
        .range(["Pretty good", "Good", "Decent", "Respectable", "All right", "Solid", "Okay", "Fair", "Fine", "Mediocre", "Hit-or-miss", "Some bold choices...", "Unique...", "Could be worse", "Kinda rough", "Weak", "Expected", "Okay if ironic", "Cliche", "Embarrassing", "Gross", "Bad", "Bleak", "Distressing", "Discouraging", "Nauseating", "Exhausting", "Sad", "Horrific" ].reverse());

    function updateText(){
        d3.select(".score-text").html("/100")//, <span>"+scale(num))+"</span>";
    }

    function increment(){
        setTimeout(function(d){
            if(num != end){
                if(num < end){
                    num = num + 1;
                }
                else {
                    num = num - 1;
                }
                scoreNumContainer.text(num);
                increment();
            }
            else {
                updateText()
                return num;
                //resolve();
            }
        },50)
    }
    increment();
}

function appendLogin(choices,container){
    return new Promise(function(resolve){

        let optionWrapper = d3.select(container).append("div")

        let options = optionWrapper
            .attr("class","options align-right")
            .selectAll("p")
            .data(choices)
            .enter()
            .append("p")
            // .append("p")

        options
            .each(function(d,i){
                if(i==0){
                    let aTag = d3.select(this)
                        .append("a")
                         //.attr("href","https://stark-ocean-68179.herokuapp.com/login")
                         .attr("href","https://dreadful-spider-05298.herokuapp.com/login")

                    aTag.on("click",function(d){
                      d3.select(this).select("span").style("background-color","#000000").style("color","white").html("Connecting...")
                    })

                    aTag.append("span")
                        //.attr("href","https://accounts.spotify.com/en/login?continue=https:%2F%2Faccounts.spotify.com%2Fauthorize%3Fscope%3Duser-read-private%2Buser-top-read%2Buser-follow-read%2Buser-library-read%2Bplaylist-read-private%2Bplaylist-read-collaborative%26response_type%3Dcode%26redirect_uri%3Dhttp%253A%252F%252Fdreadful-spider-05298.herokuapp.com%252Fcallback%26state%3Dabc%26client_id%3D233e9b508503421e9441079954508772")
                        .html('<svg class="spotify-logo" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"> <path d="M8.97285 0C13.9281 0 17.9453 4.01711 17.9453 8.97236C17.9453 13.9278 13.9281 17.9446 8.97285 17.9446C4.01706 17.9446 0.000276566 13.9278 0.000276566 8.97236C0.000276566 4.01743 4.01706 0.000428569 8.97295 0.000428569L8.97285 0ZM4.85813 12.9407C5.01885 13.2043 5.36385 13.2879 5.62742 13.1261C7.73406 11.8393 10.3861 11.5479 13.5093 12.2614C13.8102 12.33 14.1102 12.1414 14.1788 11.8404C14.2477 11.5393 14.0599 11.2393 13.7582 11.1707C10.3403 10.3895 7.40856 10.7261 5.04349 12.1714C4.77992 12.3332 4.69635 12.6771 4.85813 12.9407ZM3.75992 10.4973C3.96242 10.8268 4.39313 10.9307 4.72206 10.7282C7.13385 9.24546 10.8102 8.81614 13.6629 9.68207C14.0329 9.79382 14.4236 9.58532 14.5359 9.216C14.6473 8.84604 14.4387 8.45604 14.0694 8.34354C10.8109 7.35482 6.75992 7.83375 3.99028 9.53572C3.66135 9.73822 3.55742 10.1689 3.75992 10.4974V10.4973ZM3.66563 7.95332C6.55742 6.23571 11.3285 6.07779 14.0895 6.91575C14.5328 7.05021 15.0017 6.79993 15.136 6.35657C15.2704 5.913 15.0203 5.44446 14.5766 5.30968C11.4072 4.34754 6.13849 4.53343 2.80913 6.50989C2.40949 6.74657 2.27878 7.26161 2.51556 7.65986C2.75128 8.05864 3.26771 8.19011 3.66521 7.95332H3.66563Z" fill="black"/> </svg> Log in with Spotify')

                        ;
                }
                else {
                    d3.select(this)
                        .append("span")
                        .text(d => d)
                        .on("click",function(d,i){
                            let selected = d3.select(this).text();

                            options
                                .style("display",function(d,i){
                                    if(d3.select(this).select("span").text() != selected){
                                        return "none";
                                    }
                                    return null;
                                })
                                .each(function(d,i){
                                    if(d3.select(this).select("span").text() == selected){
                                      d3.select(this).select("span").classed("selected-option",true);
                                    }
                                })

                            resolve([selected,null]);

                        })
                        ;

                }
            })


        options
            .on("click",function(d,i){

                // let selected = d3.select(this).text();

                // options.style("display",function(d,i){
                //     if(d3.select(this).text() != selected){
                //         return "none";
                //     }
                //     return null;
                // })

                // console.log(selected);

                // resolve(selected);

                //return resolve(selected);
            })
            ;

        scrollBottom();
    })
}

function appendOptions(choices,container){
        return new Promise(function(resolve){

            let optionWrapper = d3.select(container).append("div")

            let options = optionWrapper
                .attr("class","options align-right")
                .selectAll("p")
                .data(choices)
                .enter()
                .append("p")
                .append("span")
                .text(d => d);

            options
                .on("click",function(d,i){

                    let selected = d3.select(this).text();

                    options
                        .style("display",function(d,i){
                            if(d3.select(this).text() != selected){
                                return "none";
                            }
                            return null;
                        })
                        .classed("selected-option",function(d,i){
                            if(d3.select(this).text() == selected){
                                return true;
                            }
                            return false;
                        })

                    //only if logged in
                    // if(tokenExists){
                    //     incrementScore(+scoreNumContainer.text()-10+Math.floor(Math.random()*10));
                    // }



                    resolve([selected,optionWrapper.node()]);
                })
                ;


            // if(choices[0] == "Yeah, actually"){
            //     setTimeout(function(d,i){
            //         resolve([null,optionWrapper.node()]);
            //     },1000)
            // }
            scrollBottom();
        })
}

function pause(){
    return new Promise(function (resolve, reject) {
        })
}



function dataAppend(dataset){
    return new Promise(function(resolve){

        let maxLength = 30;

        d3.select('.data-output')
            .append("div")
            .selectAll("p")
            .data(dataset)
            .enter()
            .append("p")
            .style("display","none")
            .text(function(d){
                if(d.length > maxLength){
                    return d.slice(0,maxLength-3) + "..."
                }
                return d;
            })
            .transition()
            .duration(0)
            .delay(function(d,i){
                return i * 100;
            })
            .style("display","block")
            .end()
            .then(() => {
                console.log("ended");
                resolve();
            });


    })

}


function loadImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      image.addEventListener('load', () => {
        resolve(image);
      })
      image.src = url;
    });
}

function fuckMarryKill(dataset){
    console.log("fnk");

    let images = dataset[1];
    console.log(dataset);

    return new Promise(function(resolve){

        let fmkAnswers = {F:0,M:0,K:0}
        function checkIfDone(){
            if(fmkAnswers["F"] + fmkAnswers["M"] + fmkAnswers["K"] == 3){
                resolve();
            }
        }

        let cols = d3.select(".chat-wrapper")
            .append("div")
            .attr("class","fmk align-right options")
            .selectAll("div")
            .data(dataset[0])
            .enter()
            .append("div")
            .attr("class","col")
            ;

        cols.each(function(d,i){
            d3.select(this)
              .append("img")
              .attr("src",function(d,i){
                let imagesToScan = images[i].images
                let imageUrl = null;
                if(d.images.length > 0){
                  imageUrl = getClosestImage(d.images);
                }
                return imageUrl;
              })
        })

        // .append("img")
        //     .attr("src",function(d){ return d.images[0].url})

        cols.append("p")
            .attr("class","artist-name")
            .text(d => d.name);

        cols.append("div")
            .attr("class","fmk-options fmk-options-wide")
            .selectAll("p")
            .data(["Fuck","Marry","Kill"])
            .enter()
            .append("p")
            .attr("class","fmk-option fmk-option-wide")
            .append("span")
            .text(d => d)
            .on("click",function(d,i){
                console.log("here");
                console.log(d3.select(this).node());

                let answer = d3.select(this).text().slice(0,1);
                console.log(answer);
                console.log(fmkAnswers[answer]);
                if(fmkAnswers[answer] == 0){
                    console.log("here");
                    d3.select(this).classed("selected-option",true);
                    fmkAnswers[answer] = 1;
                }
                checkIfDone()
            })
            ;

        scrollBottom();


    })
}

function makeOutChoose(dataset){

    let images = dataset[1];
    console.log(dataset);

    return new Promise(function(resolve){

        let fmkAnswers = {f:0,m:0,k:0}
        function checkIfDone(){
            if(fmkAnswers["f"] + fmkAnswers["m"] + fmkAnswers["k"] == 3){
                resolve();
            }
        }

        let cols = d3.select(".chat-wrapper")
            .append("div")
            .attr("class","fmk align-right options")
            .selectAll("div")
            .data(dataset[0])
            .enter()
            .append("div")
            .attr("class","col")
            ;

        cols.each(function(d,i){
            d3.select(this).node().appendChild(images[i]);
        })
        // .append("img")
        //     .attr("src",function(d){ return d.images[0].url})

        cols.append("p")
            .attr("class","artist-name")
            .text(d => d.name);

        cols.append("div")
            .attr("class","fmk-options")
            .selectAll("p")
            .data(function(d){
                console.log(d);
                let name = d[0] + ", " + d[1][0].artists[0].name;
                return [name];
            })
            .enter()
            .append("p")
            .attr("class","fmk-option")
            .append("span")
            .text(function(d){
                console.log(d);
                return d;
            })
            .on("click",function(d,i){
                d3.select(this).classed("selected-option",true)
                resolve()
            })
            ;

        scrollBottom();


    })
}

function preloadImagesHighRes(imageArray){
    return Promise.all(imageArray.map(function(d){
      let imageUrl = null;
      if(d.images.length > 0){
        imageUrl = getClosestImage(d.images);
        console.log(imageUrl);
        return loadImage(imageUrl)
      }
      return null;
    }))
}

function preloadImages(imageArray){

  return Promise.all(imageArray.map(function(d){
    let imageUrl = null;
    if(d.images[d.images.length-1].url === undefined){
        console.log("missing image",d);
        return null;
    }
    if(d.images.length > 0){
      imageUrl = getClosestImage(d.images);
      console.log(imageUrl);
      return loadImage(imageUrl)
    }
    return null;
  }))


    return Promise.all(imageArray.map(function(d){
        return loadImage(d.images[d.images.length-1].url)
    }))
}

function scrollBottom(){
    return new Promise(function(resolve){
        let el = d3.select(".chat-section").node();
        el.scrollTo(0,el.scrollHeight);
        // let element = d3.select(".chat-wrapper").node();
        // console.log(element.scrollTop,element.scrollHeight, element.clientHeight);
        // element.scrollTop = element.scrollHeight;
        resolve();
    });
}


function appendThinking(container){
    return new Promise(function(resolve){
        d3.select(container)
            .append("div")
            .attr("class","thinking-container")
            .html('<svg version="1.1" id="loader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="-49.5 -1.8 129 84.5" style="enable-background:new -49.5 -1.8 129 84.5;" xml:space="preserve"> <path style="fill:#E9E9E9;" d="M42.4,73.3H-0.4c-18.1,0-33-14.8-33-33v-4.7c0-18.1,14.9-33,33-33h42.8c18.2,0,33,14.9,33,33v4.7 C75.4,58.5,60.5,73.3,42.4,73.3z"/> <circle style="fill:#C8C8C8;" cx="1" cy="38" r="9"/> <circle style="fill:#C8C8C8;" cx="21" cy="38" r="9"/> <circle style="fill:#aaa;" cx="41" cy="38" r="9"/> <circle style="fill:#E9E9E9;" cx="-25.2" cy="62.6" r="10.8"/> <circle style="fill:#E9E9E9;" cx="-41" cy="74.8" r="5"/> </svg>')

        resolve();
    })
}

function removeThinking(container){
    return new Promise(function(resolve){
        d3.select(container)
            .select(".thinking-container")
            .remove();

        resolve();
    })
}

function appendAudio(songId,container){

    let timestamp = null;

    function playSong(){

        if(!songPreviewChat){

            songPreviewChat = new Howl({
                src: songId,
                format: ['mpeg'],
                preload: false,
                autoUnlock: true,
                volume: 0
            });

            songPreviewChat.on('end', function() {
                stopPreview();
            })

            // songPreviewChat.on('update_progress', function() {

            // })

            songPreviewChat.once('load', function () {
                songPreviewChat.fade(0, .3, 2000);
                songPreviewChat.play();
                previewPlayPauseButton.html(pauseSvg)

                songPreviewLoop = setInterval(function(){
                    if(songPreviewChat.seek() > 1){
                        let numValue = 30 - Math.round(songPreviewChat.seek());
                        if(numValue < 10){

                            numValue = "0"+Math.min(0,numValue);
                        }
                        timestamp.text("00:"+numValue)
                    }

                },500)



            });



            songPreviewChat.load()

        }

        else {
            stopPreview();
        }


    }





    return new Promise(function(resolve){
        let wrapper = d3.select(container);

        let row = wrapper.append("div").attr("class","play-row")

        previewPlayPauseButton = row.append("div")
            .attr("class","play-button")
            .html(playSvg)
            .on("click", function(){
                playSong();
            })

        row.append("div")
            .attr("class","waveform")
            .html('<svg viewBox="0 0 83 30" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect y="10.5" width="2" height="9" fill="#007AFF"></rect> <rect x="3" y="8.1001" width="2" height="13.7" fill="#007AFF"></rect> <rect x="6" y="4.1001" width="2" height="21.7" fill="#007AFF"></rect> <rect x="9" y="5.3999" width="2" height="19.1" fill="#007AFF"></rect> <rect x="12" y="7.1001" width="2" height="15.7" fill="#007AFF"></rect> <rect x="15" y="5.1001" width="2" height="19.7" fill="#007AFF"></rect> <rect x="18" y="0.5" width="2" height="29" fill="#007AFF"></rect> <rect x="21" y="0.800049" width="2" height="28.3" fill="#007AFF"></rect> <rect x="24" y="7.1001" width="2" height="15.7" fill="#007AFF"></rect> <rect x="27" y="11.1001" width="2" height="7.7" fill="#007AFF"></rect> <rect x="30" y="13.7998" width="2" height="2.3" fill="#007AFF"></rect> <rect x="33" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="36" y="13.7998" width="2" height="2.3" fill="#007AFF"></rect> <rect x="39" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="42" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="45" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="48" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="51" y="13.7998" width="2" height="2.3" fill="#007AFF"></rect> <rect x="54" y="8.1001" width="2" height="13.7" fill="#007AFF"></rect> <rect x="57" y="12.7998" width="2" height="4.3" fill="#007AFF"></rect> <rect x="60" y="12.7998" width="2" height="4.3" fill="#007AFF"></rect> <rect x="63" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="66" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="69" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="72" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="75" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="78" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> <rect x="81" y="14.1001" width="2" height="1.7" fill="#007AFF"></rect> </svg>')

        timestamp = row.append("p")
            .attr("class","time-stamp")
            .text('00:28')

        resolve();



    })

}

function stopPreview(){
    if(songPreviewChat){
        songPreviewChat.stop();
        songPreviewChat = null;
        clearInterval(songPreviewLoop);
        previewPlayPauseButton.html(playSvg)
    }

}

function expandAscii(){
    return new Promise(function(resolve){
        let height = 0;
        let nodeHeight = d3.select(".ascii-art").select("pre").node().getBoundingClientRect().height;
        function expand(){

            if(height < nodeHeight){
                height = height + nodeHeight/4

                d3.select(".ascii-art").style("height",function(){
                    return height+"px";
                })

                setTimeout(function(){
                    expand()
                },750);
            }
            else {
                d3.select(".ascii-art").style("height","auto");
                resolve();
            }


        }

        expand();
    })
}

async function loginSequence(){

        let textLegibleDelay = 250;

        //await expandAscii();

        await typeOutText.typeOut("Hi, I'm an A.I. trained to evaluate musical taste. To get started, I'll need to see  your Spotify.",".chat-wrapper",1000).then(scrollBottom)
        await typeOutText.typeOut("I'm just gonna look at what you listen to. I won't post or change anything.",".chat-wrapper",0).then(scrollBottom)

        loginResponse = await appendLogin(["login","how do you know what's good?"],".chat-wrapper");
        if(loginResponse[0] == "how do you know what's good?"){
            await typeOutText.typeOut("I've been trained on a corpus of over two million indicators of objectively good music, including Pitchfork reviews, record store recommendations, and subreddits you've never heard of.",".chat-wrapper",0).then(scrollBottom)
            await typeOutText.typeOut("Can I look at your Spotify now?",".chat-wrapper",0).then(scrollBottom)
            loginResponse = await appendLogin(["login","No thanks"],".chat-wrapper");
            if(loginResponse[0] == "No thanks"){
                await typeOutText.typeOut("I can't judge your music without seeing your Spotify. I mean, I can guess from your browsing history and cookies that your taste is rough, but that's all I'll say for now.",".chat-wrapper",0).then(scrollBottom)
                loginResponse = await appendLogin(["login"],".chat-wrapper");
            }
        }
}

function getClosestImage(imageArray){
    let goal = 240;

    if(imageArray.length > 0){

      imageArray = imageArray.sort(function(a,b){
          return Math.abs(a.width - goal) - Math.abs(b.width - goal);
      });

      if(imageArray[0].hasOwnProperty("url")){
        return imageArray[0].url;
      }

    }
    return null;
}

async function init(data,token){

    if(token.length > 0){

        tokenExists = true;
        tracks = data.tracks;

        tracks = data.tracks.filter(function(d){
                return d.timeFrame == "long_term" || d.timeFrame == "medium_term"
            })
            .map(function(d){ return d.trackData})
            .flat(1)
            .filter(function(d){
                return d.album.images.length > 0;
            })

        tracks = d3.groups(tracks,function(d){ return d.album.name });

        tracks = tracks.map(function(d){
            return d[1][0];
        });

        playlists = data.playlists;

        artistsLong = data.artists.filter(function(d){
            return d.timeFrame == "long_term"
        })[0].artistData;

        artistsRecent = data.artists.filter(function(d){
            return d.timeFrame == "medium_term"
        })[0].artistData;

        recentPlaylists = playlists[0].filter(function(d){
            return d.owned == true && d.albumArray.length > 1;
        });

        genres = data.genres;

        allPlaylists = playlists[0];

        coverFlowImages = tracks
            .map(function(d){
                let albumImages = d.album.images;
                return {item:d,image:getClosestImage(albumImages)}
            })

        coverFlowImages = coverFlowImages.filter(function (el) {
            return el.image != null;
        })
        ;

        coverFlowImages = d3.groups(coverFlowImages,function(d){return d.image; })
          .map(function(d){
            return {item:d[1][0].item,image:d[0]};
          });

        // for finding a lot of X...like a lot
        let artistObservationOne = {item:artistsLong[0],image:getClosestImage(artistsLong[0].images)}
        coverFlowImages.splice(7,0,artistObservationOne)

        // for oh great another x artist stan
        let artistObservationTwo = {item:artistsLong[2],image:getClosestImage(artistsLong[2].images)}
        coverFlowImages.splice(10,0,artistObservationTwo)


        //for are you ok, listening to alot of x recently
        artistRecentUrl = {item:artistsRecent[0],image:getClosestImage(artistsRecent[0].images)};
        if(artistRecentUrl){
            coverFlowImages.splice(12,0,artistRecentUrl)
        }

        // for of course artist
        let artistObservationThree = {item:artistsLong[4],image:getClosestImage(artistsLong[4].images)}
        let artistObservationThreePos = 13;
        if(artistRecentUrl){
          artistObservationThreePos = 14;
        }
        coverFlowImages.splice(artistObservationThreePos,0,artistObservationThree)


        // for recent playlists
        let recentPlaylistPos = artistObservationThreePos + 1;
        if(recentPlaylists.length > 0){
          let recentPlaylistOne = {item:recentPlaylists[0].name,image:getClosestImage(recentPlaylists[0].images)};
          coverFlowImages.splice(recentPlaylistPos,0,recentPlaylistOne)
        }


        workoutPlaylists = allPlaylists.filter(function(d){
            return d.workout == 1 && d.albumArray.length > 1;
        })

        partyPlaylists = allPlaylists.filter(function(d){
            return d.party == 1 && d.owned == true && d.albumArray.length > 1;
        })

        console.log(playlists);
        console.log(allPlaylists);
        console.log(workoutPlaylists);
        console.log(partyPlaylists);

        // for so... answer
        [coverFlowImages[2], coverFlowImages[9]] = [coverFlowImages[9], coverFlowImages[2]]


    }
    else {
        await loginSequence();
    }

    /////// DELETE THIS
    // finalScore = incrementScore(1+Math.floor(Math.random()*10));
    // return [finalScore,coverFlowImages];
    ///


    let startingSleeperTime = 1000;
    let imagesPreloaded = null;
    let response = null;
    coverFlow.init(coverFlowImages.slice(0,20).map(d => d.image),".cover-wrapper");
    await sleeper(2000);

    coverFlow.scrollTick(1);
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut("Analyzing your listening history...",".chat-wrapper",500).then(scrollBottom)

    incrementScore(90+Math.floor(Math.random()*10));
    d3.select(".score-section").style("visibility","visible");

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut("lol",".chat-wrapper",500).then(scrollBottom)
    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut("omg",".chat-wrapper",500).then(scrollBottom)
    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut("okay hold up",".chat-wrapper",0).then(scrollBottom)

    await appendThinking(".chat-wrapper").then(scrollBottom)
    await sleeper(2000);
    await removeThinking(".chat-wrapper").then(scrollBottom)

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;
    coverFlow.raiseCover(albumsShifted-1);


    await typeOutText.typeOut(`Do you really listen to ${parseTrackName.parseTrack(coverFlowImages[albumsShifted-1].item)}?`,".chat-wrapper",0).then(scrollBottom)

    response = await appendOptions(["Yes","No","I share this account with someone else"],".chat-wrapper")
    incrementScore(70+Math.floor(Math.random()*10));
    if(response[0] == "Yes"){
        await typeOutText.typeOut("Like ironically?",".chat-wrapper",0).then(scrollBottom)
        response = await appendOptions(["lol yea","no..."],".chat-wrapper")
        if(response == "lol yea"){
            await typeOutText.typeOut("Right...",".chat-wrapper",0).then(scrollBottom)
        }
        else {
            await typeOutText.typeOut("Cool...",".chat-wrapper",0).then(scrollBottom)
        }
    }
    else if(response[0] == "No") {
        await typeOutText.typeOut("Weird, cause it's definitely in your top 10 most-played.",".chat-wrapper",0).then(scrollBottom)
    }
    else {
      await typeOutText.typeOut(`yeah totally...`,".chat-wrapper").then(scrollBottom)
    }

    coverFlow.raiseCover(99);
    await sleeper(1000);

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await appendThinking(".chat-wrapper").then(scrollBottom)
    await sleeper(2000);
    await removeThinking(".chat-wrapper").then(scrollBottom)
    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut(`Seeing plenty of ${genres[0][0]}.`,".chat-wrapper",1500).then(scrollBottom);
    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut(`Finding a lot of ${coverFlowImages[albumsShifted-1].item.name}.`,".chat-wrapper",0).then(scrollBottom)
    await typeOutText.typeOut("Like... a LOT.",".chat-wrapper",500).then(scrollBottom)

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await appendThinking(".chat-wrapper").then(scrollBottom)
    await sleeper(1000);
    await removeThinking(".chat-wrapper").then(scrollBottom)
    await typeOutText.typeOut(`oh boy ${parseTrackName.parseTrack(coverFlowImages[albumsShifted -1].item)}.`,".chat-wrapper",500).then(scrollBottom);
    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await appendThinking(".chat-wrapper").then(scrollBottom)
    await sleeper(1000);
    await removeThinking(".chat-wrapper").then(scrollBottom)

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut(`oh great another ${coverFlowImages[albumsShifted-1].item.name}  stan...`,".chat-wrapper",1000).then(scrollBottom);

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;
    await sleeper(1000);

    if(artistRecentUrl){
        coverFlow.scrollTick(1)
        albumsShifted = albumsShifted + 1;
        await sleeper(500);
        coverFlow.raiseCover(albumsShifted - 1);
        await sleeper(1000);

        await typeOutText.typeOut(`You've been listening to a lot of ${artistsRecent[0].name} lately.`,".chat-wrapper").then(scrollBottom)
        await typeOutText.typeOut("u okay?",".chat-wrapper").then(scrollBottom)
        response = await appendOptions(["Yeah why","Not really"],".chat-wrapper")
        incrementScore(50+Math.floor(Math.random()*10));
        if(response[0] == "Yeah why"){
            await typeOutText.typeOut("no reason...",".chat-wrapper").then(scrollBottom)
        }
        else {
            await typeOutText.typeOut("listen i'm just a neural net do what you gotta do",".chat-wrapper").then(scrollBottom)
        }
    }
    coverFlow.raiseCover(99);
    await sleeper(1000);

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;


    await appendThinking(".chat-wrapper").then(scrollBottom)
    await sleeper(1000);
    await removeThinking(".chat-wrapper").then(scrollBottom)
    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    await typeOutText.typeOut(`Of course ${coverFlowImages[albumsShifted-1].item.name}.`,".chat-wrapper",1000).then(scrollBottom);

    console.log(partyPlaylists,recentPlaylists,workoutPlaylists);

    if(partyPlaylists.length > 0 || recentPlaylists.length > 0 || workoutPlaylists.length > 0){
      await typeOutText.typeOut(`Now let's check out your playlists..`,".chat-wrapper").then(scrollBottom)
      await appendThinking(".chat-wrapper").then(scrollBottom)
      await sleeper(1000);
      await removeThinking(".chat-wrapper").then(scrollBottom)
    }

    if(recentPlaylists.length > 0){

      coverFlow.scrollTick(1)
      albumsShifted = albumsShifted + 1;
      coverFlow.raiseCover(albumsShifted-1);

      await typeOutText.typeOut(`Okay so I found your ${recentPlaylists[0].name} playlist.`,".chat-wrapper",1000).then(scrollBottom)
      await typeOutText.typeOut(`Whole lotta ${recentPlaylists[0].topArtists[0][0]} in there.`,".chat-wrapper").then(scrollBottom)
      await typeOutText.typeOut("Was that on purpose?",".chat-wrapper").then(scrollBottom)

      response = await appendOptions(["Yes","No"],".chat-wrapper")
      incrementScore(40+Math.floor(Math.random()*10));
      if(response[0] == "Yes"){
          await typeOutText.typeOut("I guess I applaud your honesty...",".chat-wrapper").then(scrollBottom)
          let bestTrack = recentPlaylists[0].trackArray.filter(function(d){
              return d.track.artists.filter(function(d){ return d.name == recentPlaylists[0].topArtists[0][0] }).length > 0
          })[0]
          await typeOutText.typeOut(`"${bestTrack.track.name}" is a helluva opener...`,".chat-wrapper").then(scrollBottom)
      }
      else {
          await typeOutText.typeOut(`riiiiiiiiight`,".chat-wrapper").then(scrollBottom)
      }

      coverFlow.raiseCover(99);
      await sleeper(1000);

    }


    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;
    await appendThinking(".chat-wrapper").then(scrollBottom)
    await sleeper(2000);
    await removeThinking(".chat-wrapper").then(scrollBottom)


    if(workoutPlaylists.length > 0){
        await typeOutText.typeOut(`I gotta ask. Do you actually work out to your ${workoutPlaylists[0].name} playlist?`,".chat-wrapper").then(scrollBottom)
        response = await appendOptions(["Yes","No"],".chat-wrapper")
        if(response[0] == "Yes"){
            let artistString = null;
            if(workoutPlaylists[0].hasOwnProperty('topArtists')){
              artistString = workoutPlaylists[0].topArtists.slice(0,2);
              if(artistString.length == 1){
                  artistString = artistString[0];
              }
              else {
                  artistString = artistString[0][0]+" and "+artistString[1][0];
              }
            }
            await typeOutText.typeOut(`sweatin' to ${artistString}! yea get swole lol?`,".chat-wrapper").then(scrollBottom)
        }
        else {
            await typeOutText.typeOut("Weird name i guess lol...",".chat-wrapper").then(scrollBottom)
        }
    }


    if(partyPlaylists.length > 0){
        await typeOutText.typeOut(`I need to know about the party you made ${partyPlaylists[0].name} for...`,".chat-wrapper").then(scrollBottom)
        response = await appendOptions(["it was fun","it was a disaster","why"],".chat-wrapper")
        if(response[0] == "it was fun"){
            await typeOutText.typeOut(`Yeah I bet.`,".chat-wrapper").then(scrollBottom)
        }
        else if(response[0]=="it was a disaster"){
            await typeOutText.typeOut("yeah who could have expected it lol",".chat-wrapper").then(scrollBottom)
        }
        else {
            let artistString = null;
            if(partyPlaylists[0].hasOwnProperty('topArtists')){
              artistString = partyPlaylists[0].topArtists.slice(0,2);
              if(artistString.length == 1){
                  artistString = artistString[0] + " is certainly, um, an interesting pick...";
              }
              else {
                  artistString = artistString[0][0]+" and "+artistString[1][0] + " are certainly, um, interesting picks...";
              }
            }

            await typeOutText.typeOut(`i mean  ${artistString}`,".chat-wrapper").then(scrollBottom)
        }
    }

    coverFlow.scrollTick(1)
    albumsShifted = albumsShifted + 1;

    d3.select(".cover-wrapper").transition().duration(1000).style("bottom","-100%");
    d3.select(".data-output").transition().duration(1000).style("height","0px");
    d3.select(".chat-wrapper").transition().duration(1000).style("padding-bottom","120px");
    d3.select(".score-section").transition().duration(1000).style("bottom","10px");
    scrollBottom();
    await typeOutText.typeOut("One last thing...",".chat-wrapper").then(scrollBottom)

    scrollBottom();
    await sleeper(1500);

    await typeOutText.typeOut("Fuck marry kill. Choose fast.",".chat-wrapper").then(scrollBottom)
    await fuckMarryKill([artistsLong.slice(1,4),artistsLong.slice(1,4)]).then(scrollBottom)

    await sleeper(1000);
    await appendThinking(".chat-wrapper").then(scrollBottom)
    await sleeper(2000);
    await removeThinking(".chat-wrapper").then(scrollBottom)
    incrementScore(20+Math.floor(Math.random()*10));
    response = ["Gross.","Whoa.", "Uhhhhhhhhhhhhh... cool.","Oh you went there...","Let's just leave that there."];
    await typeOutText.typeOut(response[Math.floor(Math.random() * response.length)],".chat-wrapper").then(scrollBottom);

    await typeOutText.typeOut("Have you been to Coachella?",".chat-wrapper").then(scrollBottom)
    response = await appendOptions(["yes","no"],".chat-wrapper")
    incrementScore(18+Math.floor(Math.random()*10));
    await typeOutText.typeOut("Clearly.",".chat-wrapper").then(scrollBottom)


    incrementScore(16+Math.floor(Math.random()*10));

    response = ["Well this has been... interesting.","That was exhausting.","Well I'm lightly nauseated."];
    await typeOutText.typeOut(response[Math.floor(Math.random() * response.length)],".chat-wrapper").then(scrollBottom);

    await typeOutText.typeOut("Let's get your final score.",".chat-wrapper",2000).then(scrollBottom)

    finalScore = incrementScore(1+Math.floor(Math.random()*10));

    return [finalScore,coverFlowImages];

}

export default { init };
