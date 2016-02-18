/**
 * @ngdoc module
 * @name material.components.showHide
 */

// Add additional handlers to ng-show and ng-hide that notify directives
// contained within that they should recompute their size.
// These run in addition to Angular's built-in ng-hide and ng-show directives.
angular.module('material.components.showHide', [
  'material.core'
])
  .directive('ngShow', createDirective('ngShow', true))
  .directive('ngHide', createDirective('ngHide', false));


function createDirective(name, targetValue) {
  return ['$mdUtil', '$mdResize', function($mdUtil, $mdResize) {
    return {
      restrict: 'A',
      multiElement: true,
      link: function(scope, element, attr) {
        $mdResize.addResizer(scope);

        var cachedTransitionStyles = window.getComputedStyle(element[0]);

        scope.$watch(attr[name], function(value) {
          if (!!value === targetValue) {
            if ($mdResize.hasListeners(scope)) {
              $mdResize.fireResize(scope);

              var opts = {
                cachedTransitionStyles: cachedTransitionStyles
              };

              $mdUtil.dom.animator.waitTransitionEnd(element, opts).then(function() {
                $mdResize.fireResize(scope);
              });
            }
          }
        });
      }
    };
  }];
}