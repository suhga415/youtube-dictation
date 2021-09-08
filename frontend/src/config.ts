export const config = {
  CAPTION_URL: (process.env.VUE_APP_ENV === 'local')
    ? "http://localhost:4000/"
    : "https://youtube-dictation-backend.herokuapp.com/",
  CAPTION_TRACKS_URL: (process.env.VUE_APP_ENV === 'local')
    ? "http://localhost:4000/caption-tracks"
    : "https://youtube-dictation-backend.herokuapp.com/caption-tracks",
}
