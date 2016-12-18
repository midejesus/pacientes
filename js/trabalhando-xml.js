/**
 * Created by midej on 18/12/2016.
 */
function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            myFunction(this);
        }
    };
    xmlhttp.open("GET", 'pacientes.xml', true);
    xmlhttp.send();
}

function myFunction(xml) {
    var x, i, xmlDoc, txt;
    xmlDoc = xml.responseXML;
    txt = "";
    x = xmlDoc.getElementsByTagName("paciente");
    for (i = 0; i< x.length; i++) {
        txt += x[i].nodeValue + "<br>";
    }
    document.getElementById("demo").innerHTML = txt;
}