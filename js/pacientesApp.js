var pacientesApp = angular.module('pacientesApp', ['ngTable','ngRoute','ui.bootstrap']);

pacientesApp.config(function ($routeProvider,$locationProvider) {
    
    $locationProvider.hashPrefix('');
    $routeProvider
    
    .when('/',{
        templateUrl: 'main.html'
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

pacientesApp.service('xmlData',function($http){
    this.getData  = $http.get('js/pacientes.xml',{
            transformResponse : function(data) {
                var x2js = new X2JS();
                var jsonfromxml = x2js.xml_str2json(data); // XML string document object -> Json
                return jsonfromxml.doc.paciente; // retorna apenas a lista de pacientes, sem a raiz 'doc'
            }
        }).then(function successCallback(response) {
            return response.data;
        }); 
    
});

pacientesApp.service('allData', function(xmlData){
        xmlData.getData.then(function(data){
        this.xmlData = data;
        this.allKeys= function(){
            var i, keys =[];
            for(i=0; i<$this.xmlData.length; i++){
               keys = keys.concat(Object.keys($this.xmlData[i]));
            }
            return keys;
        };
        
        function unicas() {
            var seen = {};
            var out = [];
            var len = $scope.allKeys().length;
            var j = 0;
            for(var i = 0; i < len; i++) {
                 var item = $scope.allKeys()[i];
                 if(seen[item] !== 1) {
                       seen[item] = 1;
                       out[j++] = item;
                 }
            }
            return out;
        };
        
        function nomesPacientes(){
            c=[];
            for(var i=0, l=$scope.xmlData.length; i<l; i++){
                if($scope.xmlData[i].numeroPaciente!==""){
                    c.push({id: i, numero: $scope.xmlData[i].numeroPaciente});
                }
                else{
                    c.push({id: i, numero: "Sem número"});
                }
            }
            return c;
            
        };
        
        function toObject() {
            var el = {}, aux =[];
            for (var i = 0, l = unicas2Obj.length; i < l; ++i){
                aux.push({name:unicas2Obj[i]});
            }
            return aux;
        };
        var unicas2Obj = unicas();
        this.nomePacientes = nomesPacientes();
        this.keys = unicas();            
//        console.log($scope.nomePacientes); 
        //data set aceita tanto arrays simples como array de objetos.
    });
});

pacientesApp.controller('alertController',['$scope',function($scope){
    $scope.alertClass = "";
    $scope.closeAlert = function() {
        $scope.alertClass = 'ng-hide';
    };
    
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


pacientesApp.controller('dataController',['$scope','NgTableParams', 'xmlData',function($scope,NgTableParams,xmlData){

    xmlData.getData.then(function(data){
        $scope.xmlData = data;
        $scope.allKeys= function(){
            var i, keys =[];
            for(i=0; i<$scope.xmlData.length; i++){
               keys = keys.concat(Object.keys($scope.xmlData[i]));
            }
            return keys;
        };
        
        function unicas() {
            var seen = {};
            var out = [];
            var len = $scope.allKeys().length;
            var j = 0;
            for(var i = 0; i < len; i++) {
                 var item = $scope.allKeys()[i];
                 if(seen[item] !== 1) {
                       seen[item] = 1;
                       out[j++] = item;
                 }
            }
            return out;
        };
        
        function nomesPacientes(){
            c=[];
            for(var i=0, l=$scope.xmlData.length; i<l; i++){
                if($scope.xmlData[i].numeroPaciente!==""){
                    c.push({id: i, numero: $scope.xmlData[i].numeroPaciente});
                }
                else{
                    c.push({id: i, numero: "Sem número"});
                }
            }
            return c;
            
        };
        
        var unicas2Obj = unicas();
        function toObject() {
            var el = {}, aux =[];
            for (var i = 0, l = unicas2Obj.length; i < l; ++i){
                aux.push({name:unicas2Obj[i]});
            }
            return aux;
        };
        
        $scope.nomePacientes = nomesPacientes();
        $scope.keys = unicas();            
//        console.log($scope.nomePacientes);
        $scope.usersTable = new NgTableParams({}, {counts: [], dataset: $scope.nomePacientes}); 
        //data set aceita tanto arrays simples como array de objetos.
    });
     $scope.usersTable = new NgTableParams({}, {counts: [], dataset: $scope.nomePacientes});
}]);

pacientesApp.controller('pacientesController',['$scope','NgTableParams', '$routeParams', function($scope,NgTableParams,$routeParams){
    var users = [{name: "Moroni", age: 50}, {name: "michelly", age:23}/*,*/];
    $scope.usersTable = new NgTableParams({}, {counts: [],dataset: users});
    $scope.tableIndex = parseInt($routeParams.num);
    console.log($scope.tableIndex);
    
}]);

pacientesApp.controller('buscaController',['$scope','NgTableParams',function($scope,NgTableParams){
    
}]);
