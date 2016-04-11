describe('showHide', function() {
  var $compile, $timeout, $mdResize, defered, scope, listenerSpy;

  beforeEach(module('material.components.showHide'));

  beforeEach(inject(function(_$compile_, $mdUtil, $q, $rootScope, _$timeout_, _$mdResize_) {
    $compile = _$compile_;
    $timeout = _$timeout_;
    $mdResize = _$mdResize_;
    defered = $q.defer();
    scope = $rootScope.$new();
    listenerSpy = jasmine.createSpy('listener');

    //scope.$on('$md-resize', spy);
    spyOn($mdUtil.dom.animator, 'waitTransitionEnd').and.returnValue(defered.promise);
  }));

  afterEach(function() {
    scope.$destroy();
  });

  describe('ng-hide', function() {
    fit('should notify when the node unhides', function() {
      scope.hide = true;
      
      $mdResize.addListener(scope, listenerSpy);
      
      var element = $compile('<div ng-hide="hide"></div>')(scope);
      scope.$apply();
      expect(listenerSpy).not.toHaveBeenCalled();

      // Expect a notification when showing.
      scope.hide = false;
      scope.$apply();
      $timeout.flush();
      expect(listenerSpy).toHaveBeenCalled();

      // Expect a $broadcast on transitionEnd after showing.
      listenerSpy.calls.reset();
      defered.resolve();
      scope.$apply();
      expect(listenerSpy).toHaveBeenCalled();
    });

    it('should not notify on hide', function() {
      scope.hide = true;
      var element = $compile('<div ng-hide="hide"></div>')(scope);
      scope.$broadcast('$md-resize-enable');
      scope.$apply();

      // Expect no $broadcasts when hiding.
      expect(spy).not.toHaveBeenCalled();
      defered.resolve();
      scope.$apply();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not notify when not activated', function() {
      scope.hide = true;
      var element = $compile('<div ng-hide="hide"></div>')(scope);
      scope.$apply();
      expect(spy).not.toHaveBeenCalled();

      scope.hide = false;
      scope.$apply();
      $timeout.flush();
      expect(spy).not.toHaveBeenCalled();

      spy.calls.reset();
      defered.resolve();
      scope.$apply();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('ng-show', function() {
    it('should notify when the node unhides', function() {
      scope.show = false;
      var element = $compile('<div ng-show="show"></div>')(scope);
      scope.$broadcast('$md-resize-enable');
      scope.$apply();
      expect(spy).not.toHaveBeenCalled();

      // Expect a $broadcast when showing.
      scope.show = true;
      scope.$apply();
      $timeout.flush();
      expect(spy).toHaveBeenCalled();

      // Expect a $broadcast on transitionEnd after showing.
      spy.calls.reset();
      defered.resolve();
      scope.$apply();
      expect(spy).toHaveBeenCalled();
    });

    it('should not notify on hide', function() {
      scope.show = false;
      var element = $compile('<div ng-show="show"></div>')(scope);
      scope.$broadcast('$md-resize-enable');
      scope.$apply();

      // Expect no $broadcasts when hiding.
      expect(spy).not.toHaveBeenCalled();
      defered.resolve();
      scope.$apply();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not notify when not activated', function() {
      scope.show = false;
      var element = $compile('<div ng-show="show"></div>')(scope);
      scope.$apply();
      expect(spy).not.toHaveBeenCalled();

      scope.show = true;
      scope.$apply();
      $timeout.flush();
      expect(spy).not.toHaveBeenCalled();

      spy.calls.reset();
      defered.resolve();
      scope.$apply();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
