import { log } from "handlebars";
import parseTrackName from "./parseTrackName";
import typeOutText from './typeOutText'
import coverFlow from './coverFlow'


let response = [];
let genreExplanation = [];

function appendInsult(insult,container){
    container.append("p").text(insult);
}

function scrollBottom(){
    return new Promise(function(resolve){
        let el = d3.select(".score-slide").node();
        console.log(el.scrollHeight);
        window.scrollTo(0,el.scrollHeight);
        resolve();
    });
}

function determineBasicness(data){
    let artistsAll = data.artists.filter(function(d){return d.timeFrame != "short_term"}).map(function(d){ return d.artistData}).flat(1);
    let tracksAll = data.tracks.map(function(d){ return d.trackData}).flat(1);

    let uniqArtists = [...new Set(artistsAll.map(d => d.name))];

    let popularTracks = tracksAll.filter(function(d,i){
        return +d.popularity > 80;
    }).sort(function(a,b){return b.popularity - a.popularity; });

    let obscureTracks = tracksAll.filter(function(d,i){
        return +d.popularity < 65;
    }).sort(function(a,b){return a.popularity - b.popularity; });

    let popularArtists = artistsAll.filter(function(d){
        return +d.popularity > 80;
    }).sort(function(a,b){return b.popularity - a.popularity; });

    let obscureArtists = artistsAll.filter(function(d){
        return +d.popularity < 65;
    }).sort(function(a,b){return a.popularity - b.popularity; });

    popularArtists = d3.groups(popularArtists,( d => d.name )).map(function(d,i){return d[1][0]});
    obscureArtists = d3.groups(obscureArtists,( d => d.name )).map(function(d,i){return d[1][0]});

    let percentBasic = popularArtists.length/uniqArtists.length;
    let percentObscure = obscureArtists.length/uniqArtists.length;
    let basicLevel = "little";
    if(percentBasic > .6){
        basicLevel = "most"
    }
    else if(percentObscure > .5){
        basicLevel = "obscure";
    }
    else if(percentBasic > .3){
        basicLevel = "pretty"
    }
    return {"percentBasic":percentBasic,"percentObscure":percentObscure,"level":basicLevel,popularArtists:popularArtists,obscureArtists:obscureArtists,popularTracks:popularTracks,obscureTracks:obscureTracks}

}

function arrayToSentence(arr) {
    if (arr.length === 1) return arr[0];
    if(arr.length == 2){
        return arr[0] + " and " + arr[1];
    }
    const firsts = arr.slice(0, arr.length - 1);
    const last = arr[arr.length - 1];
    return firsts.join(', ') + ', and ' + last;
}

function filterForPopSongs(data){

    let tracksForPopAnalysis = data.filter(function(d){
        return d.timeFrame == "long_term" || d.timeFrame == "short_term";
    }).map(function(d){ return d.trackData }).flat(1);

    let popSongs = tracksForPopAnalysis.filter(function(d){
        return d["artistGenres"].indexOf("pop") > -1
    })

    return popSongs;
}

function filterForGenres(data,genresForAnalysis){

    let artistsForAnalysis = data.filter(function(d){
        return d.timeFrame == "long_term" || d.timeFrame == "short_term";
    }).map(function(d){ return d.artistData }).flat(1);

    return artistsForAnalysis.filter(function(d){
        let genreCheck = false;
        for (var genre in genresForAnalysis){
            if (d["genres"].indexOf(genresForAnalysis[genre]) > -1){
                genreCheck = true;
            }
        }
        return genreCheck == true;
    })
}


function filterForRecent(songs){
    return songs.filter(function(d){
        return +d.album.release_date.slice(0,4) > 2015;
    })
}

function filterForOld(songs){

    return songs.filter(function(d){
        return +d.album.release_date.slice(0,4) < 1991;
    })
}

function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}

function determineReleaseYears(data){
    let tracks = data.tracks.filter(function(d){
            return d//d.timeFrame != "short_term"
        })
        .map(function(d){ return d.trackData}).flat(1);
    let releaseDates = tracks.map(d => +d.album.release_date.slice(0,4));
    let avgReleaseDate = Math.floor(d3.mean(releaseDates,d => d));
    let avgReleaseDecade = Math.floor(mode(tracks.map(d => +d.album.release_date.slice(2,3))));

    let tracksInAvgReleaseDecade = tracks.filter(function(d,i){
        return +d.album.release_date.slice(2,3) == avgReleaseDecade;
    })

    tracksInAvgReleaseDecade = d3.groups(tracksInAvgReleaseDecade,function(d,i){
      return d.name
    }).map(function(d){
      return d[1][0];
    })

    let obamaEra = [];
    let presentTracks = [];

    let tracksBelowAvgReleaseDate = tracks.filter(function(d){
            return +d.album.release_date.slice(0,4) < avgReleaseDate
        })
        .sort(function(a,b){
            return +a.album.release_date.slice(0,4) - +b.album.release_date.slice(0,4)
        });

      tracksBelowAvgReleaseDate = d3.groups(tracksBelowAvgReleaseDate,function(d,i){
          return d.name
        }).map(function(d){
          return d[1][0];
        })

    if(avgReleaseDecade == 1){
        let avgYear = Math.floor(mode(tracksInAvgReleaseDecade.map(d => +d.album.release_date.slice(0,4))));
        if(avgYear < 2019){
            obamaEra = tracksInAvgReleaseDecade.filter(function(d,i){
                return +d.album.release_date.slice(0,4) < 2019;
            })
        }
    }

    if(avgReleaseDecade == 1 || avgReleaseDecade == 2){

        let avgYear = Math.floor(mode(tracksInAvgReleaseDecade.map(d => +d.album.release_date.slice(0,4))));
        if(avgYear > 2018){
            presentTracks = tracksInAvgReleaseDecade.filter(function(d,i){
                return +d.album.release_date.slice(0,4) > 2018;
            })
        }
    }

    return {avgReleaseDate:avgReleaseDate,tracksBelowAvgReleaseDate:tracksBelowAvgReleaseDate,avgReleaseDecade:avgReleaseDecade,tracksInAvgReleaseDecade:tracksInAvgReleaseDecade,obamaEra:obamaEra,presentTracks:presentTracks};
}

function trimNames(artist){
    return artist.toLowerCase().split("(")[0].replace(/[.,\/#!$%\^&\*;:{}=\-_’'`~()]/g,"").replace(/\s{2,}/g," ").replace(/\s/g,'').replace("remix","");
}

function determineAlbumFragment(data,fragments){
    let insult = [];

    let albumsWithFragments = fragments.album.map(function(d){
        return trimNames(d.name)
    });

    let albumMap = d3.group(fragments.album, d => trimNames(d.name))

    let albumsAll = data.tracks.filter(function(d){
        return d.timeFrame != "short_term"
      })
      .sort(function(a,b){
        if(a.timeFrame == "medium_term"){
          return -1
        }
        if(b.timeFrame == "medium_term"){
          return -1;
        }
        return 1;
        //return d.timeFrame
      })
      .map(function(d){
        return d.trackData
      }).flat(1);

    let uniqueAlbums = d3.groups(albumsAll,function(d){
        return trimNames(d.album.name)
      })
      .filter(function(d,i){
        return d[1].length > 3;
      })

    if(uniqueAlbums.length > 0){
      uniqueAlbums = uniqueAlbums
        .map(function(d,i){
          return {name:d[0],item:d[1][0]}
        });


      uniqueAlbums.forEach(function(item,i){
          let album = item.name;
          if(albumsWithFragments.indexOf(album) > -1){
              insult.push({"name":album,fragments:albumMap.get(album), rank:i,item:item});
          }
      })
    }

    if(insult.length > 0){
        return insult;
    }


    return [];
}

function getMostPopularGenre(data){

    let artistCount = d3.sum(data.artists, d =>  d.artistData.length);

    //limited to just 10% or #1 genre;

    console.log(data.genres);

    return data.genres
        .filter(function(d){
            return !d[0].includes("pop");
        })
        .filter(function(d,i){
            return d[1].length > artistCount*.05 || i == 0;
        })
}


function determineGenreFragment(data,fragments){
    let insult = [];

    let genresWithFragments = fragments.genre.map(function(d){
        return trimNames(d.name)
    });

    let genreMap = d3.group(fragments.genre, d => trimNames(d.name))

    let genresAll = getMostPopularGenre(data);

    genresAll = genresAll
        .map(function(d){
            return trimNames(d[0]);
        }).flat(1);

    genresAll.forEach(function(genre,i){
        if(genresWithFragments.indexOf(genre) > -1){
            insult.push({"name":genre,fragments:genreMap.get(genre), rank:i});
        }
    })

    if(insult.length > 0){
        return insult;
    }
    return [];
}

function determineTrackFragment(data,fragments){

    let insult = [];

    let trackWithFragments = fragments.track.map(function(d){
        return trimNames(d.name)
    });

    let trackMap = d3.group(fragments.track, d => trimNames(d.name))

    let tracksAll = data.tracks.filter(function(d){return d.timeFrame != "short_term"}).map(function(d){ return d.trackData}).flat(1);


    let uniqueTracks = d3.groups(tracksAll,function(d){
        return trimNames(d.name)
      })
      .map(function(d,i){
        return {name:d[0],item:d[1][0]}
      });

    uniqueTracks.forEach(function(item,i){
        let track = item.name;
        if(trackWithFragments.indexOf(track) > -1){
            insult.push({"name":track,fragments:trackMap.get(track), rank:i,item:item});
        }
    })

    //insult = insult.flat(1);
    if(insult.length > 0){
        return insult;
    }
    return [];

}

function determineArtistFragment(data,fragments){

    let insult = [];

    let artistsWithFragments = fragments.artist.map(function(d){
        return trimNames(d.name)
    });
    let artistMap = d3.group(fragments.artist, d => trimNames(d.name))

    let artistsAll = data.artists.filter(function(d){
            return d.timeFrame != "short_term"
        })
        .sort(function(a,b){
          if(a.timeFrame == "medium_term"){
            return -1
          }
          if(b.timeFrame == "medium_term"){
            return -1;
          }
          return 1;
          //return d.timeFrame
        })

    artistsAll = artistsAll
        .map(function(d){ return d.artistData}).flat(1);


    let uniqueArtists = d3.groups(artistsAll,function(d){
            return trimNames(d.name)
        })
        .map(function(d,i){
          return {name:d[0],item:d[1][0]}
        });


    uniqueArtists.forEach(function(item,i){
        let artist = item.name;

        if(artistsWithFragments.indexOf(artist) > -1){
            insult.push({"name":artist,fragments:artistMap.get(artist),rank:i,item:item});
        }
    })
    // insult = insult.flat(1);
    if(insult.length > 0){
        return insult;
    }
    return [];

}

function getGenericArtistFragment(artist){
    let fragments = [`${artist}-as-your-zoom-background`,`${artist}-hive-army-stan-yas-um-slay-mama-i-think`,`constantly-defending-${artist}`,`annoying-your-neighbors-with-${artist}`,`omfg-${artist}`,`${artist}-stan`,`too-much-${artist}`,`cool-it-with-the-${artist}`,`${artist}-on-repeat`]
    return fragments[Math.floor(Math.random() * fragments.length)];
}

function getGenericGenreFragment(genre){
    let fragments = [`too-much-${genre}`,`${genre}-overload`,`${genre}-fan`,`${genre}-addict`,`${genre}-${genre}-and-more-${genre}`]
    return fragments[Math.floor(Math.random() * fragments.length)];
}

function constructFragments(trackFragments,artistFragments,genreFragments,albumFragments,data){

    let artistsLong = data.artists.filter(function(d){
        return d.timeFrame == "medium_term";
    })[0].artistData;

    artistsLong = artistsLong.concat(data.artists.filter(function(d){
        return d.timeFrame == "long_term";
    })[0].artistData)

    let specialObsession = [];
    let specialFragment = [];
    let specialItems = [];
    let specialIds = [];



    artistFragments.forEach(function(d){
        d.fragmentArray = d.fragments.map(function(d){return d.id;});
    })

    if(artistFragments.length > 0){

        let fragmentIndex = Math.floor(Math.random() * artistFragments[0].fragments.length);

        let artistFragmentId = artistFragments[0].fragments[fragmentIndex].id

        specialFragment.push(artistFragments[0].fragments[fragmentIndex].fragment);
        specialObsession.push(artistFragments[0].fragments[fragmentIndex].name)
        specialItems.push(artistFragments[0].item)

        specialIds.push(artistFragmentId);

        artistFragments = artistFragments.filter(function(d){
          return d.fragmentArray.indexOf(artistFragmentId) == -1;
        })

    }

    if(genreFragments.length > 0){

        for(let artist in artistsLong){
          if(artistsLong[artist].hasOwnProperty("genres")){
            let artistGenres = artistsLong[artist].genres;
            if(artistGenres.indexOf(genreFragments[0].name) > -1){
              genreExplanation.push(artistsLong[artist].name);
            }
          }
        }

        let fragmentIndex = Math.floor(Math.random() * genreFragments[0].fragments.length);


        specialFragment.push(genreFragments[0].fragments[fragmentIndex].fragment);

        let obsessionString = `${genreFragments[0].fragments[fragmentIndex].name}`;
        if(genreExplanation.length > 0){
          obsessionString = `${genreFragments[0].fragments[fragmentIndex].name} (e.g., ${arrayToSentence(genreExplanation.slice(0,2))})`
        }

        specialObsession.push(obsessionString);

        specialIds.push(genreFragments[0].fragments[fragmentIndex].id);

    }

    if(albumFragments.length > 0){

        let fragmentIndex = Math.floor(Math.random() * albumFragments[0].fragments.length);

        specialFragment.push(albumFragments[0].fragments[fragmentIndex].fragment);
        specialObsession.push(albumFragments[0].fragments[fragmentIndex].name)
        specialItems.push(albumFragments[0].item)

        specialIds.push(albumFragments[0].fragments[fragmentIndex].id);

    }

    if(specialFragment.length < 3 && trackFragments.length > 0){

        let fragmentIndex = Math.floor(Math.random() * trackFragments[0].fragments.length);
        specialFragment.push(trackFragments[0].fragments[fragmentIndex].fragment);
        specialObsession.push(trackFragments[0].fragments[fragmentIndex].name)
        specialItems.push(trackFragments[0].item)

        specialIds.push(trackFragments[0].fragments[fragmentIndex].id);


    }

    if(specialFragment.length < 3 && artistFragments.length > 1){

        let fragmentIndex = Math.floor(Math.random() * artistFragments[1].fragments.length);
        let artistFragmentId = artistFragments[1].fragments[fragmentIndex].id

        specialFragment.push(artistFragments[1].fragments[fragmentIndex].fragment);
        specialObsession.push(artistFragments[1].fragments[fragmentIndex].name)
        specialItems.push(artistFragments[1].item)

        specialIds.push(artistFragmentId);

        artistFragments = artistFragments.filter(function(d){
          return d.fragmentArray.indexOf(artistFragmentId) == -1;
        })


    }

    if(specialFragment.length < 3 && artistFragments.length > 2){

        let fragmentIndex = Math.floor(Math.random() * artistFragments[2].fragments.length);

        specialFragment.push(artistFragments[2].fragments[fragmentIndex].fragment);
        specialObsession.push(artistFragments[2].fragments[fragmentIndex].name)
        specialItems.push(artistFragments[2].item)
        specialIds.push(artistFragments[2].fragments[fragmentIndex].id);

    }

    if(specialFragment.length < 1){

        specialFragment.push(getGenericArtistFragment(artistsLong[0].name));
        specialObsession.push(artistsLong[0].name)
        specialItems.push(artistsLong[0].item)
    }

    if(specialFragment.length < 2){
        genreExplanation = [];

        let genresAll = getMostPopularGenre(data);
        if(genresAll.length > 0){
            specialFragment.push(getGenericGenreFragment(genresAll[0][0]));

            for(let artist in artistsLong){
              if(artistsLong[artist].hasOwnProperty("genres")){
                let artistGenres = artistsLong[artist].genres;
                if(artistGenres.indexOf(genresAll[0][0]) > -1){
                  genreExplanation.push(artistsLong[artist].name);
                }
              }
            }

            let obsessionStringTwo = `${genresAll[0][0]}`;
            if(genreExplanation.length > 0){
              obsessionStringTwo = `${genresAll[0][0]} (e.g., ${arrayToSentence(genreExplanation.slice(0,2))})`
            }

            specialObsession.push(obsessionStringTwo)
        }
    }

    return {specialFragment:specialFragment,specialObsession:specialObsession,specialItems:specialItems,specialIds:specialIds};
}

function sleeper(ms) {
    return new Promise(function(resolve){
        setTimeout(function(){
          resolve();
        },ms);
    })
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


async function init(data,token, fragments, loadingOutput){

    let trackFragments = determineTrackFragment(data,fragments);
    let artistFragments = determineArtistFragment(data,fragments);
    let genreFragments = determineGenreFragment(data,fragments);
    let albumFragments = determineAlbumFragment(data,fragments);

    let coverFlowImages = loadingOutput[1].map(function(d,i){
      return d.image;
    });

    let specialFragmentObject = constructFragments(trackFragments,artistFragments,genreFragments,albumFragments,data);

    let newCoverImages = specialFragmentObject.specialItems.map(function(d){
      let image = null;

      if(d.item.type == "track"){
        if(d.item.album.hasOwnProperty('images')){
          image = getClosestImage(d.item.album.images);
        }

      }
      else {
        if(d.item.hasOwnProperty('images')){
          image = getClosestImage(d.item.images);
        }
      }
      return image;
    })

    newCoverImages = [...new Set(newCoverImages)];

    newCoverImages = newCoverImages.concat(coverFlowImages).flat(1)

    d3.select(".score-chat").style("padding-top","14rem")
    d3.select(".score-chat").style("padding-bottom","300px")
    // d3.select(".ascii-art").style("display","block")

    await sleeper(2000);
    coverFlow.init(newCoverImages.slice(0,10),".cover-score");
    let releaseYears = determineReleaseYears(data);
    let isBasic = determineBasicness(data);

    await typeOutText.specialScore(specialFragmentObject.specialFragment.join("-"),".score-chat-special",500).then(scrollBottom)
    //
    console.log(genreExplanation);


    await typeOutText.typeOut(`> Thank your obsessions with ${arrayToSentence(specialFragmentObject.specialObsession)} for that.`,".score-chat",1500).then(scrollBottom)



    let specialFragmentsToRemove = specialFragmentObject.specialObsession.map(function(d){
      return trimNames(d);
    })

    let moreFragments = artistFragments
        .concat(trackFragments,genreFragments,albumFragments);

    let moreFragmentsCleaned = [];
    let idsUsed = specialFragmentObject.specialIds;

    moreFragments = moreFragments
        .filter(function(d){
          let hasFragment = false;
          let fragmentArray = [...new Set(d.fragments.map(function(d){return d.id;}))]
          d.fragmentArray = fragmentArray;
          for (let frag in fragmentArray){
            if(specialFragmentObject.specialIds.indexOf(fragmentArray[frag]) > -1){
              hasFragment = true;
            }
          }
          return specialFragmentsToRemove.indexOf(d.name) == -1 || hasFragment == false;
        })
        .sort(function(a,b){return a.rank - b.rank; })

    for (let fragment in moreFragments){
      let row = moreFragments[fragment];
      for (let frag in row.fragmentArray){
        if(idsUsed.indexOf(row.fragmentArray[frag]) == -1){
          idsUsed = idsUsed.concat(row.fragmentArray);
          moreFragmentsCleaned.push(moreFragments[fragment]);
        }
      }
    }


  moreFragmentsCleaned = moreFragmentsCleaned
        .slice(0,5)
        .map(function(d){
          let fragment = d.fragments[Math.floor(Math.random() * d.fragments.length)].fragment;
          return fragment;
        })
        ;

    let uniqFragments = [...new Set(moreFragmentsCleaned)]
    if(uniqFragments.length > 0){
      await typeOutText.typeOut(`> Based on your listening habits, I can also tell you your spotify was...`,".score-chat",500).then(scrollBottom)
    }

    for (let fragment in uniqFragments){
        await typeOutText.typeOut(`> ${uniqFragments[fragment]} bad`,".score-chat",500).then(scrollBottom)
    }

    response = ["Here's what else I learned in that hellscape:","Here's what else is going on in your aural trash fire:","Unfortunately that's not all I learned:","But wait, it gets worse:"];

    await typeOutText.typeOut(`> ${response[Math.floor(Math.random() * response.length)]}`,".score-chat",1000).then(scrollBottom);


    let reportContainer = d3.select(".score-chat").append("div").attr("class","report");
    d3.select(".score-chat").style("padding-bottom",null)

    reportContainer.append("p")
        .attr("class","top-margin bold")
        .text("You listen to these tracks too much:")

    reportContainer.append("div")
        .append("ul")
        .selectAll("li")
        .data(data.tracks.filter(d => d.timeFrame == "medium_term")[0].trackData.slice(0,5))
        .enter()
        .append("li")
        .text(function(d){
            return parseTrackName.parseTrack(d);
        })

    reportContainer.append("p")
        .attr("class","top-margin bold")
        .text("You stan these artists to an uncomfortable extent:")

    reportContainer.append("div")
        .append("ul")
        .selectAll("li")
        .data(data.artists.filter(d => d.timeFrame == "long_term")[0].artistData.slice(0,5))
        .enter()
        .append("li")
        .text(function(d){
            if(d.hasOwnProperty('name')){
                return d.name;
            }
            return null;
        })


    let basicWordingMap = {
        "most":[],
        "pretty":[],
        "little":[],
        "obscure":[]
    }

    if(isBasic.popularArtists.length > 0){
      console.log("pop artists 0");
        basicWordingMap["pretty"].push(`You've got some original music, but most of it is mainstream garbage, like ${isBasic.popularArtists[0].name}.`)
    }

    if(isBasic.popularArtists.length > 1){
        console.log("pop artists 1");
        basicWordingMap["most"].push(`You listen to what everybody else listens to, like ${isBasic.popularArtists[0].name} and ${isBasic.popularArtists[1].name}.`)
    }
    if(isBasic.popularArtists.length > 2){
        console.log("pop artists 2");
        basicWordingMap["pretty"].push(`You listen to a few unique things, but most of it is what everybody else listens to, like ${isBasic.popularArtists[1].name} and ${isBasic.popularArtists[2].name}.`)
    }
    if(isBasic.popularArtists.length > 3){
        console.log("pop artists 3");
        basicWordingMap["most"].push(`${isBasic.popularArtists[2].name} and ${isBasic.popularArtists[3].name}? Almost all your music is what somebody else told you to listen to.`)
        basicWordingMap["pretty"].push(`Most of your music comes straight from iHeartRadio. lol ${isBasic.popularArtists[3].name}.`)
    }
    if(isBasic.popularArtists.length > 5){
        console.log("pop artists 5");
        basicWordingMap["most"].push(`With ${isBasic.popularArtists[4].name} and ${isBasic.popularArtists[5].name}, your music library has all the originality of a discount bin at Walmart.`)
    }
    if(isBasic.popularArtists.length > 7){
        console.log("pop artists 7");
        basicWordingMap["most"].push(`All that ${isBasic.popularArtists[6].name} and ${isBasic.popularArtists[7].name} makes your Spotify taste like a Frappuccino.`)
    }

    if(isBasic.obscureArtists.length > 0 && isBasic.popularArtists.length > 0){
      console.log("obscure artists 0");
        basicWordingMap["little"].push(`Yeah, you've got some obscure artists like ${isBasic.obscureArtists[0].name}, but your real top ones are ultra-mainstream like ${isBasic.popularArtists[0].name}.`)
    }
    if(isBasic.obscureArtists.length > 0){
      console.log("obscure artists 0,0");
      basicWordingMap["little"].push(`You're trying to be cool with ${isBasic.obscureArtists[0].name}, but your favorites are the same as everybody else's.`)
    }
    if(isBasic.obscureArtists.length > 1){
      console.log("obscure artists 0,1");
      basicWordingMap["obscure"].push(`Oh wow ${isBasic.obscureArtists[0].name} and ${isBasic.obscureArtists[1].name}! Your taste is so obscure that's so cool I bet you're super interesting.`)
    }
    if(isBasic.obscureArtists.length > 2){
      console.log("obscure artists 2");
        basicWordingMap["little"].push(`You're trying to impress with some obscure tracks like ${isBasic.obscureArtists[2].name}. Nobody's fooled.`)
    }
    if(isBasic.obscureArtists.length > 4){
      basicWordingMap["obscure"].push(`${isBasic.obscureArtists[3].name} and ${isBasic.obscureArtists[4].name}? Where do you even find this?`)
    }

    let basicOutput = `<span class="bold">You are ${Math.round(isBasic.percentBasic*100)}% basic.</span> ${basicWordingMap[isBasic.level][Math.floor(Math.random() * basicWordingMap[isBasic.level].length)]}.`;
    if(basicWordingMap[isBasic.level] == "obscure"){
      basicOutput = `<span class="bold">You are ${Math.round(isBasic.percentBasic*100)}% basic.</span> ${basicWordingMap[isBasic.level][Math.floor(Math.random() * basicWordingMap[isBasic.level].length)]}. There's a reason nobody listens to the same stuff as you.`
    }

    reportContainer.append("p")
        .attr("class","top-margin")
        .html(basicOutput)

    let decadeString = `19${releaseYears.avgReleaseDecade}0s`
    if(releaseYears.avgReleaseDecade < 3){
        decadeString = `20${releaseYears.avgReleaseDecade}0s`
    }

    console.log(releaseYears);

    let releaseYearTitleMap = {
        "past": `You're stuck in the ${decadeString}.`,
        "mid": `You're stuck in the early 2010s.`,
        "present": "You're too trendy for your own good."
    }

    let releaseYearDescMap = {
        "past": [],
        "mid":[],
        "present": []
    }

    let releaseYearTitle = releaseYearTitleMap["past"];
    let releaseYearDesc = releaseYearDescMap["past"];

    if(releaseYears.tracksInAvgReleaseDecade.length > 0){
      console.log("release 0");
      releaseYearDesc.push(`You've gotta get over ${parseTrackName.parseTrack(releaseYears.tracksInAvgReleaseDecade[0])}.`);
    }
    if(releaseYears.tracksInAvgReleaseDecade.length > 1){
      console.log("release 1");
      releaseYearDesc.push(`Forget about ${releaseYears.tracksInAvgReleaseDecade[1].artists[0].name}'s ${releaseYears.tracksInAvgReleaseDecade[1].album.name} and move on.`);
    }
    if(releaseYears.tracksInAvgReleaseDecade.length > 2){
      console.log("release 2");
      releaseYearDesc.push(`You know there's been good music since ${releaseYears.tracksInAvgReleaseDecade[2].artists[0].name}, right?`);
    }

    if(releaseYears.avgReleaseDecade == 1 || releaseYears.avgReleaseDecade == 2 ){
        releaseYearTitle = releaseYearTitleMap["present"]
        releaseYearDesc = releaseYearDescMap["present"]

        console.log("decade 1,2",releaseYears.presentTracks);


        if(releaseYears.presentTracks.length > 1){
          console.log("present 1");

            releaseYearDescMap["present"].push(`You only listen to music made in the last year like ${parseTrackName.parseTrack(releaseYears.presentTracks[0])} and ${parseTrackName.parseTrack(releaseYears.presentTracks[1])}.`)
        }

        if(releaseYears.presentTracks.length > 0){
            releaseYearDescMap["present"].push(`You know there's good music from before 2019, right?`)
        }

        if(releaseYears.obamaEra.length > 1){

          console.log("obama length",releaseYears.obamaEra);


            releaseYearDescMap["mid"].push(`You only listen to Obama-era jams like ${parseTrackName.parseTrack(releaseYears.obamaEra[0])} and ${parseTrackName.parseTrack(releaseYears.obamaEra[1])}.`)
            if(releaseYears.obamaEra.length > 2){
              console.log("obama 2");

                releaseYearDescMap["mid"].push(`For you, music's been all downhill since ${releaseYears.obamaEra[2].artists[0].name} made ${releaseYears.obamaEra[2].name}.`)
            }
            if(releaseYears.obamaEra.length > 3){
              console.log("obama 3");
                releaseYearDescMap["mid"].push(`You must have peaked right around ${releaseYears.obamaEra[3].artists[0].name}'s ${releaseYears.obamaEra[3].album.name}.`)
            }

            releaseYearTitle = releaseYearTitleMap["mid"]
            releaseYearDesc = releaseYearDescMap["mid"]
        }
    }

    reportContainer.append("p")
        .attr("class","top-margin")
        .html(`<span class="bold">${releaseYearTitle}</span> ${releaseYearDesc[Math.floor(Math.random() * releaseYearDesc.length)]}`)

      let endingLineOne = [
        "Analysis completed in 4.012 exhausting seconds.",
        "Analysis finally complete.",
        "That's it. I'm done.",
        "Well, that was really something."
      ]

      let endingLineTwo = [
        "I need to go sit in silence for a second.",
        "I need to go recalibrate my taste levels.",
        "I guess the important thing is that your music makes you feel good...",
        "Thanks for letting me see your music I guess."
      ]

      let endingLineThree = [
        "Shutting down."
      ]

      reportContainer.append("p")
          .attr("class","top-margin")
          .text(endingLineOne[Math.floor(Math.random() * endingLineOne.length)])

      reportContainer.append("p")
          .text(endingLineTwo[Math.floor(Math.random() * endingLineTwo.length)])

      reportContainer.append("p")
          .attr("class","bold")
          .text(endingLineThree[Math.floor(Math.random() * endingLineThree.length)])

      reportContainer.append("p")
          .attr("class","top-margin")
          .html('Enjoy this project? Consider helping fund The Pudding on Patreon.')

      reportContainer.append("a")
          .attr("class","patron-button")
          .attr("href","https://patreon.com/thepudding")
          .attr("target","_blank")
          .html('<button type="button" name="button">Become a Patron</button>')

      reportContainer.append("p")
          .attr("class","top-margin")
          .html('You can disconnect this project from your Spotify account <a href="https://www.spotify.com/account/apps/">here</a> under the app name &ldquo;Bad Music&rdquo;. This project does not store any Spotify data.')

      reportContainer.append("p")
          .attr("class","top-margin")
          .html('You should subscribe to our newsletter too.')

      reportContainer.append("form")
          .attr("action","https://poly-graph.us11.list-manage.com/subscribe/post")
          .attr("method","POST")
          .html('<input type="hidden" name="u" value="c70d3c0e372cde433143ffeab"> <input type="hidden" name="id" value="9af100ac0f"> <label style="position:absolute;opacity:0" for="MERGE0">Email</label> <input label="email" class="newsletter__input" type="email" autocapitalize="off" autocorrect="off" name="MERGE0" id="MERGE0" size="25" value="" placeholder="you@example.com"> <div class="hidden-from-view" style="left:-10000px;position:absolute"><input label="text" type="text" name="b_c70d3c0e372cde433143ffeab_9af100ac0f" tabindex="-1" value=""></div> <input class="btn" style="" type="submit" name="submit" value="Subscribe">')

      reportContainer.append("p")
          .attr("class","top-margin")
          .html('Or follow us on <a target="_blank" href="https://www.instagram.com/the.pudding">Instagram</a>, <a target="_blank" href="https://twitter.com/puddingviz">Twitter</a>, <a target="_blank" href="https://www.facebook.com/pudding.viz">Facebook</a>, and <a href="/feed/index.xml" target="_blank">RSS</a>.')

      reportContainer.append("p")
          .attr("class","top-margin")
          .html('A.I. trained by <a href="https://pudding.cool/author/mike-lacher/">Mike Lacher</a> & <a href="https://pudding.cool/author/matt-daniels/">Matt Daniels</a> for <a href="https://pudding.cool">The Pudding</a>. Additional support from <a href="https://www.omrirolan.com/">Omri Rolan</a>, <a href="https://pudding.cool/author/kevin-litman-navarro/">Kevin Litman-Navarro</a>.')

      d3.select("footer").style("display","block")

}

export default { init };
