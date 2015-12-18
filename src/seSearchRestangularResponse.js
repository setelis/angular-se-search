angular.module("seSearch.restangularresponse", ["restangular"]).config(function(RestangularProvider) {
	"use strict";
	RestangularProvider.addResponseInterceptor(function(data, operation) {
		if (operation !== "getList" || !data.data) {
			return data;
		}

		var result = data.data;
		result.navigation = data.navigation;
		return result;
	});
});
