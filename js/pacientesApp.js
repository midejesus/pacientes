var pacientesApp = angular.module('pacientesApp', ['ngRoute', 'ui.bootstrap']);

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
    
    .when('/busca',{
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
        // esse loop lista todas as chaves encontradas na base de dados
        function chavesToColunas(dados, estado ){
            var unicas = getUnicas(dados);
            //o loop abaixo adiciona os campos de configuração das colunas
            var colunas=[];
                for(var i=0, l=unicas.length; i<l; i++){
                    colunas.push({name: unicas[i], show: estado});
                }
            return colunas;
        };
        function listaTodas(dados){
            var i, keys =[];
            for(i=0; i<dados.length; i++){
               keys = keys.concat(Object.keys(dados[i]));
            }
            return keys;
        };
        function getUnicas(dados){
            //inicia pegando todas as chaves
            var keys = listaTodas(dados);
            //o loop abaixo filtra as chaves unicas 
            var len = keys.length, j=0, seen={}, unicas=[];
            for(var i = 0; i < len; i++) {
                 var item = keys[i];
                 if(seen[item] !== 1) {
                       seen[item] = 1;
                       unicas[j++] = item;
                 }
            }
            return unicas;
        };
        function columnsSearchFilters(colunas){
            var len = colunas.length, filters={};
            for(var i = 0; i < len; i++) {
                filters[colunas[i]] = '';
            }
            return filters;
        };

        function nomesPacientes(dados){
            var c=[];
            for(var i=0, l=dados.length; i<l; i++){
                if(dados[i].numeroPaciente!==""){
                    c.push({id: i, numeroPaciente: dados[i].numeroPaciente});
                }
                else{
                    c.push({id: i, numeroPaciente: "Sem número"});
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
        function filterObj(object, props) {
            //essa função serve para um objeto, retornando um objeto com apenas as propriedades informadas (keys)
            return Object.keys(object)
                .filter(function (prop) {//filtra a lista de chaves deixando apenas as que estão na lista props
                    return props.indexOf(prop) >= 0;
                })
                .reduce(function (acc, prop) { //faz a lista virar um objeto
                    acc[prop] = object[prop];
                    return acc;
                }, {});
        };
        function filtraTabela(originalData, selected){
            var lista = [], l = originalData.length, s = selected.length;
            for(var i=0; i<l; i++){
                for(var j=0; j<s;j++){
                    if(!originalData[i].hasOwnProperty(selected[j])){
                        originalData[i][selected[j]] = 'Campo indisponível'
                    };
                }
            };
            originalData.forEach(function (paciente) {
                Object.keys(paciente).forEach(function (key) {
                    if (paciente[key] === '' && paciente.hasOwnProperty(key)) paciente[key] = 'Não preenchido';
                });
            });
            for(var i=0; i<l; i++){
                lista.push(filterObj(originalData[i],selected));
            };
            return lista;
        };        
        function camposValores(obj){
            var d=[], chaves = Object.keys(obj);
            for(var i=0, l=chaves.length; i<l; i++){
                    d.push({campo: chaves[i], valor: obj[chaves[i]]});
            }
            return d;
            
        };

    return {
        getHeaders: chavesToColunas,
        getColunas: getUnicas,
        getPacientes: nomesPacientes,
        getCamposValores: camposValores,
        insertID: addId,
        filterObj: filterObj,
        filtraTabela: filtraTabela,
        columnsSearchFilters: columnsSearchFilters
    };
});

pacientesApp.controller('alertController',['$scope',function($scope){
    $scope.alertClass = "";
    $scope.closeAlert = function() {
        $scope.alertClass = 'ng-hide';
    };
    
}]);

pacientesApp.controller('dataController',['$scope', 'xmlData','trataDados', '$location',function($scope, xmlData, trataDados, $location){
    xmlData.getData.then(function(data){
        $scope.xmlData = data;
        $scope.buscaData=trataDados.insertID($scope.xmlData);
        $scope.listaPacientes = trataDados.getPacientes($scope.xmlData);
        $scope.listby = 'id';
        $scope.tabs = [
            { title:'Visualizar Cadastrados', icon:'glyphicon glyphicon-th-list', href:"/"},
            { title:'Realizar Busca', icon:'glyphicon glyphicon-search', href:"/busca", disabled: true }
        ];
        $scope.navClass = function (page) {
            var currentRoute = $location.path();
            return page === currentRoute ? 'active' : '';
        };
    });   
}]);

pacientesApp.controller('pacientesController',['$scope', '$routeParams', 'xmlData','trataDados', function($scope, $routeParams, xmlData, trataDados){  
    var num = parseInt($routeParams.num);
    $scope.pacienteIndex = $scope.listaPacientes[num];
    // ===== Controles de Ordenação (sort) - Tabela com todos os pacientes (listaPAacientes) ====
    $scope.pacientesFilters = {campo:'', valor:''};
    $scope.columnHeaders = [{name:'Campos'},{name:'Respostas'}] ;
    $scope.sortReverse = false; 
    $scope.sortColumn = function(col){
        $scope.sortType= col;
        if($scope.sortReverse){
            $scope.sortReverse = false;
            $scope.reverseclass = 'arrow-up';
        }
        else{
            $scope.sortReverse = true;
            $scope.reverseclass = 'arrow-down';
        };
    };
    $scope.pacienteAlvo = trataDados.getCamposValores($scope.xmlData[num]);
    // ===== Paginação - Tabela de Paciente (pacienteAlvo) - Campos/Valores =====
    $scope.totalItems = $scope.pacienteAlvo.length;
    $scope.viewby = 15;
    $scope.currentPage = 1;  
    $scope.numPerPage = $scope.viewby;
    $scope.maxSize = 10;
    $scope.setItemsPerPage = function(num) {
        $scope.numPerPage = num;
        $scope.currentPage = 1; //reset to first paghe
    };
}]);

pacientesApp.controller('buscaController',['$scope','xmlData','trataDados', function($scope, xmlData, trataDados){
    // ===== Inicialização da tabela camposColunas com seleção de id =====
    $scope.camposColunas = trataDados.getHeaders($scope.buscaData, false);
    $scope.camposColunas[0].show=true; 
    // ===== Paginação - Tabela de Campos =====
    $scope.totalItems = $scope.camposColunas.length;
    $scope.viewby = 10;
    $scope.currentPage = 1;  
    $scope.numPerPage = $scope.viewby;
    $scope.maxSize = 4;
    $scope.setItemsPerPage = function(num) {
        $scope.numPerPage = num;
        $scope.currentPage = 1; //reset to first paghe
    };
    // ===== Ordenação (sort) da Tabela Campos =====
    $scope.sortReverseCampos = false;
    $scope.sortCampos = function(){
        $scope.sortReverseCampos = !$scope.sortReverseCampos;
        $scope.sortingCampos = true ;
    };
    // ===== Inicialização da Tabela de Resultados =====
    $scope.selected = ['id'];
    $scope.tabelaAtualizada = function(){
        $scope.newData = trataDados.filtraTabela($scope.buscaData, $scope.selected);
        $scope.columnHeaders = trataDados.getHeaders($scope.newData, true);
        $scope.columnFilters = trataDados.columnsSearchFilters($scope.selected);
    };
    $scope.tabelaAtualizada();
    // ===== Ordenação (sort) da Tabela de Resultados =====
    $scope.sortReverse = false; 
    $scope.sortColumn = function(col){
        $scope.sortType= col;
        if($scope.sortReverse){
            $scope.sortReverse = false;
        }
        else{
            $scope.sortReverse = true;
            $scope.reverseclass = 'arrow-down';
        };
    };
    // ===== Função para limpar filtros da Tabela de Resultados =====
    $scope.cleanSearch = function(){
        $scope.search = '';
        for (var prop in $scope.columnFilters) { $scope.columnFilters[prop]=''; };
    };
    // ===== Seleção de Todos os Campos para a Tabela de Resultados =====
    $scope.selectAllColumns = function(selection){
        if (selection){
            $scope.newData = trataDados.filtraTabela($scope.buscaData,trataDados.getColunas($scope.buscaData));
            $scope.columnHeaders = trataDados.getHeaders($scope.buscaData, true);
        }
        else{
            $scope.tabelaAtualizada();
        }
    };
    // ===== Atualização da Coluna Resultados com base na seleção de campos
    $scope.updateSelectedColumns = function(coluna) {
        //Essa função retorna uma nova tabela newData de acordo com as seleções de campos
        if (coluna!==undefined){//esse bloco criar a lista de colunas selecionadas
            if(coluna.show){
                $scope.selected.push(coluna.name);
            }
            else {
                var index = $scope.selected.indexOf(coluna.name);
                $scope.selected.splice(index, 1);
            };
            $scope.tabelaAtualizada();
        };
    };
}]);

