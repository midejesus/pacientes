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

pacientesApp.factory('trataDados', function () {
    
        function chavesTodas(dados){
            var i, keys =[];
            for(i=0; i<dados.length; i++){
               keys = keys.concat(Object.keys(dados[i]));
            }
            return unicos(keys);
        };

        function unicos(allKeys) {
            var seen = {};
            var out = [];
            var len = allKeys.length;
            var j = 0;
            for(var i = 0; i < len; i++) {
                 var item = allKeys[i];
                 if(seen[item] !== 1) {
                       seen[item] = 1;
                       out[j++] = item;
                 }
            }
            return out;
        };

        function nomesPacientes(dados){
            var c=[];
            for(var i=0, l=dados.length; i<l; i++){
                if(dados[i].numeroPaciente!==""){
                    c.push({id: i, numero: dados[i].numeroPaciente});
                }
                else{
                    c.push({id: i, numero: "Sem número"});
                }
            }
            return c;

        };
        function addId(dados){
            for(var i=0, l=dados.length; i<l; i++){
                    dados[i].id= i;
                }
            return dados;

        };
        
        function camposValores(obj){
            var d=[], chaves = Object.keys(obj);
            for(var i=0, l=chaves.length; i<l; i++){
                    d.push({campo: chaves[i], valor: obj[chaves[i]]});
            }
            return d;
            
        };
    
        function colunas(listakeys){
            var f=[];
                for(var i=0, l=listakeys.length; i<l; i++){
                    var aux = listakeys[i];
                    f.push({field: listakeys[i], 
                            title:  listakeys[i],
                            titleAlt: listakeys[i],
                            sortable:  listakeys[i],
                            show: false,
//                            filter: {listakeys[i] : 'text'}
                        });
                }
                return f;
        };
                           
        function addFilter(lista){
                for(var i=0, l=lista.length; i<l; i++){
                    lista[i].filter = {'lista[i].title' : 'text'}
                    }
               return lista;     
        };                  

    return {
        getAllKeys: chavesTodas, 
        getPacientes: nomesPacientes,
        getCamposValores: camposValores,
        getColunas: colunas,
        insertID: addId
    };
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


pacientesApp.controller('dataController',['$scope','NgTableParams', 'xmlData','trataDados',function($scope, NgTableParams, xmlData, trataDados){

    xmlData.getData.then(function(data){
        $scope.xmlData = data;
        $scope.listaPacientes = trataDados.getPacientes($scope.xmlData);
        $scope.usersTable = new NgTableParams({count:$scope.listaPacientes.length}, {counts: [], dataset: $scope.listaPacientes});
    });   
}]);

pacientesApp.controller('pacientesController',['$scope','NgTableParams', '$routeParams', 'xmlData','trataDados', function($scope, NgTableParams, $routeParams, xmlData, trataDados){
    xmlData.getData.then(function(data){
        $scope.xmlData = data;
        $scope.listaPacientes = trataDados.getPacientes($scope.xmlData);
        $scope.usersTable = new NgTableParams({count:$scope.listaPacientes.length}, {counts: [], dataset: $scope.listaPacientes});
    });    
    var users = [{name: "Moroni", age: 50}, {name: "michelly", age:23}/*,*/];
    var num = parseInt($routeParams.num);
    $scope.pacienteIndex = $scope.listaPacientes[num];
    $scope.pacienteAlvo = trataDados.getCamposValores($scope.xmlData[num]);
    $scope.dadosTable = new NgTableParams({count:25}, {counts: [],dataset: $scope.pacienteAlvo});
}]);

pacientesApp.controller('buscaController',['$scope','NgTableParams', 'xmlData','trataDados', function($scope, NgTableParams, xmlData, trataDados){
    xmlData.getData.then(function(data){
        $scope.xmlData = data;
        $scope.xmlData = trataDados.insertID($scope.xmlData);
        $scope.listaCampos = trataDados.getAllKeys($scope.xmlData);
        $scope.colunas = trataDados.getColunas($scope.listaCampos);
        $scope.colunas[220].show=true;
        $scope.filtroColuna = new NgTableParams({count:$scope.xmlData.length}, {counts: [],dataset: $scope.xmlData});
        $scope.listaCamposTable = new NgTableParams({count:$scope.colunas.length}, {counts: [],dataset: $scope.colunas});
        $scope.changeFilter = changeFilter;
        $scope.applyGlobalSearch = applyGlobalSearch;
        function applyGlobalSearch(){
            var term = $scope.globalSearchTerm;
            $scope.filtroColuna.filter({ $: term });
        }
        function changeFilter(field, value){
            var filter = {};
            filter[field] = value;
            angular.extend($scope.filtroColuna.filter(), filter);
        };
     
    });    
}]);
