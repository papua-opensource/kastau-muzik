document.addEventListener('DOMContentLoaded', (event) => {
    let currentSound = null;
    let currentButton = null;
    let currentIndex = -1;

    // Hero elements
    const heroPlayPauseButton = document.getElementById('hero-play-pause-button');
    const heroSongTitle = document.getElementById('hero-song-title');
    const heroSongArtist = document.getElementById('hero-song-artist');
    const heroPlayingStatus = document.getElementById('hero-playing-status');
    const musicInfo = document.getElementById('music-info');
    const heroCoverArt = document.getElementById('hero-cover-art');

    // Music Control elements
    const musicControlTitle = document.getElementById('music-control-title');
    const musicControlPlayPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const progressBar = document.getElementById('progress-bar');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');

    const playButtons = document.querySelectorAll('.play-button');

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function updateProgressBar() {
        if (currentSound) {
        const seek = currentSound.seek() || 0;
        const progress = (seek / currentSound.duration()) * 100 || 0;
        progressBar.style.width = `${progress}%`;
        currentTime.textContent = formatTime(seek);
        duration.textContent = formatTime(currentSound.duration());
        
        if (currentSound.playing()) {
            requestAnimationFrame(updateProgressBar);
        }
        }
    }

    function updatePlayState(isPlaying) {
        if (isPlaying) {
        heroPlayPauseButton.innerHTML = '<svg class="w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 19V5h4v14zm-8 0V5h4v14z"/></svg>';
        musicControlPlayPauseButton.querySelector('.play-icon').classList.add('hidden');
        musicControlPlayPauseButton.querySelector('.pause-icon').classList.remove('hidden');
        heroPlayingStatus.classList.remove('hidden');
        } else {
        heroPlayPauseButton.innerHTML = '<svg class="w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.53,11.152l-8-5C8.221,5.958,7.833,5.949,7.515,6.125C7.197,6.302,7,6.636,7,7v10 c0,0.364,0.197,0.698,0.515,0.875C7.667,17.958,7.833,18,8,18c0.184,0,0.368-0.051,0.53-0.152l8-5C16.822,12.665,17,12.345,17,12 S16.822,11.335,16.53,11.152z"></path></svg>';
        musicControlPlayPauseButton.querySelector('.play-icon').classList.remove('hidden');
        musicControlPlayPauseButton.querySelector('.pause-icon').classList.add('hidden');
        heroPlayingStatus.classList.add('hidden');
        }
    }

    function updateMusicInfo(title, artist, coverArt, isPlaying) {
        heroSongTitle.textContent = title;
        heroSongArtist.textContent = artist;
        heroCoverArt.src = coverArt;
        musicControlTitle.textContent = title;

        updatePlayState(isPlaying);

        musicInfo.classList.remove('hidden');
        musicInfo.classList.add('flex');

        localStorage.setItem('lastPlayedSong', JSON.stringify({ title, artist, coverArt }));
    }

    function updateSongCardIcons(button, isPlaying) {
        const playIcon = button.querySelector('.play-icon');
        const pauseIcon = button.querySelector('.pause-icon');
        if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        }
    }

    function setActiveSong(button, isPlaying) {
        if (currentButton) {
        const prevSlide = currentButton.closest('.swiper-slide');
        prevSlide.querySelector('.song-overlay').classList.remove('bg-opacity-60');
        prevSlide.querySelector('.play-button').classList.remove('opacity-100', 'translate-y-0');
        prevSlide.querySelector('.playing-indicator').classList.add('hidden');
        updateSongCardIcons(currentButton, false);
        }

        const currentSlide = button.closest('.swiper-slide');
        currentSlide.querySelector('.song-overlay').classList.add('bg-opacity-60');
        currentSlide.querySelector('.play-button').classList.add('opacity-100', 'translate-y-0');
        currentSlide.querySelector('.playing-indicator').classList.remove('hidden');
        updateSongCardIcons(button, isPlaying);

        currentButton = button;
        currentIndex = Array.from(playButtons).indexOf(button);
    }

    function playPause() {
        if (currentSound) {
        if (currentSound.playing()) {
            currentSound.pause();
            updatePlayState(false);
            updateSongCardIcons(currentButton, false);
        } else {
            currentSound.play();
            updatePlayState(true);
            updateSongCardIcons(currentButton, true);
            requestAnimationFrame(updateProgressBar);
        }
        }
    }

    function playNext() {
        if (currentIndex < playButtons.length - 1) {
        updateSongCardIcons(currentButton, false);
        playButtons[currentIndex + 1].click();
        }
    }

    function playPrevious() {
        if (currentIndex > 0) {
        updateSongCardIcons(currentButton, false);
        playButtons[currentIndex - 1].click();
        }
    }

    playButtons.forEach(button => {
        button.addEventListener('click', function() {
        const musicUrl = this.getAttribute('data-music-url');
        const coverArt = this.getAttribute('data-cover-art');
        const title = this.closest('.swiper-slide').querySelector('h3').textContent;
        const artist = this.closest('.swiper-slide').querySelector('p').textContent;

        if (currentSound && currentButton === this) {
            playPause();
        } else {
            if (currentSound) {
            currentSound.stop();
            updateSongCardIcons(currentButton, false);
            }

            currentSound = new Howl({
            src: [musicUrl],
            html5: true,
            onplay: function() {
                requestAnimationFrame(updateProgressBar);
                updateSongCardIcons(button, true);
            },
            onpause: function() {
                updateSongCardIcons(button, false);
            },
            onend: function() {
                updatePlayState(false);
                updateSongCardIcons(button, false);
                playNext();
            },
            onloaderror: function() {
                console.error('Error loading audio file:', musicUrl);
            }
            });

            currentSound.play();
            setActiveSong(this, true);
            updateMusicInfo(title, artist, coverArt, true);
        }
        });
    });

    heroPlayPauseButton.addEventListener('click', playPause);
    musicControlPlayPauseButton.addEventListener('click', playPause);
    prevButton.addEventListener('click', playPrevious);
    nextButton.addEventListener('click', playNext);

    // Progress bar click event
    const progressBarContainer = progressBar.parentElement;
    progressBarContainer.addEventListener('click', function(e) {
        if (currentSound) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedValue = x / this.offsetWidth;
        currentSound.seek(clickedValue * currentSound.duration());
        updateProgressBar();
        }
    });

    // Set initial song
    const lastPlayedSong = JSON.parse(localStorage.getItem('lastPlayedSong'));
    if (lastPlayedSong) {
        updateMusicInfo(lastPlayedSong.title, lastPlayedSong.artist, lastPlayedSong.coverArt, false);
    }
});

// document.addEventListener('DOMContentLoaded', (event) => {
//     let currentSound = null;
//     let currentButton = null;
//     let currentIndex = -1;

//     const musicControlTitle = document.getElementById('music-control-title');
//     const playPauseButton = document.getElementById('play-pause-button');
//     const prevButton = document.getElementById('prev-button');
//     const nextButton = document.getElementById('next-button');
//     const progressBar = document.getElementById('progress-bar');
//     const currentTime = document.getElementById('current-time');
//     const duration = document.getElementById('duration');

//     const playButtons = document.querySelectorAll('.play-button');

//     function formatTime(seconds) {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
//     }

//     function updateProgressBar() {
//     if (currentSound) {
//         const seek = currentSound.seek() || 0;
//         const progress = (seek / currentSound.duration()) * 100 || 0;
//         progressBar.style.width = `${progress}%`;
//         currentTime.textContent = formatTime(seek);
//         duration.textContent = formatTime(currentSound.duration());
        
//         if (currentSound.playing()) {
//         requestAnimationFrame(updateProgressBar);
//         }
//     }
//     }

//     function updateMusicControl(title, isPlaying) {
//     musicControlTitle.textContent = title;

//     if (isPlaying) {
//         playPauseButton.querySelector('.play-icon').classList.add('hidden');
//         playPauseButton.querySelector('.pause-icon').classList.remove('hidden');
//     } else {
//         playPauseButton.querySelector('.play-icon').classList.remove('hidden');
//         playPauseButton.querySelector('.pause-icon').classList.add('hidden');
//     }
//     }

//     function setActiveSong(button) {
//     if (currentButton) {
//         const prevSlide = currentButton.closest('.swiper-slide');
//         prevSlide.querySelector('.song-overlay').classList.remove('bg-opacity-60');
//         prevSlide.querySelector('.play-button').classList.remove('opacity-100', 'translate-y-0');
//         prevSlide.querySelector('.playing-indicator').classList.add('hidden');
//     }

//     const currentSlide = button.closest('.swiper-slide');
//     currentSlide.querySelector('.song-overlay').classList.add('bg-opacity-60');
//     currentSlide.querySelector('.play-button').classList.add('opacity-100', 'translate-y-0');
//     currentSlide.querySelector('.playing-indicator').classList.remove('hidden');

//     currentButton = button;
//     currentIndex = Array.from(playButtons).indexOf(button);
//     }

//     function playPause() {
//     if (currentSound) {
//         if (currentSound.playing()) {
//         currentSound.pause();
//         updateMusicControl(musicControlTitle.textContent, false);
//         if (currentButton) {
//             currentButton.querySelector('.play-icon').classList.remove('hidden');
//             currentButton.querySelector('.pause-icon').classList.add('hidden');
//         }
//         } else {
//         currentSound.play();
//         updateMusicControl(musicControlTitle.textContent, true);
//         if (currentButton) {
//             currentButton.querySelector('.play-icon').classList.add('hidden');
//             currentButton.querySelector('.pause-icon').classList.remove('hidden');
//         }
//         requestAnimationFrame(updateProgressBar);
//         }
//     }
//     }

//     function playNext() {
//     if (currentIndex < playButtons.length - 1) {
//         playButtons[currentIndex + 1].click();
//     }
//     }

//     function playPrevious() {
//     if (currentIndex > 0) {
//         playButtons[currentIndex - 1].click();
//     }
//     }

//     playButtons.forEach(button => {
//     button.addEventListener('click', function() {
//         const musicUrl = this.getAttribute('data-music-url');
//         const title = this.closest('.swiper-slide').querySelector('h3').textContent;
//         const artist = this.closest('.swiper-slide').querySelector('p').textContent;
//         const playIcon = this.querySelector('.play-icon');
//         const pauseIcon = this.querySelector('.pause-icon');

//         if (currentSound && currentButton === this) {
//         if (currentSound.playing()) {
//             currentSound.pause();
//             playIcon.classList.remove('hidden');
//             pauseIcon.classList.add('hidden');
//             updateMusicControl(title, false);
//         } else {
//             currentSound.play();
//             playIcon.classList.add('hidden');
//             pauseIcon.classList.remove('hidden');
//             updateMusicControl(title, true);
//         }
//         } else {
//         if (currentSound) {
//             currentSound.stop();
//             if (currentButton) {
//             currentButton.querySelector('.play-icon').classList.remove('hidden');
//             currentButton.querySelector('.pause-icon').classList.add('hidden');
//             }
//         }

//         currentSound = new Howl({
//             src: [musicUrl],
//             html5: true,
//             onplay: function() {
//             requestAnimationFrame(updateProgressBar);
//             },
//             onend: function() {
//             playIcon.classList.remove('hidden');
//             pauseIcon.classList.add('hidden');
//             updateMusicControl(title, false);
//             playNext();
//             },
//             onloaderror: function() {
//             console.error('Error loading audio file:', musicUrl);
//             // Add error handling here, e.g., displaying a message to the user
//             }
//         });

//         currentSound.play();
//         playIcon.classList.add('hidden');
//         pauseIcon.classList.remove('hidden');
//         setActiveSong(this);
//         updateMusicControl(title, true);
//         }
//     });
//     });

//     playPauseButton.addEventListener('click', playPause);
//     prevButton.addEventListener('click', playPrevious);
//     nextButton.addEventListener('click', playNext);

//     // Progress bar click event
//     const progressBarContainer = progressBar.parentElement;
//     progressBarContainer.addEventListener('click', function(e) {
//     if (currentSound) {
//         const rect = this.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const clickedValue = x / this.offsetWidth;
//         currentSound.seek(clickedValue * currentSound.duration());
//         updateProgressBar();
//     }
//     });

//     // Add interval to ensure progress bar keeps updating
//     setInterval(() => {
//     if (currentSound && currentSound.playing()) {
//         updateProgressBar();
//     }
//     }, 1000);
// });



// document.addEventListener('DOMContentLoaded', (event) => {
//     let currentSound = null;
//     let currentButton = null;

//     const heroPlayPauseButton = document.getElementById('hero-play-pause-button');
//     const heroSongTitle = document.getElementById('hero-song-title');
//     const heroSongArtist = document.getElementById('hero-song-artist');
//     const heroPlayingStatus = document.getElementById('hero-playing-status');
//     const musicInfo = document.getElementById('music-info');
//     const heroCoverArt = document.getElementById('hero-cover-art');

//     function updateHeroSection(title, artist, coverArt, isPlaying) {
//     heroSongTitle.textContent = title;
//     heroSongArtist.textContent = artist;
//     heroCoverArt.src = coverArt;

//     if (isPlaying) {
//         heroPlayingStatus.classList.remove('hidden');
//         heroPlayPauseButton.innerHTML = '<svg class="w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 19V5h4v14zm-8 0V5h4v14z"/></svg>';
//     } else {
//         heroPlayingStatus.classList.add('hidden');
//         heroPlayPauseButton.innerHTML = '<svg class="w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.53,11.152l-8-5C8.221,5.958,7.833,5.949,7.515,6.125C7.197,6.302,7,6.636,7,7v10 c0,0.364,0.197,0.698,0.515,0.875C7.667,17.958,7.833,18,8,18c0.184,0,0.368-0.051,0.53-0.152l8-5C16.822,12.665,17,12.345,17,12 S16.822,11.335,16.53,11.152z"></path></svg>';
//     }

//     musicInfo.classList.remove('hidden');
//     musicInfo.classList.add('flex');

//     // Save current song to localStorage
//     localStorage.setItem('lastPlayedSong', JSON.stringify({ title, artist, coverArt }));
//     }

//     function setActiveSong(button) {
//     // Remove active state from previous song
//     if (currentButton) {
//         const prevSlide = currentButton.closest('.swiper-slide');
//         prevSlide.querySelector('.song-overlay').classList.remove('bg-opacity-60');
//         prevSlide.querySelector('.play-button').classList.remove('opacity-100', 'translate-y-0');
//         prevSlide.querySelector('.playing-indicator').classList.add('hidden');
//     }

//     // Set active state for current song
//     const currentSlide = button.closest('.swiper-slide');
//     currentSlide.querySelector('.song-overlay').classList.add('bg-opacity-60');
//     currentSlide.querySelector('.play-button').classList.add('opacity-100', 'translate-y-0');
//     currentSlide.querySelector('.playing-indicator').classList.remove('hidden');

//     currentButton = button;
//     }

//     function getRandomSong() {
//     const songs = Array.from(document.querySelectorAll('.play-button'));
//     return songs[Math.floor(Math.random() * songs.length)];
//     }

//     document.querySelectorAll('.play-button').forEach(button => {
//     button.addEventListener('click', function() {
//         const musicUrl = this.getAttribute('data-music-url');
//         const coverArt = this.getAttribute('data-cover-art');
//         const playIcon = this.querySelector('.play-icon');
//         const pauseIcon = this.querySelector('.pause-icon');
//         const title = this.closest('.swiper-slide').querySelector('h3').textContent;
//         const artist = this.closest('.swiper-slide').querySelector('p').textContent;

//         if (currentSound && currentButton === this) {
//         if (currentSound.playing()) {
//             currentSound.pause();
//             playIcon.classList.remove('hidden');
//             pauseIcon.classList.add('hidden');
//             updateHeroSection(title, artist, coverArt, false);
//         } else {
//             currentSound.play();
//             playIcon.classList.add('hidden');
//             pauseIcon.classList.remove('hidden');
//             updateHeroSection(title, artist, coverArt, true);
//         }
//         } else {
//         if (currentSound) {
//             currentSound.stop();
//             if (currentButton) {
//             currentButton.querySelector('.play-icon').classList.remove('hidden');
//             currentButton.querySelector('.pause-icon').classList.add('hidden');
//             }
//         }

//         currentSound = new Howl({
//             src: [musicUrl],
//             html5: true,
//             onend: function() {
//             playIcon.classList.remove('hidden');
//             pauseIcon.classList.add('hidden');
//             updateHeroSection(title, artist, coverArt, false);
//             }
//         });

//         currentSound.play();
//         playIcon.classList.add('hidden');
//         pauseIcon.classList.remove('hidden');
//         setActiveSong(this);
//         updateHeroSection(title, artist, coverArt, true);
//         }
//     });
//     });

//     heroPlayPauseButton.addEventListener('click', function() {
//     if (currentSound) {
//         if (currentSound.playing()) {
//         currentSound.pause();
//         updateHeroSection(heroSongTitle.textContent, heroSongArtist.textContent, heroCoverArt.src, false);
//         if (currentButton) {
//             currentButton.querySelector('.play-icon').classList.remove('hidden');
//             currentButton.querySelector('.pause-icon').classList.add('hidden');
//         }
//         } else {
//         currentSound.play();
//         updateHeroSection(heroSongTitle.textContent, heroSongArtist.textContent, heroCoverArt.src, true);
//         if (currentButton) {
//             currentButton.querySelector('.play-icon').classList.add('hidden');
//             currentButton.querySelector('.pause-icon').classList.remove('hidden');
//         }
//         }
//     }
//     });

//     // Set initial song
//     let initialSong;
//     const lastPlayedSong = JSON.parse(localStorage.getItem('lastPlayedSong'));

//     if (lastPlayedSong) {
//     // Use last played song if available
//     updateHeroSection(lastPlayedSong.title, lastPlayedSong.artist, lastPlayedSong.coverArt, false);
//     } else {
//     // Choose a random song if no last played song
//     initialSong = getRandomSong();
//     if (initialSong) {
//         const title = initialSong.closest('.swiper-slide').querySelector('h3').textContent;
//         const artist = initialSong.closest('.swiper-slide').querySelector('p').textContent;
//         const coverArt = initialSong.getAttribute('data-cover-art');
//         updateHeroSection(title, artist, coverArt, false);
//     }
//     }
// });

