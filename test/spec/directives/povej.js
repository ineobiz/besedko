'use strict';

describe('Directive: povej', function () {

  // load the directive's module
  beforeEach(module('webApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<povej></povej>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the povej directive');
  }));
});
