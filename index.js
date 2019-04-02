const express = require('express');
let app = express();
const ClientOAuth2 = require('client-oauth2');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SpotifyWebApi = require('spotify-web-api-node');
const gmusicImporter = require('./gmusic-importer');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync("config.json"));

app.use(cookieParser());
app.use(session({secret: '1234567890QWERTY'}));

let spotifyAuth = new ClientOAuth2({
    clientId: config.spotify.oauth.clientId,
    clientSecret: config.spotify.oauth.clientSecret,
    accessTokenUri: 'https://accounts.spotify.com/api/token',
    authorizationUri: 'https://accounts.spotify.com/authorize',
    redirectUri: 'http://localhost:3000/auth/spotify/callback',
    scopes: ['playlist-read-private', 'playlist-read-collaborative']
});

app.get('/auth/spotify', function (req, res) {
    let uri = spotifyAuth.code.getUri();

    res.redirect(uri)
});

app.get('/auth/spotify/callback', function (req, res) {
    spotifyAuth.code.getToken(req.originalUrl)
        .then(function (user) {
            // Refresh the current users access token.
            // user.refresh().then(function (updatedUser) {
            //     console.log(updatedUser !== user) //=> true
            //     console.log(updatedUser.accessToken)
            // });

            // // Sign API requests on behalf of the current user.
            // user.sign({
            //     method: 'get',
            //     url: 'http://example.com'
            // });

            req.session.spotifyAccessToken = user.accessToken;
            res.redirect('/');
        });
});

app.get('/', async function (req, res) {
    let api = new SpotifyWebApi();

    api.setAccessToken(req.session.spotifyAccessToken);

    let getAllPlaylistTracks = async (start = 0) => {
        let response = await api.getPlaylistTracks(config.spotify.userId, config.spotify.playlistId, { limit: 100, offset: start });

        let songList = [];

        response.body.items.forEach(({track}) => {
            let album = track.album.name;
            let artist = track.artists.map(artist => artist.name).join(', ');
            let title = track.name;

            songList.push({artist, album, title})
        });

        if (response.body.total > (start + 100)) {
            let additionalSongs = await getAllPlaylistTracks(start+100);
            songList = songList.concat(additionalSongs);
            return songList;
        } else {
            return songList;
        }
    }

    let songList = await getAllPlaylistTracks();

    console.log('Exported Spotify playlist. Starting Google Play Music import');
    gmusicImporter(config.gmusic.targetPlaylistName, songList);


    res.send('Imported! Check console output for errors!');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    console.log('Make sure you have entered all values in the config.json file correct!');
    console.log('Open http://localhost:3000/auth/spotify in your browser and the import will start.');
});