angular.module("seSearchDemoApp", ["seSearch", "restangular", "ui.router"]).controller("SearchCtrl", function ($scope, Restangular, SeSearchHelperService) {
	"use strict";
	var controller = this;
	function goToServer(filter) {
		return Restangular.all("members").customGETLIST(null, filter);
	}
	SeSearchHelperService.handleSearch($scope, goToServer, controller);
}).config(function(RestangularProvider) {
	"use strict";
	// Set default server URL for 'members/' endpoint
	RestangularProvider.setBaseUrl("http://private-5d81b-sesearch.apiary-mock.com");
}).config(function($stateProvider) {
	"use strict";

	$stateProvider.state("search", {
		url: "?from&max&q&enabled",
		params: {
			from: {
				value: "0",
				squash: true
			},
			max: {
				value: "10",
				squash: true
			},
			// used in SeSearchHelperService.handleSearch() - see _.pick and _.keys
			q: undefined,
			enabled: undefined
		},
		reloadOnSearch: false,
		views: {
			"content": {
				// template is embeded so the demo can run without server - from filesystem
				// templateUrl: "search.html",
				controller: "SearchCtrl as searchCtrl"
			}
		}
	});
});
