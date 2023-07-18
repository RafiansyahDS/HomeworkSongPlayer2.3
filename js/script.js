function songDetail(song) {
  return `<li data-song-id="${song.songId}" onclick="playSong('${song.songId}')">
    <div class="song-details">
      <span class="song-title">${song.title}</span>
      <span class="song-artists">${song.artists.join(', ')}</span>      
      <div class="play-count">${song.playCount}</div>
    </div>
  </li>`
}

function playSong(songId) {
  fetch('/playlist/' + songId + '/play')
    .then(response => response.json())
    .then(data => {
      const song = data.song;
      const audioPlayer = document.getElementById('audio-player');
      audioPlayer.src = song.url;
      audioPlayer.play();
      
      const songList = document.querySelector('ul');
      const songItem = songList.querySelector(`li[data-song-id="${songId}"]`);
      if (songItem) {
        const playCountElement = songItem.querySelector('.play-count');
        if (playCountElement) {          
          playCountElement.textContent = `${song.playCount}`;
        }
        const playingSongItem = songList.querySelector('.playing');
        if (playingSongItem) {
          playingSongItem.classList.remove('playing');
        }
        songItem.classList.add('playing');
      }
    });
}


function openAddSongDialog() {
  const addSongDialog = document.getElementById('addSongDialog');
  addSongDialog.style.display = 'block';
}

document.getElementById('addSongForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const artist = document.getElementById('artist').value;
  const url = document.getElementById('url').value;

  const songData = {
    title: title,
    artists: [artist],
    url: url
  };

  fetch('/playlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(songData)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);      
      document.getElementById('addSongForm').reset();
      document.getElementById('addSongDialog').style.display = 'none';
      fetch('/playlist')
        .then(response => response.json())
        .then(data => {
          const songList = document.querySelector('ul');
          songList.innerHTML = data.playlist
            .map((song) => songDetail(song))
            .join('');
        });
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

function closeAddSongDialog() {
  const dialog = document.getElementById('addSongDialog');
  dialog.style.display = 'none';
  
  const form = document.getElementById('addSongForm');
  form.reset();
}

function updateSongList(option) {
  const selectedOption = document.getElementById('selectedOption');
  selectedOption.textContent = option === 'mostRecent' ? 'Most Recent' : 'Most Played';
  if (option === 'mostPlayed') {
    fetch('/playlist/sort/most-played')
      .then(response => response.json())
      .then(data => {
        const sortedPlaylist = data.playlist;
        const songList = document.querySelector('ul');
        songList.innerHTML = sortedPlaylist
          .map((song) => songDetail(song))
          .join('');
      });
  } else if (option === 'mostRecent') {
    fetch('/playlist/sort/most-recent')
      .then(response => response.json())
      .then(data=>{
        const sortedPlaylist = data.playlist;
        const songList = document.querySelector('ul');
        songList.innerHTML = sortedPlaylist
          .map((song) => songDetail(song))
          .join('');
      });
  }
}  

