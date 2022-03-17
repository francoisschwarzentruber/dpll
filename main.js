
    
window.onload = function()
{
	scheme.loadfile("formula-expand.scm");
	scheme.loadfile("formula_to_cnf.scm");
	scheme.loadfile("formula_check_syntax.scm");
}


function formulaToMultipleLineStringProc(f)
{

  
}


function formulaToMultipleLineString(f)
{
    if(f instanceof Array)
    {
          if(f.length > 1)
	  {
	      if(f[1] == "and")
	      {
		  var output = "";
		  for(var g of f)
		    if(g != "and")
		  {
		    output += formulaToMultipleLineString(g) + "\n";
		  }
		  return output;
	      }
	      else
		return scheme.prettyprint(f);
		
	  }
	  else
	    return scheme.prettyprint(f);
	  
      
    }
    else
      return scheme.prettyprint(f);
}

function GUIformulaexpand()
{
  var formulaCode = editor.getDoc().getValue();
	var inputFormula = satforHuman_formulagetExpanded(formulaCode);
	
	var output = formulaToMultipleLineString(inputFormula);
	
         editor.getDoc().setValue(output);

}




function loadExample(formula)
{
	editor.getDoc().setValue(formula);
}

function loadExampleFromFile(url)
{
	var result;

		  $.ajax(

		  {

 			mimeType: 'text/plain; charset=x-user-defined',

			type: 'GET',

			async: true,

			url:  url,

			dataType: "text",

			success: function(data) {

				result = data;

				

				loadExample(data);

			}

		  });

		  return result;
}


function insert(txt)
{
	editor.getDoc().replaceSelection(txt);

}






function getCodeWithoutComments(code)
{
     return code.split("\n").map(function(s) {if(trim(s).startsWith("//"))  return ""; else return s;}).join("\n");
}





function encodeEntities(value) {
    return $('<div />').text(value).html();
}






function GUIcomputingStarts()
{
  $( "#computingstops").show();
  $( "#computingstarts").hide();
  $("#divinput *").prop('disabled', true);
  $("#menu").hide();

  
}


function GUIcomputingStops()
{
  $( "#computingstarts").show();
  $( "#computingstops").hide();
  $("#divinput *").prop('disabled', false);
  $("#menu").show();
}



var worker = null;

function computationAbort()
{
    worker.terminate();
    worker = null;
    GUIcomputingStops();
}




function compute()
{
        GUIcomputingStarts();
	var formulaCode = editor.getDoc().getValue();
	var formulaCodeWithoutComments = getCodeWithoutComments(formulaCode);
	
	scheme.errorinit();
	parsingErrors = scheme.eval("(map formula-check-syntax (quote (" + formulaCodeWithoutComments.replace(/\\n/, ' ')  + ")))");
	parsingErrors= trim( parsingErrors.join(' '));
	
	$( "#execution" ).empty();
	$( "#valuation" ).empty();
    
    
	if(scheme.errorgetmessage() != "")
	{
	      $( "#execution" ).append("<h3 class='error'>" + he.encode(scheme.errorgetmessage()) + "</h3>");
	      GUIcomputingStops();
	}
	else if(parsingErrors != "")
	{
	      
	      $( "#execution" ).append("<h3 class='error'>" + he.encode(parsingErrors) + "</h3>");
	      GUIcomputingStops();
	      
	}
	else
	{

	
		  
		  var inputChosenLiterals = scheme.parser($("#inputChosenLiterals").val());
	    
		  

		
		if (typeof(Worker) !== "undefined")
		{
		      worker = new Worker("worker.js");
		      console.log("worker created");
		      
		      worker.postMessage({inputFormula: formulaCodeWithoutComments, inputChosenLiterals: inputChosenLiterals});
		      
		      worker.onmessage = function(event){
			    if(event.data.valuation != undefined)
			    {
				    var valuation = event.data.valuation;
				    console.log("valuation received from the worker");
				    showValuation(valuation);
			    }
			    else if(event.data.gui != undefined)
                {
                           UIonMessage(event.data);
                    
                }
			    
			}; 
		}
		  else
		  {
		      console.log("version without worker");
		      var valuation = satforHuman_getValuation(inputFormula, inputChosenLiterals);
		      showValuation(valuation);
		  } 
		

		

		

      
	}
      

}





function showValuation(valuation)
{
	if(valuation)
	{
	  
	  if(valuation == "")
	  {
	    $( "#valuation" ).append("<h3 class='sat'>The set of formulas is satisfiable. Here is one valuation. We set all atomic propositions to false.</h3>");
	  }
	  else
	  {
	    $("#valuationTextArea").val(scheme.prettyprintArrayWithoutExternalParenthesis(valuation));
	    $( "#valuation" ).append("<h3 class='sat'>The set of formulas is satisfiable. Here is one valuation. We set the following atomic propositions to true (and the others to false):</h3><textarea id='valuationTextArea' cols='50' rows='10'></textarea>");
	    $("#valuationTextArea").val(scheme.prettyprintArrayWithoutExternalParenthesis(valuation));
	  }
	  
	  
	}
	else
	{
	  $( "#valuation" ).append("<h3 class='unsat'>The set of formulas is unsatisfiable</h3>");
	}
  
  
  GUIcomputingStops();
}

