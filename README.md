# Maggle 

This is an application based on the popular game Heardle. Instead of random daily songs, this app uses your favorite songs that you've added to your Spotify playlists.
Play alone, or with friends, to see who has the most musical knowledge about yourself!

## Features
This project was coded using Python, as well as the Tkinter and Pygame libraries. Spotify's Web API was also used in order to get information about user's playlists. 

## Important
To run this project, you need to create a .env file with the fields:

* target_username = YOUR_SPOTIFY_USERNAME
* client_id = YOUR_SPOTIFY_WEB_API_ID
* client_secret = YOUR_SPOTIFY_WEB_API_SECRET

Steps to get started with Spotify's Web API can be found [here](https://developer.spotify.com/documentation/web-api/tutorials/getting-started).

Additionally, the file Maggle_build.py can be compiled into a onefile executable using Pyinstaller. This can be achieved by the command found in the file _"pyinstaller"_.

