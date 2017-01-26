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
    //Esse servico retorna a lista de pacientes a partir do XML. Cada paciente eh um objeto. 
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
    
        function chavesToColunas(dados, estado ){
            var i, keys =[], seen ={}, unicas=[];
            for(i=0; i<dados.length; i++){
               keys = keys.concat(Object.keys(dados[i]));
            }
            
            //o loop abaixo filtra as chaves unicas 
            var len = keys.length, j=0;
            for(var i = 0; i < len; i++) {
                 var item = keys[i];
                 if(seen[item] !== 1) {
                       seen[item] = 1;
                       unicas[j++] = item;
                 }
            }
            //o loop abaixo adiciona os campos de configuração das colunas
            var colunas=[];
                for(var i=0, l=unicas.length; i<l; i++){
                    var aux = unicas[i];
                    colunas.push({field: unicas[i], 
                            title:  unicas[i],
                            show: estado,
                            filter: undefined
                        });
                }
            return colunas;
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
            var nova = []
            for(var i=0, l=dados.length; i<l; i++){
                   var old_object = dados[i];
                var new_object = {}; 
                new_object.id = i; // The property we need at the start 
                for (var key in old_object) { // Looping through all values of the old object 
                    new_object[key] = old_object[key];
                } 
                nova.push(new_object); // Replacing the old object with the desired one
            }
            return nova;
        };
        
        function camposValores(obj){
            var d=[], chaves = Object.keys(obj);
            for(var i=0, l=chaves.length; i<l; i++){
                    d.push({campo: chaves[i], valor: obj[chaves[i]]});
            }
            return d;
            
        };
                           
        function addFilter(lista){
                for(var i=0, l=lista.length; i<l; i++){
                    lista[i].filter = {'lista[i].title' : 'text'}
                    }
               return lista;     
        };                  

    return {
        getHeaders: chavesToColunas, 
        getPacientes: nomesPacientes,
        getCamposValores: camposValores,
        insertID: addId
    };
});

pacientesApp.controller('alertController',['$scope',function($scope){
    $scope.alertClass = "";
    $scope.closeAlert = function() {
        $scope.alertClass = 'ng-hide';
    };
    
}]);

pacientesApp.controller('tabController',['$scope', '$location',function($scope, $location){
    $scope.tabs = [
        { title:'Visualizar Cadastrados', icon:'glyphicon glyphicon-th-list', href:"/"},
        { title:'Realizar Busca', icon:'glyphicon glyphicon-search', href:"/busca/", disabled: true }
    ];
    
    function getHash(data) {
        window.location.hash = data;
    };
    $scope.changeHash = function(data) {
       $location.path(data);
    };
}]);


pacientesApp.controller('dataController',['$scope','NgTableParams', 'xmlData','trataDados',function($scope, NgTableParams, xmlData, trataDados){
    xmlData.getData.then(function(data){
        $scope.xmlData = data;
        $scope.buscaData=trataDados.insertID($scope.xmlData);
        $scope.listaPacientes = trataDados.getPacientes($scope.xmlData);
        $scope.pacientesTable = new NgTableParams({count:$scope.listaPacientes.length}, {counts: [], dataset: $scope.listaPacientes});
        $scope.camposColunas = trataDados.getHeaders($scope.buscaData, false);
    });   
}]);

pacientesApp.controller('pacientesController',['$scope','NgTableParams', '$routeParams', 'xmlData','trataDados', function($scope, NgTableParams, $routeParams, xmlData, trataDados){  
    var num = parseInt($routeParams.num);
    $scope.pacienteIndex = $scope.listaPacientes[num];
    $scope.pacienteAlvo = trataDados.getCamposValores($scope.xmlData[num]);
    $scope.dadosTable = new NgTableParams({count:25}, {counts: [],dataset: $scope.pacienteAlvo});
}]);

pacientesApp.controller('buscaController',['$scope','NgTableParams', 'xmlData','trataDados', function($scope, NgTableParams, xmlData, trataDados){
    $scope.camposColunas[0].show=true; // para deixar o id marcado na tabela de seleção de colunas
    $scope.listaCamposTable = new NgTableParams({count:13}, {counts: [],dataset: $scope.camposColunas}); //parametros da tabela de seleção de colunas
    $scope.selected = ['id'];
    function slice(object, keys) {
        //essa função serve para filtrar a tabela de dados geral(object), retornando uma tabela com apenas as colunas selecionadas (keys)
        return Object.keys(object)
            .filter(function (key) {
                return keys.indexOf(key) >= 0;
            })
            .reduce(function (acc, key) {
                acc[key] = object[key];
                return acc;
            }, {});
    };
    $scope.newData = populateNewData([]);
    $scope.columnHeaders = trataDados.getHeaders($scope.newData, true);
//    $scope.orderByColuna = function (coluna) {
//        $scope.sort = {
//            type: coluna,
//            reverse: false
//        };
//    }
    $scope.tabelaFiltrada = new NgTableParams({count:$scope.buscaData.length}, {counts:[], dataset: $scope.newData});
    function populateNewData(lista){
        for(var i=0, l=$scope.buscaData.length; i<l; i++){
            lista.push(slice($scope.buscaData[i],$scope.selected));
        };
        return lista;
    };
    $scope.selectAllColumns = function(selection){
        console.log(selection);
        if (selection == true){
            $scope.oldCamposColuna = $scope.camposColuna;
            $scope.newData = $scope.buscaData;
            $scope.columnHeaders = trataDados.getHeaders($scope.buscaData, true);
            $scope.tabelaFiltrada.reload();
        }
        else{
            novaTabela();
        }
        
    };
    $scope.updateSelectedColumns = function(coluna) {
        //Essa função retorna uma nova tabela newData de acordo com as seleções de campos
        // $scope.selected só parece sofrer alterações aqui dentro.
        if (coluna!==undefined){
            //esse bloco criar a lista de colunas selecionadas
            if(coluna.show == true){
                $scope.selected.push(coluna.title);
            }
            else if(coluna.show == false){
                var index = $scope.selected.indexOf(coluna.title);
                $scope.selected.splice(index, 1);
            };
            novaTabela();
        };
    };
    
    function novaTabela(){
        $scope.newData = [];
        for(var i=0, l=$scope.buscaData.length; i<l; i++){
            $scope.newData.push(slice($scope.buscaData[i],$scope.selected));
        };
        $scope.columnHeaders = trataDados.getHeaders($scope.newData, true);
        $scope.tabelaFiltrada.reload();

    };
        
//    $scope.$watch('newData', function(newValue, oldValue) {
//        //this how we prevent second call
//        if (newValue!=oldValue){
//        $scope.tabelaFiltrada.reload();
//            console.log($scope.selected);
//        };
//     });
}]);

