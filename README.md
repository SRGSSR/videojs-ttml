# Videojs TTML Plugin

<img align="right" height="30" src="http://www.srgssr.ch/fileadmin/templates/images/SRGLogo.gif">

> A TTML plugin for video.js

This plugin makes it possible use TTML text tracks on VideoJS.

- [Getting Started](#getting-started)

## Getting Started

Download videojs-ttml and include it in your page along with video.js:

```html
<video id="example-video" width=600 height=300 class="video-js vjs-default-skin" controls>
  <source
     src="http://example.com/index.mp4"
     type="video/mp4">
  <track
     src="http://example.com/captions.xml"
     kind="captions"
     srclang="en"
     label="English Captions"
     type="application/ttml+xml">
</video>
<script src="video.js"></script>
<script src="videojs-ttml.js"></script>
<script>
var player = videojs('example-video', { plugins: { ttml: {} }, nativeTextTracks: false }, function() {
    // Print a list of available textracks
    console.log(this.textracks());
});
</script>
```