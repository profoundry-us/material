angular.module('material.core')
  .factory('$mdResize', MdResize);

/**
 * Resizer service that will notify children when a parent makes a change that may affect children.
 * Currently, this is used internally with the ngShow/ngHide directives to notify children that they
 * should hide/show themselves.
 * 
 * @returns MdResize
 * @constructor
 */
function MdResize() {
  return {
    /**
     * Register a new resizer with this service.
     *
     * @param scope The scope of the resizer.
     * @returns {remove} The function which will de-register this component. This
     * is automatically called if the scope is destroyed.
     */
    addResizer: function(scope) {
      if (!scope.$$mdResizers) {
        scope.$$mdResizers = [];
      }

      var resizer = new MdResizer(scope);

      scope.$$mdResizers.push(resizer);

      scope.$on('$destroy', function() {
        remove();
      });

      return remove;

      function remove() {
        if (scope.$$mdResizers && scope.$$mdResizers.length) {
          var index = scope.$$mdResizers.indexOf(resizer);

          if (index != -1) {
            resizer.destroy();
            scope.$$mdResizers.slice(index, 1);
          }
        }
      }
    },

    /**
     * Registers a new resize listener with this service.
     *
     * @param scope The scope of the listener, so we can search the scope hierarchy for resizers.
     * @param callback The listener function which should be called when a resize is fired.
     * @returns {removeListener} The function which will de-register this listener. This
     * is automatically called if the scope is destroyed.
     *
     * NOTE: May return `null` if no parent resizer was found.
     */
    addListener: function(scope, callback) {
      var resizers = getSelfOrParentResizers(scope);

      if (resizers && resizers.length) {
        angular.forEach(resizers, function(resizer){
          resizer.addListener(callback);

          scope.$on('$destroy', function() {
            resizer.removeListener(callback);
          });
        });

        return removeListeners;
      }

      return null;

      function removeListeners(callback) {
        angular.forEach(resizers, function(resizer){
          resizer.removeListener(callback);
        });
      }
    },

    /**
     * Returns true if there are resize listeners added on this scope.
     *
     * @param scope
     * @returns {*}
     */
    hasListeners: function(scope) {
      var resizers = getSelfOrParentResizers(scope);

      return resizers && resizers.some(function(resizer) { return resizer.hasListeners() });
    },

    /**
     * Fires the resize event and notifies any children and any listeners.
     *
     * @param scope The scope which was added as a resizer with this service.
     */
    fireResize: function(scope) {
      var resizers = getSelfOrParentResizers(scope);

      if (resizers && resizers.length) {
        angular.forEach(resizers, function(resizer) { resizer.fire() });
      }
    }
  };
}

function MdResizer(scope) {
  this.scope = scope;
  this.parent = null;
  this.children = [];
  this.listeners = [];

  this.linkWithParents();
}

MdResizer.prototype.destroy = function() {
  if (this.parent) {
    this.parent.removeChild(this);
  }
  this.parent = null;
};

MdResizer.prototype.linkWithParents = function() {
  this.parents = getSelfOrParentResizers(this.scope);

  if (this.parents) {
    angular.forEach(this.parents, function(parent) {
      parent.addChild(this);
    });
  }
};

MdResizer.prototype.addChild = function(child) {
  var index = this.children.indexOf(child);

  if (index === -1) {
    this.children.push(child);
  }
};

MdResizer.prototype.removeChild = function(child) {
  var index = this.children.indexOf(child);

  if (index !== -1) {
    this.children.slice(index, 1);
  }
};

MdResizer.prototype.addListener = function(listener) {
  var index = this.listeners.indexOf(listener);

  if (index === -1) {
    this.listeners.push(listener);
  }
};

MdResizer.prototype.removeListener = function(listener) {
  var index = this.listeners.indexOf(listener);

  if (index !== -1) {
    this.listeners.slice(index, 1);
  }
};

MdResizer.prototype.hasListeners = function() {
  return this.listeners.length > 0;
};

MdResizer.prototype.fire = function() {
  // Fire any listeners
  this.listeners.forEach(function(listener) {
    listener();
  });

  // Tell any children to fire their listeners (and their children)
  this.children.forEach(function(child) {
    child.fire();
  });
};

function getSelfOrParentResizers(scope) {
  var parent = scope;

  while (parent && parent !== parent.$parent) {
    if (parent.$$mdResizers) {
      return parent.$$mdResizers;
    }

    parent = parent.$parent;
  }

  return null;
}
