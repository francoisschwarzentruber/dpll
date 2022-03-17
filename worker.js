importScripts('satforhuman.js');
importScripts('sat.js');
importScripts('UIDPLLsend.js');
importScripts('scheme_interpreter.js');


var inputFormula;
var inputChosenLiterals;


onmessage = function(event)
{
        inputFormula = event.data.inputFormula;
	    inputChosenLiterals = event.data.inputChosenLiterals;
       
	
}








UIpostMessage = postMessage;

function load()
{
    scheme.loadfile("formula-expand.scm");
    scheme.loadfile("formula_to_cnf.scm");
    scheme.loadfile("formula_check_syntax.scm");	
}


function testSAT() {
          var inputFormulaExpandedCNF = satforHuman_formulagetExpandedCNF(inputFormula);
	  var valuation = satforHuman_getValuation(inputFormulaExpandedCNF, inputChosenLiterals);
	  postMessage({valuation: valuation});
	  self.close();
}



load();

setTimeout(testSAT, 100);
