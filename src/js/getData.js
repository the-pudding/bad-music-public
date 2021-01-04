import parseTrackName from "./parseTrackName";
import typeOutText from './typeOutText'
import urlParameter from './utils/url-parameter'
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

let maxLoops = 6;
let genres = [];
let tracks = [];
let artists = [];
let globalToken = null;

let timeFrameTranslate = {
  "long_term":"all time",
  "medium_term":"last 6 months",
  "short_term":"last 4 weeks",
}



function resize() {}

function appendData(data,sectionName,timeFrame){

  let topArtists = data.body.items;

  let wrapper = d3.select(sectionName)
    .append("div")
    .style("order",function(d){
      return Object.keys(timeFrameTranslate).indexOf(timeFrame);
    })
    ;

  wrapper
    .append("p")
    .attr("class","column-label")
    .text(timeFrameTranslate[timeFrame])

  wrapper
    .append("div")
    .selectAll("div")
    .data(topArtists)
    .enter()
    .append("p")
    .html(function(d){
      if(sectionName == ".tracks"){
        return d.name + "<span>" + d.artists[0].name + "</span>";
      }
      return d.name;
    })
}



function getTracks(timeFrame,sectionName){

  return spotifyApi.getMyTopTracks(
    {
      time_range:timeFrame,
      limit:50
    }
  )
  .then(function(data) {
    let trackDataReceived = data.body.items;

    tracks.push({timeFrame:timeFrame,trackData:trackDataReceived})
    appendData(data,sectionName,timeFrame)
    return data;
  })
  .catch(function(err){
    throw err;
  })
  ;
}

function getArtists(timeFrame,sectionName){


  return spotifyApi.getMyTopArtists(
    {
      time_range:timeFrame,
      limit:50
    }
  ).then(function(data) {
    let artistDataReceived = data.body.items;
    artists.push({timeFrame:timeFrame,artistData:artistDataReceived});
    genres = genres.concat(data.body.items.map(function(d){
      return d.genres
    }))
    // .then(function(d){
    //   genres = genres.concat(d);
    //   return genres
    // })
    appendData(data,sectionName,timeFrame)
    return "done"//data.body.items.map(function(d){ return d.genres});
  })
  .catch(function(err){
    throw err
  })
}

function getTopArtistFromTracks(tracksFromTop){

  tracksFromTop = tracksFromTop.map(function(d){
    return d.artists;
  }).flat(1)

  tracksFromTop = d3.groups(tracksFromTop,( d => d.name )).sort(function(a,b){return b[1].length - a[1].length });

  return tracksFromTop;
}

function appendSavedItems(savedItems,wrapperClass){

  let wrapper = d3.select(wrapperClass)
    .append("div")
    ;

  wrapper
    .append("div")
    .selectAll("div")
    .data(savedItems)
    .enter()
    .append("p")
    .html(function(d){
      return d;
    })
}

function parseGenres(){

  return new Promise(function (resolve, reject) {
    let nested = d3.groups(genres.flat(1),function(d){return d;}).sort(function(a,b){
      return b[1].length - a[1].length;
    });

    resolve(nested);
  })
}

function appendGenres(genres){

  let wrapper = d3.select(".genres")
    .append("div")
    ;

  wrapper
    .append("div")
    .selectAll("div")
    .data(genres.slice(0,10))
    .enter()
    .append("p")
    .text(function(d){
      return d[0];
    })


  return Promise.resolve();

}

function appendFollowedArtists(artists){

  let wrapper = d3.select(".followed-artists")
    .append("div")
    ;

  wrapper
    .append("div")
    .selectAll("div")
    .data(artists)
    .enter()
    .append("p")
    .text( d => d)


  return Promise.resolve();

}

function thing(data){
}

function calculateTrackPopularity(tracksFlat){
  let trackPopularity = d3.mean(tracksFlat.map(function(d){
    return d.popularity;
  }), d => d);
}

async function pullTracks(){
  return getTracks("long_term",".tracks")
    .then(function(data){
      return getTracks("medium_term",".tracks");
    })
    //### removed ###
    // .then(function(data){
    //   return getTracks("short_term",".tracks")
    // })
    .then(function(data){
      return tracks.flat(1);
    })
}

function getArtistsAlbums(artistId){
  return spotifyApi.getArtistAlbums(artistId).then(
    function(data) {
      return data;
      // console.log('Artist albums', data.body);
    },
    function(err) {
      console.log(err);
    }
  );

}

async function pullArtists(){

  return getArtists("long_term",".artists")
    .then(function(){
      return sleeper(1000)
    })
    .then(function(){
        return getArtists("medium_term",".artists")
    })
    // .then(function(){
    //   return getArtists("short_term",".artists");
    // })
    .then(function(){
      return parseGenres();
    })
    // .then(appendGenres)
    .then(function(parsedGenres){
      return [parsedGenres,artists.flat(1)]
    }, function(err) {
      console.log("error");
      console.log(err);
    })
}

async function pullPlaylists(){
  //### changed ###
  return [[],[]];
  return spotifyApi.getUserPlaylists({limit:50})
    .then(function(data){

      let id = data.body.href.replace("https://api.spotify.com/v1/users/","").split("/")[0]

      let playlistsOwned = data.body.items.filter(function(d){
        return d.owner.id == id;
      })

      let playlistsNotOwned = data.body.items.filter(function(d){
        return d.owner.id != id;
      }).filter(function(d){
        d.owner = false;
        return d.tracks.total > 8;
      })

      //filter to only playlists with more than 10
      playlistsOwned = playlistsOwned.filter(function(d){
        d.owned = true;
       if(d.name.replace("-","").match(/running|gym|workout/i)){
//       if(d.name.replace("-","").match(/playlist|gym|workout/i)){
          d["workout"] = 1;
        }
        else {
          d["workout"] = 0
        }
        //if(d.name.match(/Quarantunes|birthday/i)){
       if(d.name.match(/party|birthday/i)){
          d["party"] = 1;
        }
        else {
          d["party"] = 0;
        }

        return d.tracks.total > 8;
      })

      for (var playlist in playlistsNotOwned){
        // if(playlistsNotOwned[playlist].name.replace("-","").match(/playlist|gym|workout/i)){
        if(playlistsNotOwned[playlist].name.replace("-","").match(/running|gym|workout/i)){
          playlistsNotOwned[playlist]["workout"] = 1;
          playlistsOwned.push(playlistsNotOwned[playlist]);
        }
        else {
          playlistsNotOwned[playlist]["workout"] = 0;
        }
      }

      return playlistsOwned;

    })
    // .then(function(playlists){
    //   appendSavedItems(playlists[1],".user-playlists");
    // })
    .then(function(playlistOutput){

      return Promise.all(playlistOutput.map(function (row, i) {
          return spotifyApi.getPlaylistTracks(row.id).then(function(data) {
            return data.body.items;
          }, function(err) {
            console.log('Something went wrong!', err);
            return [];
          });
        }))
        .then(function(playlistTracks){

          for (var playlist in playlistOutput){
            playlistOutput[playlist]["trackArray"] = playlistTracks[playlist]
          }
          return playlistOutput
        });

    })
    .then(function(playlistTracks){
      //get recent playlists

      const allPlaylists = playlistTracks;

      playlistTracks = playlistTracks.filter(function(trackList){
        return d3.max(trackList.trackArray,function(d){ return +d.added_at.slice(0,4) }) > 2017;
      })

      for (var playlist in playlistTracks){

        let topPlaylistArtists = [];

        playlistTracks[playlist].trackArray = playlistTracks[playlist].trackArray.map(function(track){

          topPlaylistArtists.push(track.track.artists.map(function(d){return d.name;}));

          return {name:parseTrackName.parseTrack(track.track),track:track.track}
        });

        playlistTracks[playlist].topArtists = d3.groups(topPlaylistArtists.flat(1),function(d){return d;}).sort(function(a,b){
            return b[1].length - a[1].length;
          });

        playlistTracks[playlist].albumArray = d3.groups(playlistTracks[playlist].trackArray.flat(1),function(d){return d.track.album.name;}).sort(function(a,b){
            return b[1].length - a[1].length;
          });

      }

      return [playlistTracks,allPlaylists]
    })
}

async function matchupTrackGenres(trackData,artistLookup){
  // return new Promise(function (resolve, reject) {

  let artistsToLookup = [];

  for(var timeframe in trackData){

    for(var track in trackData[timeframe]["trackData"]){
      trackData[timeframe].trackData[track]["artistGenres"] = [];

      let artistGenres = [];



      for(var artist in trackData[timeframe]["trackData"][track]["artists"]){
        let id = trackData[timeframe]["trackData"][track]["artists"][artist].id
        if(artistLookup.has(id)){
          let genres = artistLookup.get(id)
          artistGenres.push(genres[0].genres)
        }
        else {
          artistsToLookup.push(id);
        }
      }

      trackData[timeframe].trackData[track]["artistGenres"] = artistGenres.flat(1);

    }
  }

  artistsToLookup = d3.groups(artistsToLookup,function(d){return d}).map(function(d){return d[0]});


  var chunkedArtistsToLookup = [], size = 50;
  while (artistsToLookup.length > 0)
    chunkedArtistsToLookup.push(artistsToLookup.splice(0, size));

  let artistGenreInfo = await getArtistsGenres(chunkedArtistsToLookup)
  artistGenreInfo = artistGenreInfo.map(function(d){return d.body.artists}).flat(1);
  let remainingArtistLookup = await d3.group(artistGenreInfo, d => d.id);


  for(var timeframe in trackData){

    for(var track in trackData[timeframe]["trackData"]){
      //trackData[timeframe].trackData[track]["artistGenres"] = [];

      let artistGenres = trackData[timeframe].trackData[track]["artistGenres"];

      for(var artist in trackData[timeframe]["trackData"][track]["artists"]){
        let id = trackData[timeframe]["trackData"][track]["artists"][artist].id
        if(remainingArtistLookup.has(id)){
          let genres = remainingArtistLookup.get(id)
          artistGenres.push(genres[0].genres)
        }
        else {
          artistsToLookup.push(id);
        }
      }

      trackData[timeframe].trackData[track]["artistGenres"] = artistGenres.flat(1);

    }
  }

  return trackData

}


async function getAllData(){
  return Promise.all([pullArtists,pullTracks(),pullPlaylists()]).then(values => {
      return values;
  })
  .catch(function(err) {
    console.log("failed");
    console.log(err.message); // some coding error in handling happened
  })
  ;

}

function sleeper(ms) {
      return new Promise(function(resolve){
          setTimeout(function(){
            resolve();
          },ms);
      })
}


function pullArtistsLoop(term){
  return new Promise(function(resolve){

    let count = 0;
    let delay = 5000;

    function loop(){

      console.log("looping");

      getArtists(term,".artists")
        .then(function(d){
          resolve(d)
        })
        .catch(function(err){
          if(err.status == 429){
            let retryDelay = +err.header["retry-after"]
            delay = delay + Math.max(delay,retryDelay*1000);
          }
          else {
            delay = delay*2;
          }


          typeOutText.typeOut(`I'll try again in ${delay/1000} seconds`,".chat-wrapper",500)
          window.setTimeout(function(){
            count = count + 1;
            if(count < maxLoops){
              loop();
            }
          },delay)
        })
    }

    loop();

  })
}

function pullTracksLoop(term){

  return new Promise(function(resolve){

    let count = 0;
    let delay = 5000;

    function loop(){

      getTracks(term,".tracks").then(function(d){
        resolve(d)
      })
      .catch(function(err){

        if(err.status == 429){
          let retryDelay = +err.header["retry-after"]
          delay = delay + Math.max(delay,retryDelay*1000);
        }
        else {
          delay = delay*2;
        }

        typeOutText.typeOut(`I'll try again in ${delay/1000} seconds`,".chat-wrapper",500)
        window.setTimeout(function(){
          count = count + 1;
          if(count < maxLoops){
            loop();
          }
        },delay*1000)
      })
    }

    loop();

  })

}

function getArtistsGenres(artistsToLookup){
    return spotifyApi.getArtists(artistsToLookup)
      .then(function(d){
        return d;
      })
      .catch(function(err){
        throw err;
      })
      ;
}

function getArtistsGenresLoop(artistsToLookup){

  let count = 0;
  let delay = 5000;

  return new Promise(function(resolve){

    function loop(){

      getArtistsGenres(artistsToLookup).then(function(d){
        resolve(d)
      })
      .catch(function(err){

        if(err.status == 429){
          let retryDelay = +err.header["retry-after"]
          delay = delay + Math.max(delay,retryDelay*1000);
        }
        else {
          delay = delay*2;
        }

        typeOutText.typeOut(`I'll try again in ${delay/1000} seconds`,".chat-wrapper",500)
        window.setTimeout(function(){
          count = count + 1;
          if(count < maxLoops){
            loop();
          }

        },delay*1000)
      })
    }

    loop();

  })

}

async function matchupTrackGenresLoop(trackData,artistLookup){

  let artistsToLookup = [];

  for(var timeframe in trackData){

    for(var track in trackData[timeframe]["trackData"]){
      trackData[timeframe].trackData[track]["artistGenres"] = [];

      let artistGenres = [];



      for(var artist in trackData[timeframe]["trackData"][track]["artists"]){
        let id = trackData[timeframe]["trackData"][track]["artists"][artist].id
        if(artistLookup.has(id)){
          let genres = artistLookup.get(id)
          artistGenres.push(genres[0].genres)
        }
        else {
          artistsToLookup.push(id);
        }
      }

      trackData[timeframe].trackData[track]["artistGenres"] = artistGenres.flat(1);

    }
  }

  artistsToLookup = d3.groups(artistsToLookup,function(d){return d}).map(function(d){return d[0]});


  var chunkedArtistsToLookup = [], size = 50;
  while (artistsToLookup.length > 0)
    chunkedArtistsToLookup.push(artistsToLookup.splice(0, size));

  let artistGenreInfo = [];
  if(chunkedArtistsToLookup.length > 0){
    let result = await getArtistsGenresLoop(chunkedArtistsToLookup[0]);
    artistGenreInfo.push(result);
  }
  if(chunkedArtistsToLookup.length > 1){
    let result  = await getArtistsGenresLoop(chunkedArtistsToLookup[1]);
    console.log(result);
    artistGenreInfo.push(result);
  }
  if(chunkedArtistsToLookup.length > 2){
    let result = await getArtistsGenresLoop(chunkedArtistsToLookup[2]);
    console.log(result);
    artistGenreInfo.push(result);
  }

  artistGenreInfo = artistGenreInfo.map(function(d){return d.body.artists}).flat(1);
  let remainingArtistLookup = await d3.group(artistGenreInfo, d => d.id);


  for(var timeframe in trackData){

    for(var track in trackData[timeframe]["trackData"]){
      //trackData[timeframe].trackData[track]["artistGenres"] = [];

      let artistGenres = trackData[timeframe].trackData[track]["artistGenres"];

      for(var artist in trackData[timeframe]["trackData"][track]["artists"]){
        let id = trackData[timeframe]["trackData"][track]["artists"][artist].id
        if(remainingArtistLookup.has(id)){
          let genres = remainingArtistLookup.get(id)
          artistGenres.push(genres[0].genres)
        }
        else {
          artistsToLookup.push(id);
        }
      }

      trackData[timeframe].trackData[track]["artistGenres"] = artistGenres.flat(1);

    }
  }

  return trackData


}

async function init(token) {

  spotifyApi.setAccessToken(token)
  globalToken = token;

  // let listicle = d3.range(50);
  //
  //
    typeOutText.typeOut("Loading your music library...Spotify limiting how many people can use this app at once, so you'll need to wait or try again later.",".chat-wrapper",500)

    urlParameter.set('access_token',null)
    urlParameter.set('refresh_token',null)

  // for (var item in listicle){
    await pullArtistsLoop("long_term");
    await pullArtistsLoop("medium_term");
    let parsedGenres = await parseGenres();
    let artistData = [parsedGenres,artists.flat(1)];

    let trackDataLong = await pullTracksLoop("long_term");
    let trackDataMedium = await pullTracksLoop("medium_term");
    let trackData = tracks.flat(1);
    console.log(trackData);

    let artistLookup = await d3.group(artistData[1].map(function(d){ return d.artistData; }).flat(1), d => d.id);

    trackData = await matchupTrackGenresLoop(trackData,artistLookup);

    let playlistData = [[],[]];

    return {genres:artistData[0], artists:artistData[1], tracks:trackData, playlists:playlistData};

}

export default { init, resize, getArtistsAlbums };
