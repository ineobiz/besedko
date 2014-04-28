'use strict';

describe('Controller: MobileCtrl', function () {

  // load the controller's module
  beforeEach(module('webApp'));

  var MobileCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MobileCtrl = $controller('MobileCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
