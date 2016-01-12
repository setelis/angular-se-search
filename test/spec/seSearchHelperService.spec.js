describe("SeSearchHelperService", function () {
	"use strict";

	var SeSearchHelperService;
	var $state, $scope, $q, $location;
	var sourceFunc, holder, deferred;
	beforeEach(module("seSearch.helper"));

	function initVariables() {
		beforeEach(inject(function(_SeSearchHelperService_) {
			SeSearchHelperService = _SeSearchHelperService_;
		}));

		beforeEach(inject(function(_$state_, _$rootScope_, _$q_, _$location_) {
			$state = _$state_;
			$scope = _$rootScope_.$new();
			$q = _$q_;
			$location = _$location_;

			spyOn($location, "search").and.callFake(function(params) {
				_.forEach(params, function(nextValue, nextKey) {
					$state.params[nextKey] = nextValue;
				});
			});
		}));

		beforeEach(inject(function() {
			deferred = $q.defer();
			spyOn(deferred.promise, "then").and.callThrough();
			sourceFunc = jasmine.createSpy("sourceFunc").and.returnValue(deferred.promise);
			holder = {};
		}));
	}


	describe("Default configuration", function () {
		initVariables();

		describe("handleSearch", function () {
			it("should update filter when state.params are changed (include params defined in current state)", inject(function () {
				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				$state.params.some = "hello";
				$state.params.other = "notincluded";
				$state.current.params = {
					some: undefined
				};

				expect(holder.filter).not.toEqual($state.params);
				expect(holder.filter).not.toEqual(_.omit($state.params, "other"));

				$scope.$digest();

				expect(holder.filter).not.toEqual($state.params);
				expect(holder.filter).toEqual(_.omit($state.params, "other"));
			}));
			it("should convert date from url to filter", inject(function () {
				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				$state.params.some = "2016-01-12T16:29:31.787Z";
				$state.current.params = {
					some: {
						$$type: "DATE"
					}
				};

				expect(holder.filter).not.toEqual({some: new Date($state.params.some)});

				$scope.$digest();

				expect(holder.filter).toEqual({some: new Date($state.params.some)});
			}));

			it("should return search handler", inject(function () {
				holder.filter = {
					hello: "world"
				};

				var searchHandler = SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				expect(angular.isFunction(searchHandler.ensureResults)).toBe(true);
				expect(sourceFunc.calls.count()).toBe(0);
				$scope.$digest();
				expect(sourceFunc.calls.count()).toBe(1);
				expect(sourceFunc).toHaveBeenCalledWith(holder.filter);
				deferred.resolve({navigation:{}, data: []});
				$scope.$digest();
				expect(holder.searchResults.loaded).toBe(true);

				sourceFunc.calls.reset();
				expect(sourceFunc.calls.count()).toBe(0);
				searchHandler.search();
				expect(holder.searchResults.loaded).toBe(false);
				expect(sourceFunc.calls.count()).toBe(1);
				expect(sourceFunc).toHaveBeenCalledWith(holder.filter);

				deferred.resolve({navigation:{}, data: []});
				$scope.$digest();
				expect(holder.searchResults.loaded).toBe(true);
			}));

			it("should update url when filter is changed", inject(function () {
				var PARAMETER = {
					name: "some",
					value: "hello"
				};
				$state.current.params = {};
				$state.current.params[PARAMETER.name] = undefined;

				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				// url to model:
				$scope.$digest();

				holder.filter = {};
				holder.filter[PARAMETER.name] = PARAMETER.value;

				expect($state.params).not.toEqual(holder.filter);

				$scope.$digest();

				expect($state.params).not.toBe(holder.filter);
				expect($state.params).toEqual({some: "hello"});
			}));

			it("should update url when filter is changed - date support", inject(function () {
				$state.current.params = {
					some: {
						$$type: "DATE"
					}
				};

				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				// url to model:
				$scope.$digest();

				holder.filter = {
					some: new Date()
				};

				var expected = {some: holder.filter.some.toISOString()};

				expect($state.params).not.toEqual(expected);
				$scope.$digest();
				expect($state.params).toEqual(expected);
			}));
			it("should support custom filterFieldName (url>filter)", inject(function () {
				SeSearchHelperService.handleSearch($scope, sourceFunc, holder, {filterFieldName: "newFilterName"});
				$state.params.some = "hello";
				$state.params.other = "notincluded";
				$state.current.params = {
					some: undefined
				};

				expect(holder.newFilterName).not.toEqual($state.params);
				expect(holder.newFilterName).not.toEqual(_.omit($state.params, "other"));
				$scope.$digest();

				expect(holder.newFilterName).not.toEqual($state.params);
				expect(holder.newFilterName).toEqual(_.omit($state.params, "other"));
			}));
			it("should support custom filterFieldName (filter>url)", inject(function () {
				var PARAMETER = {
					name: "some",
					value: "hello"
				};
				SeSearchHelperService.handleSearch($scope, sourceFunc, holder, {filterFieldName: "otherFilterName"});
				holder.otherFilterName = {};
				holder.otherFilterName[PARAMETER.name] = PARAMETER.value;

				expect($state.params).not.toEqual(holder.otherFilterName);

				$scope.$digest();

				expect($state.params).not.toBe(holder.otherFilterName);
				expect($state.params).toEqual(holder.otherFilterName);
			}));
			it("should fetch data initially", inject(function () {
				holder.filter = {
					hello: "world"
				};

				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);

				expect(sourceFunc.calls.count()).toBe(0);

				$scope.$digest();

				expect(sourceFunc.calls.count()).toBe(1);
				expect(sourceFunc).toHaveBeenCalledWith(holder.filter);
			}));

			it("should fetch data when filter is changed", inject(function () {
				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				holder.filter = {
					hello: "world"
				};

				expect(sourceFunc.calls.count()).toBe(0);

				$scope.$digest();

				expect(sourceFunc.calls.count()).toBe(1);
				expect(sourceFunc).toHaveBeenCalledWith(holder.filter);
			}));
			it("handle loading flag with no searchResult", inject(function () {
				holder.filter = {
					hello: "world"
				};

				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);

				expect(sourceFunc.calls.count()).toBe(0);
				expect(holder.searchResults).toBeUndefined();
				expect(deferred.promise.then.calls.count()).toBe(0);
				$scope.$digest();

				expect(sourceFunc.calls.count()).toBe(1);
				expect(sourceFunc).toHaveBeenCalledWith(holder.filter);
				expect(holder.searchResults).toBeUndefined();
				expect(deferred.promise.then.calls.count()).toBe(1);

				deferred.resolve({navigation:{}, data: []});
				$scope.$digest();

				expect(holder.searchResults.loaded).toBe(true);
			}));
			it("handle loaded flag with searchResult", inject(function () {
				holder.filter = {
					hello: "world"
				};
				holder.searchResults = {};

				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);

				expect(sourceFunc.calls.count()).toBe(0);
				expect(holder.searchResults.loaded).toBeUndefined();
				expect(deferred.promise.then.calls.count()).toBe(0);
				$scope.$digest();

				expect(sourceFunc.calls.count()).toBe(1);
				expect(sourceFunc).toHaveBeenCalledWith(holder.filter);
				expect(holder.searchResults.loaded).toBe(false);
				expect(deferred.promise.then.calls.count()).toBe(1);

				deferred.resolve({navigation:{}, data: []});
				$scope.$digest();
				expect(holder.searchResults.loaded).toBe(true);
			}));

			it("should support custom resultsFieldName", inject(function () {
				holder.filterCustomName = {
					hello: "world"
				};
				holder.searchResultCustomName = {};

				SeSearchHelperService.handleSearch($scope, sourceFunc, holder,
					{filterFieldName: "filterCustomName", resultsFieldName: "searchResultCustomName"});

				expect(sourceFunc.calls.count()).toBe(0);
				expect(holder.searchResultCustomName.loaded).toBeUndefined();
				expect(deferred.promise.then.calls.count()).toBe(0);
				$scope.$digest();

				expect(sourceFunc.calls.count()).toBe(1);
				expect(sourceFunc).toHaveBeenCalledWith(holder.filterCustomName);
				expect(holder.searchResultCustomName.loaded).toBe(false);
				expect(deferred.promise.then.calls.count()).toBe(1);

				deferred.resolve({navigation:{}, data: []});
				$scope.$digest();
				expect(holder.searchResultCustomName.loaded).toBe(true);
			}));

			describe("searchResults", function () {
				it("should add prev link if from is different than 0", inject(function () {
					var RESPONSE = {
						navigation:{from: 2,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}],
							prev: {from: 0},
							next: {from: 4}
						}
					});
				}));
				it("should not add prev link if from is 0", inject(function () {
					var RESPONSE = {
						navigation:{from: 0,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}],
							next: {from: 2}
						}
					});
				}));

				it("should handle negative prev.from and wrong offseted 'from'", inject(function () {
					var RESPONSE = {
						navigation:{from: 1,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}],
							prev: {from: 0},
							next: {from: 2}
						}
					});
				}));

				it("should handle negative prev when from is outside", inject(function () {
					var RESPONSE = {
						navigation:{from: 120,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}],
							prev: {from: 8}
						}
					});
				}));
				it("should add next if there is more results", inject(function () {
					var RESPONSE = {
						navigation:{from: 4,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							prev: {from: 2},
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}],
							next: {from: 6}
						}
					});
				}));
				it("should not add next if there is no more results", inject(function () {
					var RESPONSE = {
						navigation:{from: 8,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							prev: {from: 6},
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}]
						}
					});
				}));
				it("should not add next if there is no more results and from is outside", inject(function () {
					var RESPONSE = {
						navigation:{from: 10,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							prev: {from: 8},
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}]
						}
					});
				}));

				it("should add pages - last page full", inject(function () {
					var RESPONSE = {
						navigation:{from: 0,max: 2,count: 10},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							next: {from: 2},
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}]
						}
					});
				}));
				it("should add pages - last page with one result", inject(function () {
					var RESPONSE = {
						navigation:{from: 0,max: 2,count: 9},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							next: {from: 2},
							all: [{from: 0}, {from: 2}, {from: 4}, {from: 6}, {from: 8}]
						}
					});
				}));

				it("should add pages - custom size", inject(function () {
					var RESPONSE = {
						navigation:{from: 6,max: 3,count: 12},
						data: []
					};

					SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
					$scope.$digest();
					deferred.resolve(RESPONSE);
					$scope.$digest();
					expect(holder.searchResults).toEqual({
						loaded: true,
						response: RESPONSE,
						pages: {
							prev: {from: 3},
							next: {from: 9},
							all: [{from: 0}, {from: 3}, {from: 6}, {from: 9}]
						}
					});
				}));

			});

		});
		describe("ensureResults", function () {
			it("should have ensure", inject(function () {
				holder.filter = {
					from: "8"
				};

				var searchHandler = SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				expect(angular.isFunction(searchHandler.ensureResults)).toBe(true);
			}));

			it("should change filter", inject(function () {
				holder.filter = {
					from: "8"
				};

				var searchHandler = SeSearchHelperService.handleSearch($scope, sourceFunc, holder);

				var response = {response: [], pages: {prev: {from: 6}}};
				response.response.navigation = {from: 8};

				expect(searchHandler.ensureResults(response)).toBe(response);

				expect(holder.filter.from).toBe("6");
			}));
			it("should not change filter if from is equal", inject(function () {
				holder.filter = {
					from: "8"
				};

				var searchHandler = SeSearchHelperService.handleSearch($scope, sourceFunc, holder);

				var response = {response: [], pages: {prev: {from: 6}}};
				response.response.navigation = {from: 6};

				expect(searchHandler.ensureResults(response)).toBe(response);

				expect(holder.filter.from).toBe("8");
			}));
			it("should not change filter if no prev page", inject(function () {
				holder.filter = {
					from: "8"
				};

				var searchHandler = SeSearchHelperService.handleSearch($scope, sourceFunc, holder);

				var response = {response: [], pages: {}};
				response.response.navigation = {from: 8};

				expect(searchHandler.ensureResults(response)).toBe(response);

				expect(holder.filter.from).toBe("8");
			}));
			it("should not change filter if there are results", inject(function () {
				holder.filter = {
					from: "8"
				};

				var searchHandler = SeSearchHelperService.handleSearch($scope, sourceFunc, holder);

				var response = {response: [{}], pages: {prev: {from: 6}}};
				response.response.navigation = {from: 8};

				expect(searchHandler.ensureResults(response)).toBe(response);

				expect(holder.filter.from).toBe("8");
			}));

		});
	});

	describe("Custom configuration", function () {

		beforeEach(function() {
			module(function(SeSearchHelperServiceProvider) {
				SeSearchHelperServiceProvider.setCustomizedOptions({filterFieldName: "newFilterName"});
			});
		});
		initVariables();

		describe("handleSearch", function () {
			it("should support custom filterFieldName (url>filter)", inject(function () {
				SeSearchHelperService.handleSearch($scope, sourceFunc, holder);
				$state.params.some = "hello";
				$state.params.other = "notincluded";
				$state.current.params = {
					some: undefined
				};

				expect(holder.newFilterName).not.toEqual($state.params);
				expect(holder.newFilterName).not.toEqual(_.omit($state.params, "other"));
				$scope.$digest();

				expect(holder.newFilterName).not.toEqual($state.params);
				expect(holder.newFilterName).toEqual(_.omit($state.params, "other"));
			}));

		});
	});

});
