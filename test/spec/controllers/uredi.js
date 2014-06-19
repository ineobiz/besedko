'use strict';

describe('Controller: UrediCtrl', function () {

  // load the controller's module
  beforeEach(module('webApp'));

  var UrediCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UrediCtrl = $controller('UrediCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
