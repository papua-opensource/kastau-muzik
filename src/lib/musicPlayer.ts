import { Howl } from 'howler';

import type { Music } from "../types";

let currentSound: Howl | null = null;
let currentButton: HTMLButtonElement | null = null;
let currentIndex: number = -1;

// Hero elements
const heroPlayPauseButton = document.getElementById('hero-play-pause-button') as HTMLButtonElement;
const heroSongTitle = document.getElementById('hero-song-title') as HTMLElement;
const heroSongArtist = document.getElementById('hero-song-artist') as HTMLElement;
const heroPlayingStatus = document.getElementById('hero-playing-status') as HTMLElement;
const musicInfo = document.getElementById('music-info') as HTMLElement;
const heroCoverArt = document.getElementById('hero-cover-art') as HTMLImageElement;

// Music Control elements
const musicControlTitle = document.getElementById('music-control-title') as HTMLElement;
const musicControlPlayPauseButton = document.getElementById('play-pause-button') as HTMLButtonElement;
const prevButton = document.getElementById('prev-button') as HTMLButtonElement;
const nextButton = document.getElementById('next-button') as HTMLButtonElement;
const progressBar = document.getElementById('progress-bar') as HTMLElement;
const currentTime = document.getElementById('current-time') as HTMLElement;
const duration = document.getElementById('duration') as HTMLElement;

const playButtons = document.querySelectorAll('.play-button') as NodeListOf<HTMLButtonElement>;

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function updateProgressBar(): void {
    if (currentSound) {
        const seek = currentSound.seek() as number;
        const progress = (seek / currentSound.duration()) * 100 || 0;
        progressBar.style.width = `${progress}%`;
        currentTime.textContent = formatTime(seek);
        duration.textContent = formatTime(currentSound.duration());

        if (currentSound.playing()) {
            requestAnimationFrame(updateProgressBar);
        }
    }
}

function updatePlayState(isPlaying: boolean): void {
    if (isPlaying) {
        heroPlayPauseButton.innerHTML = '<svg class="w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M14 19V5h4v14zm-8 0V5h4v14z"/></svg>';
        musicControlPlayPauseButton.querySelector('.play-icon')?.classList.add('hidden');
        musicControlPlayPauseButton.querySelector('.pause-icon')?.classList.remove('hidden');
        heroPlayingStatus.classList.remove('hidden');
    } else {
        heroPlayPauseButton.innerHTML = '<svg class="w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.53,11.152l-8-5C8.221,5.958,7.833,5.949,7.515,6.125C7.197,6.302,7,6.636,7,7v10 c0,0.364,0.197,0.698,0.515,0.875C7.667,17.958,7.833,18,8,18c0.184,0,0.368-0.051,0.53-0.152l8-5C16.822,12.665,17,12.345,17,12 S16.822,11.335,16.53,11.152z"></path></svg>';
        musicControlPlayPauseButton.querySelector('.play-icon')?.classList.remove('hidden');
        musicControlPlayPauseButton.querySelector('.pause-icon')?.classList.add('hidden');
        heroPlayingStatus.classList.add('hidden');
    }
}

function updateMusicInfo(title: string, artist: string, coverArt: string, isPlaying: boolean): void {
    heroSongTitle.textContent = title;
    heroSongArtist.textContent = artist;
    heroCoverArt.src = coverArt;
    musicControlTitle.textContent = title;

    updatePlayState(isPlaying);

    musicInfo.classList.remove('hidden');
    musicInfo.classList.add('flex');

    localStorage.setItem('lastPlayedSong', JSON.stringify({ title, artist, coverArt }));
}

function updateSongCardIcons(button: HTMLButtonElement, isPlaying: boolean): void {
    const playIcon = button.querySelector('.play-icon');
    const pauseIcon = button.querySelector('.pause-icon');
    if (isPlaying) {
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
    } else {
        playIcon?.classList.remove('hidden');
        pauseIcon?.classList.add('hidden');
    }
}

function setActiveSong(button: HTMLButtonElement, isPlaying: boolean): void {
    if (currentButton) {
        const prevSlide = currentButton.closest('.swiper-slide');
        prevSlide?.querySelector('.song-overlay')?.classList.remove('bg-opacity-60');
        prevSlide?.querySelector('.play-button')?.classList.remove('opacity-100', 'translate-y-0');
        prevSlide?.querySelector('.playing-indicator')?.classList.add('hidden');
        updateSongCardIcons(currentButton, false);
    }

    const currentSlide = button.closest('.swiper-slide');
    currentSlide?.querySelector('.song-overlay')?.classList.add('bg-opacity-60');
    currentSlide?.querySelector('.play-button')?.classList.add('opacity-100', 'translate-y-0');
    currentSlide?.querySelector('.playing-indicator')?.classList.remove('hidden');
    updateSongCardIcons(button, isPlaying);

    currentButton = button;
    currentIndex = Array.from(playButtons).indexOf(button);
}

function playPause(): void {
    if (currentSound) {
        if (currentSound.playing()) {
            currentSound.pause();
            updatePlayState(false);
            if (currentButton) updateSongCardIcons(currentButton, false);
        } else {
            currentSound.play();
            updatePlayState(true);
            if (currentButton) updateSongCardIcons(currentButton, true);
            requestAnimationFrame(updateProgressBar);
        }
    }
}

function playNext(): void {
    if (currentIndex < playButtons.length - 1) {
        if (currentButton) updateSongCardIcons(currentButton, false);
        playButtons[currentIndex + 1].click();
    }
}

function playPrevious(): void {
    if (currentIndex > 0) {
        if (currentButton) updateSongCardIcons(currentButton, false);
        playButtons[currentIndex - 1].click();
    }
}

playButtons.forEach(button => {
    button.addEventListener('click', function (this: HTMLButtonElement) {
        const musicUrl = this.getAttribute('data-music-url');
        const coverArt = this.getAttribute('data-cover-art');
        const title = this.closest('.swiper-slide')?.querySelector('h3')?.textContent || '';
        const artist = this.closest('.swiper-slide')?.querySelector('p')?.textContent || '';

        if (currentSound && currentButton === this) {
            playPause();
        } else {
            if (currentSound) {
                currentSound.stop();
                if (currentButton) updateSongCardIcons(currentButton, false);
            }

            if (musicUrl) {
                currentSound = new Howl({
                    src: [musicUrl],
                    html5: true,
                    onplay: () => {
                        requestAnimationFrame(updateProgressBar);
                        updateSongCardIcons(this, true);
                    },
                    onpause: () => {
                        updateSongCardIcons(this, false);
                    },
                    onend: () => {
                        updatePlayState(false);
                        updateSongCardIcons(this, false);
                        playNext();
                    },
                    onloaderror: () => {
                        console.error('Error loading audio file:', musicUrl);
                    }
                });

                currentSound.play();
                setActiveSong(this, true);
                updateMusicInfo(title, artist, coverArt || '', true);
            }
        }
    });
});

heroPlayPauseButton.addEventListener('click', playPause);
musicControlPlayPauseButton.addEventListener('click', playPause);
prevButton.addEventListener('click', playPrevious);
nextButton.addEventListener('click', playNext);

// Progress bar click event
const progressBarContainer = progressBar.parentElement;
if (progressBarContainer) {
    progressBarContainer.addEventListener('click', function (e: MouseEvent) {
        if (currentSound) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clickedValue = x / this.offsetWidth;
            currentSound.seek(clickedValue * currentSound.duration());
            updateProgressBar();
        }
    });
}

// Set initial song
const lastPlayedSong = localStorage.getItem('lastPlayedSong');
if (lastPlayedSong) {
    const { title, artist, cover_art_url } = JSON.parse(lastPlayedSong) as Music;
    updateMusicInfo(title, artist, cover_art_url, false);
}