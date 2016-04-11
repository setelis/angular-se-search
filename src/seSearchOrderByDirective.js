angular.module("seSearch.orderby", []).directive("seSearchOrderBy", function($parse) {
	"use strict";
	var CLASS_NAMES = {
		ORDER_SUPPORT: "seSearchOrderBy",
		ASCENDING: "seSearchOrderByAscending",
		DESCENDING: "seSearchOrderByDescending"
	};
	function serializeOrder(orderAsObject) {
		var PREFIXES = {
			"true": "",
			"false": "-"
		};
		return PREFIXES[orderAsObject.ascending] + orderAsObject.fieldName;
	}
	function deserializeOrder(orderAsString) {
		var result = {
			ascending: true,
			fieldName: orderAsString
		};
		if (orderAsString && ((orderAsString.indexOf("+") === 0) || (orderAsString.indexOf("-") === 0))) {
			if ((orderAsString.indexOf("-") === 0)) {
				result.ascending = false;
			}
			result.fieldName = orderAsString.substring(1);
		}
		return result;
	}
	function orderBy(scope, parsedFilter, fieldToOrder) {
		var currentValue = deserializeOrder(parsedFilter(scope));
		var newValue = {
			fieldName: fieldToOrder,
			ascending: true
		};
		if (currentValue.fieldName === fieldToOrder) {
			newValue.ascending = !currentValue.ascending;
		}
		parsedFilter.assign(scope, serializeOrder(newValue));
	}
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			function watchValue() {
				scope.$watch(attrs.seSearchOrderByModel, function(newValue) {
					var deserialized = deserializeOrder(newValue);

					if (deserialized.fieldName === attrs.seSearchOrderBy) {
						if (deserialized.ascending) {
							element.addClass(CLASS_NAMES.ASCENDING);
							element.removeClass(CLASS_NAMES.DESCENDING);
						} else {
							element.removeClass(CLASS_NAMES.ASCENDING);
							element.addClass(CLASS_NAMES.DESCENDING);
						}
					} else {
						element.removeClass(CLASS_NAMES.ASCENDING);
						element.removeClass(CLASS_NAMES.DESCENDING);
					}
				});
			}
			element.addClass(CLASS_NAMES.ORDER_SUPPORT);

			var parsedFilter = $parse(attrs.seSearchOrderByModel);
			element.on("click", function() {
				scope.$apply(function() {
					orderBy(scope, parsedFilter, attrs.seSearchOrderBy);
				});
			});

			watchValue();
		}
	};
});
