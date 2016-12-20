//var Chaves = uniq_fast(listKeys());
//Forma de chamar valor de json: array['keyname']
//for(var i=0; i < Chaves.length; i++){
//    console.log(Chaves[i] + " : " + pacientesJson.doc.paciente[0][Chaves[i]]);
//}

var pacientesApp = angular.module('pacientesApp', ['ngTable','ngRoute','ui.bootstrap']);

pacientesApp.config(function ($routeProvider,$locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
    .when('/',{
        templateUrl: 'main.html',
        controller: 'mainController'
    })
    .when('/paciente/:num',{
        templateUrl: 'pacientes.html',
        controller: 'pacientesController'
    })
    
    .when('/busca/',{
        templateUrl: 'busca.html',
        controller: 'buscaController'
    })
});

pacientesApp.service('xmlData',function(){
    
    var getData = function (){
    
        $http({method:'GET', url: 'js/pacientes.xml',
        transformResponse : function(data) {
            var x2js = new X2JS();
            var jsonfromxml = x2js.xml2json(xmlDoc);
            // string -> XML document object
            return jsonfromxml.doc.paciente;
        }
    }).then(function successCallback(response) {
        return response.data;
    }); 
    };
    
    var listaChaves = function (lista){
        var i, j, keys =[];
        for(i=0; i<lista.length; i++){
            for(j=0; j<lista[i].childElementCount; j++)
                {
                    keys.push(lista[i].children[j].tagName);
                }
        }

        return keys;
    };
    
    var chavesUnicas = function (a) {
        var seen = {};
        var out = [];
        var len = a.length;
        var j = 0;
        for(var i = 0; i < len; i++) {
             var item = a[i];
             if(seen[item] !== 1) {
                   seen[item] = 1;
                   out[j++] = item;
             }
        }
        return out;
    };
    
    this.dadosPacientes = getData();
    this.dadosPacientes.then()
});

pacientesApp.controller('pacientesController',['$scope','NgTableParams', '$routeParams',function($scope,NgTableParams,$routeParams){
    var users = [{name: "Moroni", age: 50}, {name: "michelly", age:23}/*,*/];
    $scope.usersTable = new NgTableParams({}, {counts: [],dataset: users});
    $scope.tableIndex = parseInt($routeParams.num);
    
}]);

pacientesApp.controller('buscaController',['$scope','NgTableParams',function($scope,NgTableParams){
    
}]);

pacientesApp.controller('tabController',['$scope',function($scope){
    $scope.tabs = [
        { title:'Visualizar Cadastrados', icon:'glyphicon glyphicon-th-list', href:"#/"},
        { title:'Realizar Busca', icon:'glyphicon glyphicon-search', href:"#/busca/", disabled: true }
    ];
    $scope.changeHash = function(data) {
        window.location.hash = data;
    };
}]);

pacientesApp.controller('alertController',['$scope',function($scope){
    $scope.alertClass = "";

  $scope.closeAlert = function() {
    $scope.alertClass = 'ng-hide';
      };
    
}]);

pacientesApp.controller('mainController', ['$scope','NgTableParams', '$http', function($scope, NgTableParams,$http) {
    var users = [{name: "Moroni", age: 50}, {name: "michelly", age:23}/*,*/];
    $scope.usersTable = new NgTableParams({}, {counts: [],dataset: users});
//    console.log($scope.dadosPacientes);
//    $scope.uniquePacientes = uniq_fast(listKeys($scope.dadosPacientes));
    
//    console.log($scope.uniquePacientes);
}]);

