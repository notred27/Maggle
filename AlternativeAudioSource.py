import pygame
import requests


class AudioStreamer:

    def __init__(self):
        self.preview_url = None

    def play_preview(self):
        if self.preview_url:
            # Initialize pygame mixer
            pygame.mixer.init()

            # Stream audio from URL
            response = requests.get(self.preview_url, stream=True)
            audio_data = response.content

            # Save audio data temporarily
            with open("temp_audio.mp3", "wb") as temp_file:
                temp_file.write(audio_data)

            # Load and play audio
            pygame.mixer.music.load("temp_audio.mp3")
            pygame.mixer.music.play()

            # Keep the script running while the audio plays
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
        else:
            print("Preview URL is not available.")



    def get_preview(self, song_title, artist_name):
        # Deezer search endpoint
        url = "https://api.deezer.com/search"
        
        # Combine song title and artist name for the query
        query = f"{song_title} {artist_name}"
        params = {"q": query}
        
        # Make the GET request
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            # Parse the JSON response
            data = response.json()
            tracks = data.get("data", [])
            
            if tracks:
                # Get the top result
                top_track = tracks[0]
                title = top_track['title']
                artist = top_track['artist']['name']
                album = top_track['album']['title']
                self.preview_url = top_track.get('preview', None)
                
                if self.preview_url:
                    print(f"Title: {title}")
                    print(f"Artist: {artist}")
                    print(f"Album: {album}")
                    print(f"Preview URL: {self.preview_url}")
                    return self.preview_url
                else:
                    print("No preview available for this track.")
            else:
                print("No tracks found for the query.")
        else:
            print(f"Failed to search Deezer API. Status code: {response.status_code}")

# Example usage
song_title = "Sleepyhead"
artist_name = "Passion Pit"

audioSrc = AudioStreamer()

preview_url = audioSrc.get_preview(song_title, artist_name)

# Optional: Play the preview using a library like `pygame` or `vlc`
if preview_url:
    audioSrc.play_preview()

