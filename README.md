# Spotify Playlist to Google Play Music

This is a sync tool which allows to transfer a playlist from Spotify to Google Play Music using NodeJS and inofficial APIs.

## Prerequesites

1. Clone or download this repository
2. Copy the file `config.example.json` to `config.json`
3. Go to [https://developer.spotify.com/my-applications](https://developer.spotify.com/my-applications) and 
   create an application. Copy and paste the client id and client secret into the config.json into `spotify > oauth`
4. In the Spotify app add `http://localhost:3000/auth/spotify/callback` to _Redirect URIs_.
   Don't forget to press save.
5. Insert your google email address into the config.json into `gmusic > email`
6. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   and create a new app password. Copy and paste the app password to the config.json into `gmusic > password` 
7. Enter a name for the new playlist to be created into the config.json into `gmusic > targetPlaylistName`
8. Find out the Spotify playlist id and user. (For example in the URL when using Spotify web).
   Insert this Information into config.json into `spotify > userId` and `spotify > playlistId`.
   The playlist has to be added to your Spotify library


## Run the import

Make sure you have [node.js](https://nodejs.org) installed.

Open a terminal, change to the directory where you have cloned this repository.

Execute `npm install` and then `npm start`. This will open up a webserver on your machine.

Go to your webbrowser and open [http://localhost:3000/auth/spotify](http://localhost:3000/auth/spotify).
The import will now run. In your commandline you should see possible errors and a list of songs which
could not be imported.

Press Ctrl+C to cancel the local webserver. Your playlist should now be available in Google Play Music.