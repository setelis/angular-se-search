angular.module("seSearch.helper", ["ui.router"]).provider("SeSearchHelperService", function SeSearchHelperServiceProvider() {
	"use strict";
	var provider = this;
	function SeSearchHelperService($state, $location, CONFIGURED_OPTIONS) {
		var service = this;

		function attachMethods() {
			service.handleSearch = function($scope, sourceFunc, holder, options) {
				var effectiveOptions = _.assign({}, CONFIGURED_OPTIONS, options);

				// params should be configured in $state provider!

				function convertTypes(paramValues, methodName) {
					function convertValue(value, config) {
						config = config || {};
						var converter = effectiveOptions.converters[config.$$type];
						if (!converter) {
							throw "SeSearchHelperService: urlToFilter: no converter for type: "+config.$$type;
						}
						return converter[methodName](value);
					}
					function getParamsConfiguration() {
						function getParentNames() {
							var splitted = $state.current.name.split(".");

							var result = [];
							var lastValue = "";
							_.forEach(splitted, function(nextValue, nextIndex) {
								if (nextIndex === splitted.length - 1) {
									// do not include current state
									return false;
								}
								lastValue = lastValue + nextValue;
								result.push(lastValue);

								lastValue = lastValue + ".";
							});
							return result;
						}
						var result = {};
						// get parent value, than overide by current
						_.forEach(getParentNames(), function(nextValue) {
							_.assign(result, $state.get(nextValue).params);
						});
						_.assign(result, $state.current.params);
						return result;
					}
					var result = {};
					_.forEach(getParamsConfiguration(), function(nextValue, nextKey) {
						var value = paramValues[nextKey];
						result[nextKey] = convertValue(value, nextValue);
					});
					return result;
				}

				function urlToFilter() {
					holder[effectiveOptions.filterFieldName] = convertTypes($state.params, "fromString");
				}
				function filterToUrl() {
					$location.search(convertTypes(holder[effectiveOptions.filterFieldName], "toString"));
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
		},
		converters: {
			DATE: {
				fromString: function(asString) {
					if (!asString) {
						return;
					}
					return new Date(asString);
				},
				toString: function(value) {
					if (!value) {
						return;
					}
					return value.toISOString();
				}
			}
		}
	};
	// How to set undefined key in object definition?
	DEFAULT_OPTIONS.converters[undefined] = {
		fromString: function(asString) {
			if (asString === "") {
				return;
			}
			return asString;
		},
		toString: function(value) {
			if (value === "") {
				return;
			}
			return value;
		}
	};
	var customizedOptions;

	provider.setCustomizedOptions = function(options) {
		customizedOptions = options;
	};
	provider.getDefaultOptions = function() {
		return angular.copy(DEFAULT_OPTIONS);
	};
	provider.$get = ["$state", "$location", function SeSearchHelperServiceFactory($state, $location) {
		var effectiveOptions = _.assign({}, DEFAULT_OPTIONS, customizedOptions);

		return new SeSearchHelperService($state, $location, effectiveOptions);
	}];
});
