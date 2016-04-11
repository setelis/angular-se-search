describe("seSearchOrderBy", function() {
	"use strict";

	var scope, $compile, element;
	beforeEach(module("seSearch.orderby"));
	beforeEach(inject(function(_$compile_, $rootScope) {
		scope = $rootScope.$new();
		$compile = _$compile_;

		scope.filter = {};
	}));

	function createOrderedAscending() {
		scope.filter.orderby = "hello";
		element = angular.element("<div data-se-search-order-by='hello' data-se-search-order-by-model='filter.orderby' ></div>");
		element = $compile(element)(scope);

		scope.$digest();
	}
	function createOrderedDescending() {
		scope.filter.orderby = "-hello";
		element = angular.element("<div data-se-search-order-by='hello' data-se-search-order-by-model='filter.orderby' ></div>");
		element = $compile(element)(scope);

		scope.$digest();
	}
	function createNotSorted() {
		element = angular.element("<div data-se-search-order-by='hello' data-se-search-order-by-model='filter.orderby' ></div>");
		element = $compile(element)(scope);

		scope.$digest();
	}

	describe("init state", function() {
		it("should add sortable class", function() {
			createNotSorted();
			expect(element.hasClass("seSearchOrderBy")).toBe(true);
		});
		it("should add ascending sorted", function() {
			createOrderedAscending();

			expect(element.hasClass("seSearchOrderBy seSearchOrderByAscending")).toBe(true);
		});
		it("should add descending sorted", function() {
			createOrderedDescending();

			expect(element.hasClass("seSearchOrderBy seSearchOrderByDescending")).toBe(true);
		});
	});

	describe("handle click", function() {
		it("should set ascending sorting if not sorted", function() {
			createNotSorted();
			element.triggerHandler("click");
			expect(scope.filter.orderby).toBe("hello");
			scope.$digest();
			expect(element.hasClass("seSearchOrderBy seSearchOrderByAscending")).toBe(true);
		});
		it("should set descending sorting if ascending", function() {
			createOrderedAscending();
			element.triggerHandler("click");
			expect(scope.filter.orderby).toBe("-hello");
			scope.$digest();
			expect(element.hasClass("seSearchOrderBy seSearchOrderByDescending")).toBe(true);
		});
		it("should set ascending sorting if descending", function() {
			createOrderedDescending();
			element.triggerHandler("click");
			expect(scope.filter.orderby).toBe("hello");
			scope.$digest();
			expect(element.hasClass("seSearchOrderBy seSearchOrderByAscending")).toBe(true);
		});
	});
	describe("watch changes", function() {
		it("added ascending sorting", function() {
			createNotSorted();
			scope.filter.orderby = "hello";
			scope.$digest();
			expect(element.hasClass("seSearchOrderBy seSearchOrderByAscending")).toBe(true);
		});
		it("added ascending sorting '+' support", function() {
			createNotSorted();
			scope.filter.orderby = "+hello";
			scope.$digest();

			expect(element.hasClass("seSearchOrderBy seSearchOrderByAscending")).toBe(true);
		});
		it("added descending sorting", function() {
			createNotSorted();
			scope.filter.orderby = "-hello";
			scope.$digest();

			expect(element.hasClass("seSearchOrderBy seSearchOrderByDescending")).toBe(true);
		});
		it("changed ascending -> descending sorting", function() {
			createOrderedAscending();
			scope.filter.orderby = "-hello";
			scope.$digest();
			expect(element.hasClass("seSearchOrderBy seSearchOrderByDescending")).toBe(true);
		});
		it("changed descending -> ascending sorting", function() {
			createOrderedDescending();
			scope.filter.orderby = "hello";
			scope.$digest();

			expect(element.hasClass("seSearchOrderBy seSearchOrderByAscending")).toBe(true);
		});
		it("changed descending -> ascending sorting '+' support", function() {
			createOrderedDescending();
			scope.filter.orderby = "+hello";
			scope.$digest();

			expect(element.hasClass("seSearchOrderBy seSearchOrderByAscending")).toBe(true);
		});
		it("removed descending sorting", function() {
			createOrderedDescending();
			scope.filter.orderby = "hello2";
			scope.$digest();

			expect(element.hasClass("seSearchOrderBy")).toBe(true);
		});
		it("removed ascending sorting", function() {
			createOrderedAscending();
			scope.filter.orderby = "-hello2";
			scope.$digest();
			expect(element.hasClass("seSearchOrderBy")).toBe(true);
		});

	});

});
