/* ============================================================
   MOON & MONEY — Today's Money Mood (homepage card)
   ------------------------------------------------------------
   Renders into #todaysMood. Computes the current moon sign from the
   pre-computed 2026 ingresses + the one-line money mood for that
   sign, links through to the full Money Mood reference page.

   Updates every page load. The whole point is: a free visitor sees
   the money side the moment they land, without us writing copy each
   week.
   ============================================================ */
(function () {
  'use strict';
  var root = document.getElementById('todaysMood');
  if (!root) return;

  var INGRESSES = [{"sign": "Capricorn", "t": "2025-12-20T04:52:35Z"}, {"sign": "Aquarius", "t": "2025-12-22T15:51:50Z"}, {"sign": "Pisces", "t": "2025-12-25T01:08:50Z"}, {"sign": "Aries", "t": "2025-12-27T08:01:48Z"}, {"sign": "Taurus", "t": "2025-12-29T11:57:21Z"}, {"sign": "Gemini", "t": "2025-12-31T13:13:05Z"}, {"sign": "Cancer", "t": "2026-01-02T13:09:00Z"}, {"sign": "Leo", "t": "2026-01-04T13:43:27Z"}, {"sign": "Virgo", "t": "2026-01-06T16:56:48Z"}, {"sign": "Libra", "t": "2026-01-09T00:05:48Z"}, {"sign": "Scorpio", "t": "2026-01-11T10:55:20Z"}, {"sign": "Sagittarius", "t": "2026-01-13T23:33:47Z"}, {"sign": "Capricorn", "t": "2026-01-16T11:47:09Z"}, {"sign": "Aquarius", "t": "2026-01-18T22:17:59Z"}, {"sign": "Pisces", "t": "2026-01-21T06:49:40Z"}, {"sign": "Aries", "t": "2026-01-23T13:25:41Z"}, {"sign": "Taurus", "t": "2026-01-25T18:05:19Z"}, {"sign": "Gemini", "t": "2026-01-27T20:55:01Z"}, {"sign": "Cancer", "t": "2026-01-29T22:31:42Z"}, {"sign": "Leo", "t": "2026-02-01T00:08:58Z"}, {"sign": "Virgo", "t": "2026-02-03T03:21:14Z"}, {"sign": "Libra", "t": "2026-02-05T09:32:32Z"}, {"sign": "Scorpio", "t": "2026-02-07T19:13:08Z"}, {"sign": "Sagittarius", "t": "2026-02-10T07:21:50Z"}, {"sign": "Capricorn", "t": "2026-02-12T19:44:22Z"}, {"sign": "Aquarius", "t": "2026-02-15T06:16:39Z"}, {"sign": "Pisces", "t": "2026-02-17T14:09:06Z"}, {"sign": "Aries", "t": "2026-02-19T19:39:06Z"}, {"sign": "Taurus", "t": "2026-02-21T23:30:56Z"}, {"sign": "Gemini", "t": "2026-02-24T02:28:53Z"}, {"sign": "Cancer", "t": "2026-02-26T05:11:07Z"}, {"sign": "Leo", "t": "2026-02-28T08:16:43Z"}, {"sign": "Virgo", "t": "2026-03-02T12:33:44Z"}, {"sign": "Libra", "t": "2026-03-04T18:55:47Z"}, {"sign": "Scorpio", "t": "2026-03-07T04:01:27Z"}, {"sign": "Sagittarius", "t": "2026-03-09T15:36:30Z"}, {"sign": "Capricorn", "t": "2026-03-12T04:07:07Z"}, {"sign": "Aquarius", "t": "2026-03-14T15:13:31Z"}, {"sign": "Pisces", "t": "2026-03-16T23:15:37Z"}, {"sign": "Aries", "t": "2026-03-19T04:03:00Z"}, {"sign": "Taurus", "t": "2026-03-21T06:35:07Z"}, {"sign": "Gemini", "t": "2026-03-23T08:18:41Z"}, {"sign": "Cancer", "t": "2026-03-25T10:32:57Z"}, {"sign": "Leo", "t": "2026-03-27T14:10:11Z"}, {"sign": "Virgo", "t": "2026-03-29T19:33:19Z"}, {"sign": "Libra", "t": "2026-04-01T02:50:46Z"}, {"sign": "Scorpio", "t": "2026-04-03T12:10:53Z"}, {"sign": "Sagittarius", "t": "2026-04-05T23:31:32Z"}, {"sign": "Capricorn", "t": "2026-04-08T12:04:18Z"}, {"sign": "Aquarius", "t": "2026-04-10T23:55:32Z"}, {"sign": "Pisces", "t": "2026-04-13T08:55:34Z"}, {"sign": "Aries", "t": "2026-04-15T14:03:57Z"}, {"sign": "Taurus", "t": "2026-04-17T15:57:48Z"}, {"sign": "Gemini", "t": "2026-04-19T16:17:38Z"}, {"sign": "Cancer", "t": "2026-04-21T17:00:16Z"}, {"sign": "Leo", "t": "2026-04-23T19:40:44Z"}, {"sign": "Virgo", "t": "2026-04-26T01:04:26Z"}, {"sign": "Libra", "t": "2026-04-28T09:02:44Z"}, {"sign": "Scorpio", "t": "2026-04-30T19:01:50Z"}, {"sign": "Sagittarius", "t": "2026-05-03T06:33:30Z"}, {"sign": "Capricorn", "t": "2026-05-05T19:06:07Z"}, {"sign": "Aquarius", "t": "2026-05-08T07:27:25Z"}, {"sign": "Pisces", "t": "2026-05-10T17:39:25Z"}, {"sign": "Aries", "t": "2026-05-13T00:03:41Z"}, {"sign": "Taurus", "t": "2026-05-15T02:31:09Z"}, {"sign": "Gemini", "t": "2026-05-17T02:23:02Z"}, {"sign": "Cancer", "t": "2026-05-19T01:46:05Z"}, {"sign": "Leo", "t": "2026-05-21T02:47:38Z"}, {"sign": "Virgo", "t": "2026-05-23T06:57:00Z"}, {"sign": "Libra", "t": "2026-05-25T14:34:09Z"}, {"sign": "Scorpio", "t": "2026-05-28T00:52:32Z"}, {"sign": "Sagittarius", "t": "2026-05-30T12:44:49Z"}, {"sign": "Capricorn", "t": "2026-06-02T01:19:15Z"}, {"sign": "Aquarius", "t": "2026-06-04T13:45:37Z"}, {"sign": "Pisces", "t": "2026-06-07T00:42:46Z"}, {"sign": "Aries", "t": "2026-06-09T08:33:20Z"}, {"sign": "Taurus", "t": "2026-06-11T12:28:09Z"}, {"sign": "Gemini", "t": "2026-06-13T13:06:02Z"}, {"sign": "Cancer", "t": "2026-06-15T12:14:15Z"}, {"sign": "Leo", "t": "2026-06-17T12:05:06Z"}, {"sign": "Virgo", "t": "2026-06-19T14:36:53Z"}, {"sign": "Libra", "t": "2026-06-21T20:54:55Z"}, {"sign": "Scorpio", "t": "2026-06-24T06:43:17Z"}, {"sign": "Sagittarius", "t": "2026-06-26T18:40:55Z"}, {"sign": "Capricorn", "t": "2026-06-29T07:18:36Z"}, {"sign": "Aquarius", "t": "2026-07-01T19:32:51Z"}, {"sign": "Pisces", "t": "2026-07-04T06:30:11Z"}, {"sign": "Aries", "t": "2026-07-06T15:07:04Z"}, {"sign": "Taurus", "t": "2026-07-08T20:30:44Z"}, {"sign": "Gemini", "t": "2026-07-10T22:41:37Z"}, {"sign": "Cancer", "t": "2026-07-12T22:46:29Z"}, {"sign": "Leo", "t": "2026-07-14T22:35:12Z"}, {"sign": "Virgo", "t": "2026-07-17T00:07:08Z"}, {"sign": "Libra", "t": "2026-07-19T04:56:34Z"}, {"sign": "Scorpio", "t": "2026-07-21T13:34:34Z"}, {"sign": "Sagittarius", "t": "2026-07-24T01:07:00Z"}, {"sign": "Capricorn", "t": "2026-07-26T13:44:18Z"}, {"sign": "Aquarius", "t": "2026-07-29T01:46:11Z"}, {"sign": "Pisces", "t": "2026-07-31T12:13:52Z"}, {"sign": "Aries", "t": "2026-08-02T20:36:47Z"}, {"sign": "Taurus", "t": "2026-08-05T02:35:25Z"}, {"sign": "Gemini", "t": "2026-08-07T06:07:47Z"}, {"sign": "Cancer", "t": "2026-08-09T07:45:41Z"}, {"sign": "Leo", "t": "2026-08-11T08:38:08Z"}, {"sign": "Virgo", "t": "2026-08-13T10:18:08Z"}, {"sign": "Libra", "t": "2026-08-15T14:19:43Z"}, {"sign": "Scorpio", "t": "2026-08-17T21:46:04Z"}, {"sign": "Sagittarius", "t": "2026-08-20T08:30:07Z"}, {"sign": "Capricorn", "t": "2026-08-22T20:59:07Z"}, {"sign": "Aquarius", "t": "2026-08-25T09:01:41Z"}, {"sign": "Pisces", "t": "2026-08-27T19:03:45Z"}, {"sign": "Aries", "t": "2026-08-30T02:37:47Z"}, {"sign": "Taurus", "t": "2026-09-01T08:01:18Z"}, {"sign": "Gemini", "t": "2026-09-03T11:47:16Z"}, {"sign": "Cancer", "t": "2026-09-05T14:30:26Z"}, {"sign": "Leo", "t": "2026-09-07T16:49:27Z"}, {"sign": "Virgo", "t": "2026-09-09T19:35:04Z"}, {"sign": "Libra", "t": "2026-09-11T23:51:43Z"}, {"sign": "Scorpio", "t": "2026-09-14T06:43:52Z"}, {"sign": "Sagittarius", "t": "2026-09-16T16:41:15Z"}, {"sign": "Capricorn", "t": "2026-09-19T04:54:52Z"}, {"sign": "Aquarius", "t": "2026-09-21T17:14:24Z"}, {"sign": "Pisces", "t": "2026-09-24T03:23:38Z"}, {"sign": "Aries", "t": "2026-09-26T10:23:06Z"}, {"sign": "Taurus", "t": "2026-09-28T14:40:03Z"}, {"sign": "Gemini", "t": "2026-09-30T17:26:02Z"}, {"sign": "Cancer", "t": "2026-10-02T19:54:06Z"}, {"sign": "Leo", "t": "2026-10-04T22:54:12Z"}, {"sign": "Virgo", "t": "2026-10-07T02:52:35Z"}, {"sign": "Libra", "t": "2026-10-09T08:10:33Z"}, {"sign": "Scorpio", "t": "2026-10-11T15:21:17Z"}, {"sign": "Sagittarius", "t": "2026-10-14T00:59:27Z"}, {"sign": "Capricorn", "t": "2026-10-16T12:57:02Z"}, {"sign": "Aquarius", "t": "2026-10-19T01:39:55Z"}, {"sign": "Pisces", "t": "2026-10-21T12:35:09Z"}, {"sign": "Aries", "t": "2026-10-23T19:53:32Z"}, {"sign": "Taurus", "t": "2026-10-25T23:34:40Z"}, {"sign": "Gemini", "t": "2026-10-28T01:01:53Z"}, {"sign": "Cancer", "t": "2026-10-30T02:05:34Z"}, {"sign": "Leo", "t": "2026-11-01T04:18:13Z"}, {"sign": "Virgo", "t": "2026-11-03T08:27:45Z"}, {"sign": "Libra", "t": "2026-11-05T14:38:19Z"}, {"sign": "Scorpio", "t": "2026-11-07T22:39:58Z"}, {"sign": "Sagittarius", "t": "2026-11-10T08:35:46Z"}, {"sign": "Capricorn", "t": "2026-11-12T20:27:17Z"}, {"sign": "Aquarius", "t": "2026-11-15T09:24:15Z"}, {"sign": "Pisces", "t": "2026-11-17T21:19:25Z"}, {"sign": "Aries", "t": "2026-11-20T05:52:12Z"}, {"sign": "Taurus", "t": "2026-11-22T10:09:42Z"}, {"sign": "Gemini", "t": "2026-11-24T11:09:40Z"}, {"sign": "Cancer", "t": "2026-11-26T10:51:09Z"}, {"sign": "Leo", "t": "2026-11-28T11:20:35Z"}, {"sign": "Virgo", "t": "2026-11-30T14:12:38Z"}, {"sign": "Libra", "t": "2026-12-02T20:03:53Z"}, {"sign": "Scorpio", "t": "2026-12-05T04:35:04Z"}, {"sign": "Sagittarius", "t": "2026-12-07T15:06:34Z"}, {"sign": "Capricorn", "t": "2026-12-10T03:08:40Z"}, {"sign": "Aquarius", "t": "2026-12-12T16:05:38Z"}, {"sign": "Pisces", "t": "2026-12-15T04:35:38Z"}, {"sign": "Aries", "t": "2026-12-17T14:34:21Z"}, {"sign": "Taurus", "t": "2026-12-19T20:29:42Z"}, {"sign": "Gemini", "t": "2026-12-21T22:27:07Z"}, {"sign": "Cancer", "t": "2026-12-23T21:58:23Z"}, {"sign": "Leo", "t": "2026-12-25T21:12:17Z"}, {"sign": "Virgo", "t": "2026-12-27T22:12:51Z"}, {"sign": "Libra", "t": "2026-12-30T02:26:41Z"}, {"sign": "Scorpio", "t": "2027-01-01T10:15:54Z"}, {"sign": "Sagittarius", "t": "2027-01-03T20:57:01Z"}];
  for (var i = 0; i < INGRESSES.length; i++) INGRESSES[i].ms = Date.parse(INGRESSES[i].t);

  var EL_COLOR = { Fire:'#D8463A', Earth:'#5BB587', Air:'#D6CFA4', Water:'#4988D0' };

  var SIGNS = {
    Aries:       { glyph:'\u2648', element:'Fire',  modality:'Cardinal', mood:'A fast, restless mood. The urge is to act now and buy now. Make the move; sleep on the purchase.' },
    Taurus:      { glyph:'\u2649', element:'Earth', modality:'Fixed',    mood:'Steady, sensual, grounded. Money feels calmer now. The pull is toward comfort, so catch the small luxuries before they stack up.' },
    Gemini:      { glyph:'\u264A', element:'Air',   modality:'Mutable',  mood:'A busy, curious mood. People want to compare, research, talk it through. Strong for gathering options, shaky for committing to one.' },
    Cancer:      { glyph:'\u264B', element:'Water', modality:'Cardinal', mood:'The mood softens toward safety and home. Saving feels good and generosity comes easily. Watch for soothing a feeling with the card.' },
    Leo:         { glyph:'\u264C', element:'Fire',  modality:'Fixed',    mood:'Warm, generous, a little theatrical. The urge is to treat, to host, to be seen doing it. Enjoy it, just not to prove anything.' },
    Virgo:       { glyph:'\u264D', element:'Earth', modality:'Mutable',  mood:'A tidy, careful mood. Good days to review the budget, fix the leaks, sort the details. Useful, until it tips into worry.' },
    Libra:       { glyph:'\u264E', element:'Air',   modality:'Cardinal', mood:'The mood wants money to feel fair and pleasant. Strong for partnership and shared decisions, easy to over-give to keep the peace.' },
    Scorpio:     { glyph:'\u264F', element:'Water', modality:'Fixed',    mood:'Money goes quiet and intense. The mood favours strategy, privacy, and an honest look at debt or shared finances.' },
    Sagittarius: { glyph:'\u2650', element:'Fire',  modality:'Mutable',  mood:'An optimistic, restless mood. The pull is toward experiences, travel, the big yes. Wonderful, just check the balance first.' },
    Capricorn:   { glyph:'\u2651', element:'Earth', modality:'Cardinal', mood:'A serious, practical mood. Strong for long-term planning and discipline. The risk is letting money feel like a verdict on you.' },
    Aquarius:    { glyph:'\u2652', element:'Air',   modality:'Fixed',    mood:'A cool, future-minded mood. Money gets thought about in systems and patterns. Good for vision, easy to skip the actual numbers.' },
    Pisces:      { glyph:'\u2653', element:'Water', modality:'Mutable',  mood:'A dreamy, porous mood. Intuition runs strong and generosity overflows. A day to look at the balance, gently, rather than away from it.' }
  };

  function moonSignAt(ms) {
    var s = INGRESSES[0].sign;
    for (var i = 0; i < INGRESSES.length; i++) {
      if (INGRESSES[i].ms <= ms) s = INGRESSES[i].sign;
      else break;
    }
    return s;
  }

  function render() {
    var now = Date.now();
    var sign = moonSignAt(now);
    var s = SIGNS[sign];
    if (!s) return;
    var col = EL_COLOR[s.element];
    var slug = sign.toLowerCase();
    var date = new Date(now);
    var dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    root.innerHTML =
      '<a href="sun-money.html#' + slug + '" class="tm-card reveal">' +
        '<div class="tm-date">' + dateStr + '</div>' +
        '<div class="tm-glyph" style="color:' + col + ';text-shadow:0 0 22px ' + col + 'aa">' + s.glyph + '</div>' +
        '<h3>Moon in <em>' + sign + '</em></h3>' +
        '<div class="tm-meta" style="color:' + col + '">' + s.element + ' \u00b7 ' + s.modality + '</div>' +
        '<p class="tm-mood">' + s.mood + '</p>' +
        '<span class="tm-cta">Read the full ' + sign + ' money mood &rarr;</span>' +
      '</a>';

    // Trigger the existing reveal animation
    setTimeout(function () {
      var card = root.querySelector('.tm-card');
      if (card) card.classList.add('in');
    }, 80);
  }

  render();
})();
