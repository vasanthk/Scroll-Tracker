/**
 * Scroll Tracker
 *
 * Used to track sections of the page viewed by the user.
 * Track page scroll with % of page/pixels with time taken in Google Analytics
 * Watch elements and fire an event when it is first viewed.
 *
 * @dependency: jQuery, Google Analytics, few Underscore fns
 * @author: Vasanth Krishnamoorthy
 */

(function ($, window, document) {
	var defaults = {
		track_percent_scrolled: true,
		track_pixels_scrolled: false,
		track_timing: false
	};

	var $w = $(window),
		cache = [],
		pixels_scrolled = 0,
		pixels_rounded = 0;

	window.scrollTracker = function (options) {
		var startTime = _.now();
		options = $.extend({}, defaults, options);

		trackView('Percent Scrolled', 'Baseline', 0, 0);	// Called once when page is loaded.

		function trackView(action, label, scroll_depth, timing) {
			_gaq.push(["_trackEvent", action, label, timing, true]);	// Tracks % of page scrolled

			if (options.track_pixels_scrolled && scroll_depth > pixels_scrolled) {
				pixels_scrolled = scroll_depth;
				pixels_rounded = (Math.floor(scroll_depth / 250) * 250);	// nearest 250px viewed (floor)
				_gaq.push(["_trackEvent", 'Pixels Scrolled', pixels_rounded.toString(), timing, true]);
			}
		}

		function trackPercentScrolled(checkpoints, scroll_depth, timing) {
			var keys = Object.keys(checkpoints), length = keys.length;
			for (var i = 0; i < length; i++) {
				if ($.inArray(keys[i], cache) === -1 && scroll_depth >= checkpoints[keys[i]]) {
					trackView('Percent Scrolled', keys[i], scroll_depth, timing);
					cache.push(keys[i]);
				}
			}

			for (var key in checkpoints) {
				if (checkpoints.hasOwnProperty(key) && $.inArray(key, cache) === -1 && scroll_depth >= checkpoints[key]) {
					trackView('Percent Scrolled', key, scroll_depth, timing);
					cache.push(key);
				}
			}
		}

		$w.on('scroll.tracking', _.throttle(function () {
			var doc_height = $(document).height(),	// makes sure lazy loaded stuff is taken into consideration
				win_height = window.innerHeight || $w.height(),	// < IE9 doesn't use window property
				scroll_depth = $w.scrollTop() + win_height,
				timing = (_.now() - startTime) / 1000, // In seconds
				checkpoints = {	// Same checkpoints as in Don's lib
					'10%': parseInt(doc_height * 0.10, 10),
					'25%': parseInt(doc_height * 0.25, 10),
					'50%': parseInt(doc_height * 0.5, 10),
					'75%': parseInt(doc_height * 0.75, 10),
					'90%': parseInt(doc_height * 0.9, 10),
					'100%': doc_height
				};

			if (cache.length >= 6) { // Unbind scroll once done
				$w.off('scroll.tracking');
				return;
			}

			if (options.track_percent_scrolled) {
				trackPercentScrolled(checkpoints, scroll_depth, timing);
			}
		}, 500));

	};

})(jQuery, window, document);
