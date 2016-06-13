(function() {
	"use strict";
	// because lodash caches functions for Date.now(), setTimeout(), etc at startup

	var increment = 0;
	var OriginalDate = window.Date;

	var MockDate = function() {
		var result = new OriginalDate();

		var oldGetTime = result.getTime;
		result.getTime = function() {
			return oldGetTime.apply(result) + increment;
		};

		return result;
	};

	MockDate.prototype = OriginalDate.prototype;
	MockDate.now = function() {
		return new MockDate().getTime();
	};
	MockDate.$$incrementNow = function(ms) {
		increment += ms;
	};

	window.Date = MockDate;

	/* TODO incrementReset
	Date.$$incrementReset = function(ms) {
		increment = 0;
	};
	*/
})();
