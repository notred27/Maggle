### Known Bugs
- [x] Error playing first song after application loads
- [x] When switching themes, the song progress bar's max length may change
- [x] Issue logging out (duplicate logout btns required)
- [x] Nothing is done if a song preview can't be found 
- [x] No validation check that a song preview matches the requested song
    - If song preview cannot be found or song name doesn't match, that song is skipped.

- [ ] Nothing to catch if tracks.data[0] is undefined when fetching song preview
- [x] Resolve when a component is clicked off of (e.g., search menu for songs / playlists)
- [ ] No check for if current song was previous (or recent) guess


### TODO
- [x] Format dropdown menu for profile badge
- [x] Split logic into components
- [ ] Organize CSS files, and ensure that there are no inline styles
- [x] more responses for game over screen
- [ ] Create hist of guess times (e.g., how many times user guessed the song in 1 second, 2, ...) 
- [ ] Average time to listen before correct answer?
- [x] Fix Amplify env and change keys 
- [ ] make guest user for those without a spotify account