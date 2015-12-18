angular.module('seSearch.html', ['seSearchPagingDirective.html']);

angular.module('seSearchPagingDirective.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('seSearchPagingDirective.html',
    '<nav class="text-center" data-ng-show="seSearchPaging.pages"><ul class="pagination"><li data-ng-class="{\'disabled\' : !seSearchPaging.pages.prev}"><a aria-label="Previous" data-ui-sref=".(seSearchPaging.pages.prev || seSearchPaging.pages.all[0])"><span aria-hidden="true">&laquo;</span></a></li><li data-ng-repeat="page in seSearchPaging.pages.all track by $index" data-ng-class="{\'active\': seSearchPaging.response.navigation.from === page.from}"><a data-ui-sref=".(page)">{{$index + 1}}</a></li><li data-ng-class="{\'disabled\' : !seSearchPaging.pages.next}"><a aria-label="Next" data-ui-sref=".(seSearchPaging.pages.next || seSearchPaging.pages.all[seSearchPaging.pages.all.length-1])"><span aria-hidden="true">&raquo;</span></a></li></ul></nav>');
}]);
