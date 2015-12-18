angular.module("seSearch.paging", ["seSearch.html"]).directive("seSearchPaging", function () {
	"use strict";
	return {
		restrict: "A",
		scope: {
			seSearchPaging: "="
		},
		templateUrl: "seSearchPagingDirective.html"
	};
});
