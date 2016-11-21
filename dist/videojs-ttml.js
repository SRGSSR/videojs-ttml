/*! videojs-ttml - v0.0.1 - 2016-11-21*/
(function(window, moment, vjs) {
  'use strict';

  function TTMLParser() {
    this.domParser_ = new DOMParser();
  }

  TTMLParser.prototype = {
    parseTTMLText_: function(p) {
      var lines = p.getElementsByTagName('span'),
          txt = "";

      for (var i = 0; i < lines.length; i++) {
        var l = lines[i], txtContent = l.textContent.trim(),
            color = l.getAttribute('tts:color'),
            bColor = l.getAttribute('tts:backgroundColor');

        txt += '<span style="background-color:' + bColor +
               ';color:' + color + '">' + txtContent + '</span>';
      }

      return txt;
    },

    parseTTMLCues: function(ttml) {
      var dom = this.domParser_.parseFromString(ttml, 'text/html'),
          pS = dom.getElementsByTagName('p'), cues = [];

      for (var i = 0; i < pS.length; i++) {
        var p = pS[i];
        cues.push({
          startTime: moment.duration(p.getAttribute('begin')).asSeconds(),
          endTime: moment.duration(p.getAttribute('end')).asSeconds(),
          id: p.getAttribute('xml:id'),
          text: this.parseTTMLText_(p)
        });
      }

      return cues;
    }
  };

  vjs.plugin('ttml', function(options) {
      var Player = this.constructor,
          addRemoteTextTrack = Player.prototype.addRemoteTextTrack;

      Player.prototype.addRemoteTextTrack = function(options, manualCleanup) {
        var parser = new TTMLParser(),
            src = options.src,
            isTTML = options.type && options.type === 'application/ttml+xml',
            elmt;

        options.src = (isTTML) ? undefined : options.src;

        elmt = addRemoteTextTrack.apply(this, arguments);

        if (isTTML && elmt && elmt.track) {
          var track = elmt.track;
          track.loaded_ = false;
          vjs.xhr(src, {}, function (err, response, responseBody) {
            if (err) {
              track.loaded_ = false;
            } else {
              track.loaded_ = true;
              var cues = parser.parseTTMLCues(responseBody);
              cues.forEach(function(cue) {
                elmt.track.addCue(cue);
              });
            }
          });
        }

        return elmt;
      };
  });

})(window, window.moment, window.videojs);