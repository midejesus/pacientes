/**
 * Created by midej on 18/12/2016.
 */
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 'pacientes.xml', true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            listaPacientes(this);
        }
    };

function listaPacientes(xml) {
    var pacientes, i, xmlDoc, txt;
    xmlDoc = xml.responseXML;
    txt = "";
    pacientes = xmlDoc.getElementsByTagName('paciente');

 /*   for (i=0; i<pacientes[0].childElementCount;i++){
        console.log(pacientes[0].children[i].tagName);
        console.log(pacientes[0].children[i].innerHTML);*/
   // }
    for (i=0; i<pacientes.length;i++){
        if (pacientes[i].children[0].innerHTML != ""){
            txt += pacientes[i].children[0].innerHTML + "<br />";
        }
        else{
            txt += "Sem número" + "<br />";
        }

    }
    document.getElementById("demo").innerHTML = txt;
}