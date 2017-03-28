const fs = require('fs');
const PlayMusic = require('playmusic');
const util = require('util');

let createPlaylistWithTracks = function(playlistName, songList) {
    let pm = new PlayMusic();
    let config = JSON.parse(fs.readFileSync("config.json")).gmusic;

    pm.login({email: config.email, password: config.password}, function(err, resp) {
        if (err) {
            return console.error(err);
        }
    });



    pm.init(config, function(err) {
        if(err) return console.log("error", err);

        function searchSong(search) {
            return new Promise((resolve, reject) => {
                pm.search(search, 10, function(err, data) {
                    if(err) {
                        reject(err);
                        return;
                    }

                    if (!data.hasOwnProperty('entries')) {
                        reject('Song "' + search + '" not found on Google Play Music');
                        return;
                    }

                    let entries = data.entries;

                    entries = entries.filter((element, index, array) => {
                       if (element.type !== '1') {
                           return false;
                       }

                       return true;
                    });

                    let song = entries.sort(function(a, b) {
                        return a.score < b.score;
                    }).shift();

                    resolve(song);
                });
            });
        }

        pm.addPlayList(playlistName, function(err, response) {
            if (err) {
                console.log(err);
            }

            let playlistId = response.mutate_response[0].id;

            songList.forEach(songData => {
                searchSong(`${songData.artist} - ${songData.album} - ${songData.title}`).then(song => {
                    pm.addTrackToPlayList([song.track.storeId], playlistId, function(err, resp) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log(`[Success] Imported "${songData.artist} - ${songData.album} - ${songData.title}"`);
                    });
                }).catch(e => console.log('[Error] ' + e));
            });
        });
    });
};

module.exports = createPlaylistWithTracks;