angular.module("seSearch.helper", ["ui.router"]).provider("SeSearchHelperService", function SeSearchHelperServiceProvider() {
	"use strict";
	var provider = this;
	function SeSearchHelperService($state, $location, CONFIGURED_OPTIONS) {
		var service = this;

		function attachMethods() {
			service.handleSearch = function($scope, sourceFunc, holder, options) {
				var effectiveOptions = _.assign({}, CONFIGURED_OPTIONS, options);

				// params should be configured in $state provider!
				function urlToFilter() {
					// if you change this implementation - remove data-ce-undefined-if-empty
					holder[effectiveOptions.filterFieldName] = _.pick($state.params, _.keys($state.current.params));
				}
				function filterToUrl() {
					// if you change this implementation - remove data-ce-undefined-if-empty
					$location.search(_.pick(holder[effectiveOptions.filterFieldName], _.keys($state.current.params)));
				}


				function fetch(newFilter) {
					filterToUrl();
					if (holder[effectiveOptions.resultsFieldName]) {
						holder[effectiveOptions.resultsFieldName].loaded = false;
					}
					return sourceFunc(newFilter).then(function(response) {
						var result = effectiveOptions.resultProcessor(response);
						holder[effectiveOptions.resultsFieldName] = result;
						return result;
					});
				}
				$scope.$watchCollection(function() {return $state.params;}, urlToFilter);
				$scope.$watchCollection(function() {return holder[effectiveOptions.filterFieldName];}, fetch);

				return {
					search: function() {
						return fetch(holder[effectiveOptions.filterFieldName]);
					},
					ensureResults: function(response) {
						if (response.response.length === 0 && response.pages.prev &&
							response.pages.prev.from !== response.response.navigation.from) {
							// to make it string (if not string - search will be toggled twice)
							holder[effectiveOptions.filterFieldName].from = "" + response.pages.prev.from;
						}
						return response;
					}
				};
			};
		}

		attachMethods();

	}

	var DEFAULT_OPTIONS = {
		filterFieldName: "filter",
		resultsFieldName: "searchResults",
		resultProcessor: function searchResults(response) {
			var result = {
				loaded: true,
				response: response,
				pages: {
					prev: null,
					next: null,
					all: []
				}
			};

			for(var i = 0; i < response.navigation.count;i += response.navigation.max) {
				result.pages.all.push({from: i});
			}
			result.pages.prev = angular.copy(_.findLast(result.pages.all, function(page) {
				return page.from < response.navigation.from;
			}));
			if (!result.pages.prev) {
				delete result.pages.prev;
			}

			result.pages.next = angular.copy(_.find(result.pages.all, function(page) {
				return page.from > response.navigation.from;
			}));
			if (!result.pages.next) {
				delete result.pages.next;
			}

			return result;
		}
	};
	var customizedOptions;

	provider.setDefaultOptions = function(options) {
		customizedOptions = options;
	};
	provider.$get = ["$state", "$location", function SeSearchHelperServiceFactory($state, $location) {
		var effectiveOptions = _.assign({}, DEFAULT_OPTIONS, customizedOptions);

		return new SeSearchHelperService($state, $location, effectiveOptions);
	}];
});
