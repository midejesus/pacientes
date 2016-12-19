function loadXMLDoc(xmlDoc) {
    if (window.XMLHttpRequest) {
        xhttp=new XMLHttpRequest();
    }
    else {
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET",xmlDoc,false);
    xhttp.send();
    return xhttp.responseXML;
}

var xmlDoc = loadXMLDoc("pacientes.xml");
var pacientesLista = xmlDoc.getElementsByTagName('paciente');
var x2js = new X2JS();
var pacientesJson = x2js.xml2json(xmlDoc);

function listKeys(){
    var i, j, keys =[];
    for(i=0; i<pacientesLista.length; i++){
        for(j=0; j<pacientesLista[i].childElementCount; j++)
            {
                keys.push(pacientesLista[i].children[j].tagName);
            }
    }
    
    return keys;
}
function uniq_fast(a) {
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
}

var Chaves = uniq_fast(listKeys());
//Forma de chamar valor de json: array['keyname']
//for(var i=0; i < Chaves.length; i++){
//    console.log(Chaves[i] + " : " + pacientesJson.doc.paciente[0][Chaves[i]]);
//}

var pacientesApp = angular.module('pacientesApp', []);

pacientesApp.controller('mainController', function($scope) {
    }       
                          
);

