import requests
import spotipy
import random
from spotipy.oauth2 import SpotifyClientCredentials
from tkinter import*
from tkinter import ttk
from PIL import ImageTk, Image
from pygame import mixer
from threading import Timer
import json
from dotenv import load_dotenv
import os


# Function to get a random song from the user's library
def getSong(id, secret):
    creds = SpotifyClientCredentials(client_id= id, client_secret=secret)
    spotify = spotipy.Spotify(auth_manager=creds)
    
    songs = []

    playlists = spotify.user_playlists(target_username)
    playlist_index = random.randint(0, playlists['total'] - 1)

    playlist = playlists['items'][playlist_index]

    #playlist_name = playlist['name']
    
    for val in spotify.playlist(playlist['uri'])['tracks']['items']:
        if val['track']['preview_url'] != None and val['track'] != None:
            artist = val['track']['artists'][0]['name']
            songs.append([val['track']['name'], artist , val['track']['preview_url'], val['track']['album']['images'][1]['url']])

    song_index = random.randint(0, len(songs) - 1)
    
    return songs[song_index]


# Function to create json object that stores song titles from a user (updates lst)
def getSongTitles(id, secret):
    global lst
    creds = SpotifyClientCredentials(client_id= id, client_secret=secret)
    spotify = spotipy.Spotify(auth_manager=creds)

    playlists = spotify.user_playlists(target_username)

    title_list = []
    while playlists:
        for i, playlist in enumerate(playlists['items']):
            
            for val in spotify.playlist(playlist['uri'])['tracks']['items']:
       
                if val !=None and val['track'] != None: 
                    try:
                        artist = val['track']['artists'][0]['name']

                    except: 
                        artist = "N/A"

                    title_list.append(str(val['track']['name']) + " - " + artist)    

        if playlists['next']:
            playlists = spotify.next(playlists)
        else:
            playlists = None 

    # Write to json datafile
    out = open("datafile.json", "w")
    json_out_data = json.dumps([target_username, title_list])
    out.write(json_out_data)
    out.close()

    input = open("datafile.json", "r")
    lst.clear()
    name, lst = json.loads(input.read())
    input.close()
    





#============================================ Game Logic Functions ============================================#




# Increase the ammount of time the song plays and update the text
def add_time(inc = ""):
    global num_seconds, info, game_over, current_streak

    if not game_over:
        if(inc != "Incorrect!\n"):
            guessLabels[num_seconds]['fg'] = 'white'
            guessLabels[num_seconds]['text'] = "Skipped"
            guess_canvas.create_rectangle(30 * num_seconds,0,30 * num_seconds + 24,8, fill = "gray")

        if num_seconds < 4:
            
            num_seconds += 1
            info["text"] = "Current Time to Guess: " + str(round_times[num_seconds]) + " Seconds"
        else:
            num_seconds += 1
            current_streak = 0
            curr_lbl["text"] = "Current Streak: 0"
            save_streak()
            info["text"] = "Too bad :(     The answer was\n" + (str(song[0]) + " - " + str(song[1]))
            game_over = True
            reveal_state()

    



# Function that checks if a guess is correct or not
def check_answer(val):
    global game_over, num_seconds, current_streak, best_streak

    
    test = (str(song[0]) + " - " + str(song[1]))

    guessLabels[num_seconds]['text'] = val

    
    if test == val:
        reveal_state()
        guessLabels[num_seconds]['fg'] = 'green'
        guess_canvas.create_rectangle(30 * num_seconds,0,30 * num_seconds + 24,8, fill = "green")
        info["text"] = "Correct! You got it in " + str(round_times[num_seconds]) + " seconds!"
        game_over = True
        num_seconds = 5
        current_streak += 1
        curr_lbl["text"] = ("Current Streak: " + str(current_streak))
        save_streak()

        if current_streak > best_streak:
            best_streak = current_streak
            best_lbl["text"] = ("Best Streak: " + str(best_streak))
            save_streak()

    else:
        guessLabels[num_seconds]['fg'] = 'red'
        guess_canvas.create_rectangle(30 * num_seconds,0,30 * num_seconds + 24,8, fill = "red")
        add_time(inc = "Incorrect!\n")




def reset_game():
    global song, lst, num_seconds, game_over,current_streak, playing, cover_lbl

    stop_music()
    playing = False

    song = getSong(client_ID, client_S)
    get_img(song[3])
    get_sound(song[2])

    newImg = ImageTk.PhotoImage(Image.open("cover.jpg").resize((150,150)))
    cover_lbl.configure(image=newImg)
    cover_lbl.image = newImg

    if (str(song[0]) + " - " + str(song[1])) not in lst:
        lst.append(str(song[0]) + " - " + str(song[1]))

    lst = [*set(lst)]

    if not game_over:
        current_streak = 0
        curr_lbl["text"] = "Current Streak: 0"
        save_streak()
    else:
        guessing_state()

    num_seconds = 0
    info["text"] = "Current Time to Guess: 1 Second"
    game_over = False
    for label in guessLabels:
        label['text'] = ""
 
#============================================ Tkinter Functions ============================================#

# Play a portion of the song 
x = []  # Using this list is a janky way to cancel all prev timers, fix when you can                             TODO
def play_music():
    global music_playing, x
    if not music_playing:
        mixer.music.load('mystery.mp3') #Loading Music File
        mixer.music.set_volume(0.3)
        mixer.music.play() #Playing Music with Pygame

        timer = Timer(round_times[num_seconds], stop_music)

        for t in x:
            t.cancel()
            x.remove(t)

        x.append(timer)
        timer.start()
        music_playing = True
    else:     
        stop_music()
        music_playing = False
        

def stop_music():
    global music_playing
    mixer.music.stop()
    mixer.music.unload()
    music_playing = False

# Code to find results in the drop down menu
def manage_combobox(event):
    value = event.widget.get()

    if value == '':
        combo_box['values'] = lst

    else:
        data = []
        for item in lst:
            if value.lower() in item.lower():
                data.append(item)
        data.sort()
        combo_box['values'] = data


def submit_answer():
    value = combo_box.get()
    if value in combo_box['values'] and not game_over:
        check_answer(value)
        combo_box.set("")

# Scrape the mp3 file from Spotify's API
def get_sound(url):
    r = requests.get(url)
    with open('mystery.mp3', 'wb') as f:
        f.write(r.content)
        f.close()

# Scrape the cover jpg from Spotify's API
def get_img(url):
    r = requests.get(url)
    with open('cover.jpg', 'wb') as f:
        f.write(r.content)
        f.close()

# Save the current streak to the json file
def save_streak():
    out = open("streak.json", "w")
    json_out_data = json.dumps([best_streak, current_streak])
    out.write(json_out_data)
    out.close()

# Change tkinter widgets to show the end state of the game
def reveal_state():
    guess_frame.forget()
    play_btn.forget()
    info.forget()
    combo_box.forget()
    btns_frame.forget()

    cover_lbl.pack()
    info.pack(pady = 8)
    guess_canvas.pack()
    play_btn.pack()
    reset_button2.pack(pady=8)
   
# Change tkinter widgets to show the guessing state of the game
def guessing_state():
    cover_lbl.forget()
    play_btn.forget()
    info.forget()
    guess_canvas.forget()
    reset_button2.forget()
    for i in range(0,5):
        guess_canvas.create_rectangle(30 * i,0,30 * i + 24,8, fill = "white")
    
    guess_frame.pack()
    info.pack(pady=5)
    play_btn.pack()
    combo_box.pack(pady = 8)
    btns_frame.pack()

def on_closing():
    stop_music()
    for t in x:
        t.cancel()
        x.remove(t)
    root.destroy()



#============================================    MAIN    ============================================#
num_seconds = 0                         # Index for which guess the player is on
round_times = [1,2,4,8,12,30]           # Number of seconds player has to guess (at each index)
music_playing = False                   # Boolean for if music is currently playing
game_over = False                       # Boolean for if the game is over (still in guessing phase)

# Get .env variables
load_dotenv()
target_username = os.getenv('target_username')
client_ID = os.getenv('client_id')
client_S = os.getenv('client_secret')

# Get data for best and current streaks from json file
streak = open("streak.json", "r")
[best_streak, current_streak] = json.loads(streak.read())
streak.close()

# Load the json file with song titles, and make sure they are for the correct user
input = open("datafile.json", "r")
name, lst = json.loads(input.read())

if name != target_username:
    print("Changing User...")
    getSongTitles(client_ID, client_S)
    
# Get the new target song and its associated info
song = getSong(client_ID, client_S)
get_img(song[3])
get_sound(song[2])

# Make sure song title is in the list of songs, and sort this list
if (str(song[0]) + " - " + str(song[1])) not in lst:
    lst.append(str(song[0]) + " - " + str(song[1]))

lst = [*set(lst)]
lst.sort()

#Initialize pyamge mixer
mixer.init() 



#============================================ Set up the Tkinter window ============================================#
# Set up the root window for the app
bgColor = '#121212'
root = Tk()
root.protocol("WM_DELETE_WINDOW", on_closing)
root.title('Maggle')  #Title for window
root.geometry("500x420")
root.option_add("*Font", ("Adobe Garamond Pro Bold", 10))
root.option_add("*Foreground", "white")
root.option_add("*Background", bgColor)
root['bg'] = bgColor


#Create the Streak labels at the top of the screen
streak_frame = Frame(root)
streak_frame.config(width = 440, height = 20)

best_lbl = Label(streak_frame, text = ("Best Streak: " + str(best_streak)))
best_lbl.pack(in_=streak_frame,side = LEFT)

curr_lbl = Label(streak_frame, text = ("Current Streak: " + str(current_streak)))
curr_lbl.pack(in_=streak_frame,side = RIGHT)

streak_frame.pack_propagate(0)
streak_frame.pack() 

# Create the title text
title=Label(root,text="Maggle",bd=9, font=("times new roman",50,"bold"),fg="green")
title.pack(side=TOP,fill=X)

#Create the frame and labels for the guesses
guess_frame = Frame(root)
guess_frame.option_add("*Relief", GROOVE)
guess_frame.option_add("*Width", 50)

guessLabels = [Label(guess_frame),Label(guess_frame),Label(guess_frame),Label(guess_frame),Label(guess_frame)]

for guess in guessLabels:
    guess.pack(in_=guess_frame,pady = 2)

guess_frame.pack_forget()
guess_frame.pack()


# Create the timer text
info=Label(root,text= "Current Time to Guess: 1 Second", relief=SOLID, borderwidth= 0)
info.pack_forget()
info.pack(pady=5)

# Create the play button
play_img = ImageTk.PhotoImage(Image.open("p2.png").resize((30,30)))
play_btn = Button(root, image = play_img, borderwidth=0, command=play_music)
play_btn.pack_forget()
play_btn.pack()

# Create the Combobox/dropdown menu
style= ttk.Style()
style.theme_use('clam')
style.configure("TCombobox", fieldbackground= bgColor)

combo_box = ttk.Combobox(root, width= 40, foreground='white')
combo_box['values'] = lst
combo_box.bind('<KeyRelease>', manage_combobox)
combo_box.tk.eval('[ttk::combobox::PopdownWindow %s].f.l configure -foreground white -background #121212' % combo_box)
combo_box.pack_forget()
combo_box.pack(pady = 8)

# Create a frame for the bottom 3 buttons
btns_frame = Frame(root)
btns_frame.config(width = 260, height = 20)
btns_frame.option_add("*Width", 6)
btns_frame.option_add("*Relief", GROOVE)

skip_btn = Button(btns_frame,  text="Skip",  bg = 'gray', command=add_time)
submit_btn = Button(btns_frame, text="Submit", bg = 'green', command=submit_answer)
reset_button = Button(btns_frame, text="Reset", command=reset_game)

skip_btn.pack_forget()
submit_btn.pack_forget()
reset_button.pack_forget()

skip_btn.pack(in_=btns_frame,side = LEFT)
submit_btn.pack(in_=btns_frame,side=RIGHT)
reset_button.pack(in_=btns_frame, side = TOP)

btns_frame.pack_propagate(0)
btns_frame.pack_forget()
btns_frame.pack()


# Create the cover image to show after a game over
coverImg = ImageTk.PhotoImage(Image.open("cover.jpg").resize((150,150)))
cover_lbl = Label(root, image = coverImg, width = 150, height = 150, borderwidth=0)
cover_lbl.pack_forget()

# Create the reset button used after a game over
reset_button2 = Button(root, width=6,  text="Reset", relief='groove', command=reset_game)
reset_button2.pack_forget()

#Create a canvas to show the guesses after a game over
guess_canvas= Canvas(root, width = 142, height = 16, bd=0,highlightthickness=0,  relief='ridge')

for i in range(0,5):
    guess_canvas.create_rectangle(30 * i,0,30 * i + 24,8, fill = "white")
guess_canvas.pack_forget()

# Call the tkinter window
root.mainloop()


