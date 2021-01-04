import loadData from './load-data'


function parseFragments(data,source){
    let fragmentArray = [];


    data.forEach(function(row,i){

        let id = i;

        let artistArray = row["signal"].split(", ");
        for(let artist in artistArray){
            let artistName = artistArray[artist];

            let fragments = row["fragment"].split("\n").filter(function(d){return d!= ""})
            if(fragments.length > 0){
                for (let fragment in fragments){
                    fragmentArray.push({name:artistName,fragment:fragments[fragment],id:`${source}-${id}`});
                }
            }

        }
    })
    return fragmentArray;
}

function init(){

    return loadData(['fragments-artists-7.csv', 'fragments-albums-3.csv','fragments-genres-2.csv','fragments-tracks-2.csv']).then(result => {

        let parsedArtistFragments = parseFragments(result[0],"artist");
        let parsedAlbumFragments = parseFragments(result[1],"album");
        let parsedGenreFragments = parseFragments(result[2],"genre");
        let parsedTrackFragments = parseFragments(result[3],"track");

        return {album:parsedAlbumFragments,artist:parsedArtistFragments, genre:parsedGenreFragments, track:parsedTrackFragments};

	}).catch(console.error);


}


export default { init }
