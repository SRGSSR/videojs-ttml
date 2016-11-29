/*! videojs-ttml - v0.0.1 - 2016-11-29*/
(function(window, moment, vjs) {
  'use strict';

  function TTMLParser() {
    this.domParser_ = new DOMParser();
  }

  TTMLParser.prototype = {
    parseTTMLCues_: function(p) {
      var lines = p.getElementsByTagName('span'),
          startTime = moment.duration(p.getAttribute('begin')).asSeconds(),
          endTime = moment.duration(p.getAttribute('end')).asSeconds(),
          id = p.getAttribute('xml:id'),
          cues = [];

      for (var i = 0; i < lines.length; i++) {
        var l = lines[i];

        cues.push({
          startTime: startTime,
          endTime: endTime,
          id: id + '_' + i,
          text: l.textContent.trim(),
          color: l.getAttribute('tts:color'),
          backgroundColor: l.getAttribute('tts:backgroundColor')
        });
      }

      return cues;
    },

    parseTTML: function(ttml) {
      var dom = this.domParser_.parseFromString(ttml, 'text/html'),
          pS = dom.getElementsByTagName('p'), cues = [];

      for (var i = 0; i < pS.length; i++) {
        cues = cues.concat(this.parseTTMLCues_(pS[i]));
      }

      return cues;
    }
  };

  vjs.plugin('ttml', function(options) {
      var Player = this.constructor,
          addRemoteTextTrack = Player.prototype.addRemoteTextTrack;

      this.addRemoteTextTrack = function(options, manualCleanup) {
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
            if (err || response.statusCode >= 300) {
              this.removeRemoteTextTrack(track);
            } else {
              track.loaded_ = true;
              var cues = parser.parseTTML(responseBody);
              cues.forEach(function(cue) {
                elmt.track.addCue(cue);
              });
            }
          }.bind(this));
        }

        return elmt;
      };
  });

})(window, window.moment, window.videojs);