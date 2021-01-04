

function parseTrack(trackObject){

    let trackName = trackObject.name.split("(feat")[0]

    let artists = trackObject.artists;
    return trackName + " by " + artists[0].name;
}

export default { parseTrack }