var tablePropositionToNumber = [];
var tableNumberToProposition = [];
var currentNumberOfPropositions = 1;



function getPrettyPrintFromLiteralNumber(literalNumber)
{
	if(literalNumber > 0)
		return tableNumberToProposition[literalNumber];// + "_{" + literalNumber + "}";
	else
		return "¬" + tableNumberToProposition[-literalNumber] + "";// + "_{" + literalNumber + "}";
}


function getPrettyPrintFromClauseWithNumber(clauseWithNumber)
{
	if(clauseWithNumber === null)
		return "NULL";

	if(clauseWithNumber === [])
		return "bottom";
	else
	{
		var s = "(";
		
		for(var i = 0;  i < clauseWithNumber.length - 1; i++)
			s += getPrettyPrintFromLiteralNumber(clauseWithNumber[i]) + " ∨ ";

		s += getPrettyPrintFromLiteralNumber(clauseWithNumber[clauseWithNumber.length - 1]) + ")";

		return s;

	}

}





function getNumberForProposition(proposition)
{
  if(tablePropositionToNumber[proposition] === undefined)
  {
    tablePropositionToNumber[proposition] = currentNumberOfPropositions;
    tableNumberToProposition[currentNumberOfPropositions] = proposition;
    currentNumberOfPropositions++;
  }

    return tablePropositionToNumber[proposition];
}

function getNumberForLitteral(litteral)
{
  if(litteral instanceof Array)
  {
    if(litteral[0] === "not")
    {
	return -getNumberForProposition(litteral[1]);
    }
    else
    {
	return getNumberForProposition(litteral);
    }
  }
  else
  {
      return getNumberForProposition(litteral);
  }
}


function getListOfChosenLiteralsForSolver(listOfChosenLiterals)
{
	var listOfChosenLiteralsSolver = [];
	for(i in listOfChosenLiterals)	
	{
		listOfChosenLiteralsSolver.push(getNumberForLitteral(listOfChosenLiterals[i]));
	}

	return listOfChosenLiteralsSolver;
}





function getClausesForSolverSub(clauseScheme)
{
	var clauseSolver = [];
	for(i in clauseScheme)
	//if(i % 2 == 0)	
	{
		clauseSolver.push(getNumberForLitteral(clauseScheme[i]));

	}

	return clauseSolver;
}




function getClausesForSolver(formulaCNFScheme)
{
  var inputSolver = [];

	
  tablePropositionToNumber = [];
  tableNumberToProposition = [];
  currentNumberOfPropositions = 1;


  for(i in formulaCNFScheme)
  //if(i % 2 == 0)
  {
      
      if(formulaCNFScheme[i] instanceof Array)
	inputSolver.push(getClausesForSolverSub(formulaCNFScheme[i]));

  }

  return inputSolver;
}




/*input: a string like "(phi1 phi2 phi3 ...)" where phii are formulas like "(bigand...)"
output: the CNF for the solver like ((p a)) for "p or a" or
((p) (a b)) for "p and (a or b)"
*/
function satforHuman_formulagetExpanded(phi)
{
	//return scheme.eval("(formulatocnf (formula-expand (make-conjunction " + "(quote (" + phi.replace(/\\n/, ' ')  + ")))))");
        return scheme.eval("(list* (map (lambda (x) (formula-expand x)) (quote (" + phi.replace(/\\n/, ' ')  + "))))");

}




/*input: a string like "(phi1 phi2 phi3 ...)" where phii are formulas like "(bigand...)"
output: the CNF for the solver like ((p a)) for "p or a" or
((p) (a b)) for "p and (a or b)"
*/
function satforHuman_formulagetExpandedCNF(phi)
{
	//return scheme.eval("(formulatocnf (formula-expand (make-conjunction " + "(quote (" + phi.replace(/\\n/, ' ')  + ")))))");
        return scheme.eval("(list* (map (lambda (x) (formulatocnf (formula-expand x))) (quote (" + phi.replace(/\\n/, ' ')  + "))))");

}

//scheme.prettyprint(satforHuman_getValuation(satforHuman_formulagetExpandedCNF("((p or (not t)) and (q or t) and t)")))
//scheme.prettyprint(satforHuman_getValuation([[["not", "a"], "b"], "and", ["a"]]))
function satforHuman_getValuation(formulaCNFScheme, listOfChosenLiterals)
{

  if(listOfChosenLiterals === undefined)
    listOfChosenLiterals = [];

  var clausesForSolver = getClausesForSolver(formulaCNFScheme);
  var listOfChosenLiteralsForSolver = getListOfChosenLiteralsForSolver(listOfChosenLiterals);
  //alert(clausesForSolver);
  //alert(currentNumberOfPropositions-1);
  //alert(listOfChosenLiteralsForSolver);
  if(currentNumberOfPropositions >= 20)
  {
        UIDPLLoutputenabled = false;
        UIpostMessage = function () {};     
        
        
  }

  var result = satSolve(currentNumberOfPropositions-1, clausesForSolver, listOfChosenLiteralsForSolver);
  
  if(result === false)
      return false;
  else
  {
      var valuation = [];
      
      for(var i = 1; i <= currentNumberOfPropositions; i++)
      {
	  if(result.vars[i] != undefined)
	  if(!result.vars[i].sign)
	  if((tableNumberToProposition[i] != undefined) && !(tableNumberToProposition[i][0] == '_'))
	    valuation.push(tableNumberToProposition[i]);
	    
      }
      
      return valuation;
  }
    
}
