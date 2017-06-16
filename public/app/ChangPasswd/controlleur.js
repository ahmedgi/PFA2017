var app = angular.module('app', []);
app.directive('validPasswordC', function () {
  return {
    require: 'ngModel',
    scope: {

      reference: '=validPasswordC'

    },
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue, $scope) {

        var noMatch = viewValue != scope.reference
        ctrl.$setValidity('noMatch', !noMatch);
        return (noMatch) ? noMatch : !noMatch;
      });

      scope.$watch("reference", function (value) {
        ;
        ctrl.$setValidity('noMatch', value === ctrl.$viewValue);

      });
    }
  }
});

app.controller("resetController", ["$scope", "$http", "$window", function ($scope, $http, $window) {
  $scope.sendLoginCreditentials = function () {
    var loginData = {
      login: "admin",
      password: $scope.password
    };
    $http({
        method: "POST",
        data: loginData,
        url: "/ChangPassword/admin"
      }
    ).then(function success(res) {
      if (res.data.ok == "success") {
        $window.location.href = "/app";
      }
      else if (res.data.err) alert(JSON.stringify(res.data.err));
      else alert(JSON.stringify(res.data.err));
    });
  };

}]);
