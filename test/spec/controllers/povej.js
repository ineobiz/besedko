'use strict';

describe('Controller: PovejCtrl', function () {

  // load the controller's module
  beforeEach(module('webApp'));

  var PovejCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PovejCtrl = $controller('PovejCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
