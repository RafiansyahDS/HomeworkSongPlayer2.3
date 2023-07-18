const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

let playlist = [];

function generateSongId() {
  return Math.random().toString(36).substr(2, 9);
}

function createSong(title, artists, url) {
  return {
    songId: generateSongId(),
    title,
    artists,
    url,
    timeAdded: Math.floor(Date.now() / 1000),
    playCount: 0,
    isPlaying: false
  };
}

function addSong(song) {
  playlist.push(song);
}

function playSong(songId) {
  const song = playlist.find((song) => song.songId === songId);
  if (song) {
    song.playCount++;
    song.isPlaying = true;
    return song;
  } else {
    return null;
  }
}

function stopSong(songId) {
  const song = playlist.find((song) => song.songId === songId);
  if (song) {
    song.isPlaying = false;
  }
}

app.post('/playlist', (req, res) => {
  const { title, artists, url } = req.body;
  const song = createSong(title, artists, url);
  addSong(song);
  res.status(201).json({ message: 'Song added to playlist.', songId: song.songId });
});

app.get('/playlist/:songId/play', (req, res) => {
  const songId = req.params.songId;
  const song = playSong(songId);
  if (song) {
    res.status(200).json({ song });
  } else {
    res.status(404).json({ message: 'Song not found in playlist.' });
  }
});

app.get('/playlist/:songId/stop', (req, res) => {
  const songId = req.params.songId;
  stopSong(songId);
  res.status(200).json({ message: 'Song stopped.' });
});

app.get('/playlist', (req, res) => {
  res.status(200).json({ playlist });
});

function sortPlaylistByPlayCount() {
  return playlist.sort((a, b) => b.playCount - a.playCount);
}

app.get('/playlist/sort/most-played', (req, res) => {
  const sortedPlaylist = sortPlaylistByPlayCount();
  res.status(200).json({ playlist: sortedPlaylist });
});

function sortPlaylistByRecent() {
  return playlist.sort((a, b) => b.timeAdded - a.timeAdded);
}

app.get('/playlist/sort/most-recent', (req, res) => {
  const sortedPlaylist = sortPlaylistByRecent();
  res.status(200).json({ playlist: sortedPlaylist });
});

app.get('/', (req, res) => {
  const songListHTML = sortPlaylistByRecent()
    .map((song) => `<li data-song-id="${song.songId}" onclick="playSong('${song.songId}')">
    <div class="song-details">
      <span class="song-title">${song.title}</span>
      <span class="song-artists">${song.artists.join(', ')}</span>      
      <div class="play-count">${song.playCount}</div>
    </div>
  </li>`)
    .join('');  

  const html = `
    <html>
      <head>
        <title>Song Playlist</title>
        <link rel="stylesheet" type="text/css" href="/css/style.css">            
      </head>
      <body>
        <div id = "heading">        
          <h1 id="titlelogo" onclick="location.reload()">LAGUKU</h1>
          <div id="addbutton" onclick="openAddSongDialog()">TAMBAH LAGU</div>
          <div id="addSongDialog" class="dialog">
            <h2>Add Song</h2>
            <form id="addSongForm">
              <label for="title">Title:</label>
              <input type="text" id="title" name="title" required>

              <label for="artist">Artist:</label>
              <input type="text" id="artist" name="artist" required>

              <label for="url">URL Stream Lagu:</label>
              <input type="text" id="url" name="url" required>
              <span class="infourl">URL Harus Berupa URL Audio Stream Yang Dapat Diakses Filenya.</span>

              <button id="addsong" type="submit">Add</button>    
              <button id="canceladdsong" type="button" onclick="closeAddSongDialog()">Cancel</button>          
            </form>
          </div>
          <div class="dropdown">
          <button class="dropbtn">Sort By: <span id="selectedOption">Most Recent</span></button>
            <div class="dropdown-content">
              <a onclick="updateSongList('mostRecent')">Most Recent</a>
              <a onclick="updateSongList('mostPlayed')">Most Played</a>              
            </div>
          </div>        
        </div>
        <div class="song-details lbldetail">
          <span class="song-title">Judul Lagu</span>
          <span class="song-artists">Artis</span>      
          <div class="play-count">Jumlah Dimainkan</div>
        </div>
        <ul>
          ${songListHTML}
        </ul>        
        <div id="song-player">
          <audio id="audio-player" controls></audio>
        </div>
        <script src="/js/script.js"></script>    
      </body>
    </html>
  `;

  res.send(html);
});

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

const initialSongs = [
    {
        "title": "Space Oddity",
        "artists": ["ARForest"],
        "url": "https://drive.google.com/uc?export=download&id=1O-scMatPfp07kaDqf1woRUoXHRE7f292"
      },
    {
        "title": "Scintillate",
        "artists": ["ARForest"],
        "url": "https://drive.google.com/uc?export=download&id=1EdgUorIMCM-cYmfiyw777RCMZkXd1qdh"
      },
      {
        "title": "Nible",
        "artists": ["ARForest", "Soochan Kim"],
        "url": "https://drive.google.com/uc?export=download&id=1wDWT637jzbAulYe45IsazpHX4la3cA_W"
      }
];

initialSongs.forEach((songData) => {
    const song = createSong(songData.title, songData.artists, songData.url);
    addSong(song);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
