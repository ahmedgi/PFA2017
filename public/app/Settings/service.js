app.factory("settingFactory", function ($http) {

  this.getListProf = function () {
    return $http
    ({
      method: "GET",
      url: "/profs"//Settings/prof.json
    }).then(function mySucces(res) {
      if (res.data.info == "non_auto") {
        //alert("vous n'avez pas le droit");
        console.log("vous n'avez pas le droit");
        return [];
      }
      else return res.data.data;

    });
  }

  this.getListMatiere = function () {
    return $http
    ({
      method: "GET",
      url: "/matieres"//Settings/matiere.json
    }).then(function mySucces(res) {
      if (res.data.info == "non_auto") {
        console.log("vous n'avez pas le droit");
        return [];
      } else
        return res.data.matieres;

    });
  }
  this.getParametre = function () {
    return $http({
      method: "GET",
      url: "/parametres"
    }).then(function success(res) {
      if (res.data.info == "non_auto") {
        console.log("vous n'avez pas le droit");
        return [];
      } else
        return res.data.data;
    });
  }

  return this;
});

app.service('multipartForm', ['$http', function ($http) {
  this.post = function (uploadUrl, data) {
    var fd = new FormData();
    for (var key in data)
      fd.append(key, data[key]);
    $http.post(uploadUrl, fd, {
      transformRequest: angular.indentity,
      headers: {'Content-Type': undefined}
    }).then(
      function success(res) {
        alert(JSON.stringify(res.data));
      }, function err(res) {
        alert(JSON.stringify(res.data.err));
      });
  }
}])

app.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function () {
        scope.$apply(function () {
          modelSetter(scope, element[0].files[0]);
        })
      })
    }
  }
}])
