var numstep = 0;
var UIDPLLoutputenabled = true;


function clauseSymbolFromNumber(i)
{
  if(i < 13)
      return ["α", "β", "γ", "δ", "ε", "θ", "λ", "μ", "ν", "ρ", "σ", "τ", "χ"][i];
  else
    return "c" + i;
    //return String.fromCharCode(945+i);
  
}



function getClauseNumber(state, clause)
{
    for(var i = 0; i < state.clauses.length; i++)
    {
	if(clause == state.clauses[i])
	    return i;
    }
    return 26;
}



function getClauseLabel(state, clause)
{
    return clauseSymbolFromNumber(getClauseNumber(state, clause));
}





function printConsole(string)
{
	//$("#console").val($("#console").val() + "\n" + string);
    $( "#execution" ).append(string);
    
}



function getClausesTableString(state)
{
    var s = "";
    s += ("<table class='clausestable'>");

    for(var i = 0; i < state.clauses.length; i++)
    {
      
	s += ("<tr>");
    
	s += ("<td>");
	s += clauseSymbolFromNumber(i);
	s += ("</td>");
	s += ("<td>");
	
	s += (he.encode(getPrettyPrintFromClauseWithNumber(state.clauses[i])));
	
	
	s += ("</td>");
	s += ("</tr>");
      
    }
    
    
    
    s += ("</table></br>");
    
    return s;
}


function getPrettyPrintFromLiteralIntheVariable(i, v)
{
	if(v.sign)
		return "¬" + getPrettyPrintFromLiteralNumber(i) + "  @" + v.dlevel;
	else
		return getPrettyPrintFromLiteralNumber(i) + "  @" + v.dlevel;
}


/*
 * conflictClause: undefined or the clause that causes a conflict (contradiction) if there is one
 */
function constructImplicationGraph(state, containerName, conflictClause)
{
  var nodes = [];
  var edges = [];


  for(var i = 1; i < state.vars.length; i++)
  {
	var v = state.vars[i];
	if(v.isvariableset)
        {
	    var node = {id: i, label: getPrettyPrintFromLiteralIntheVariable(i, v)};
	    
	    if(v.reason == null && v.dlevel > 0)
                  node.group = "decision";
               nodes.push(node);

	    if(v.reason != null)
	    {
	    for(var j = 0; j < v.reason.length; j++)
		if(Math.abs(v.reason[j]) != i)
		  edges.push({from: Math.abs(v.reason[j]), to: i, style: "arrow", label: getClauseLabel(state, v.reason)});

	    }
		
        }





  }
  
  
  
  if(conflictClause != undefined)
  {
    var clauseLabel = getClauseLabel(state, conflictClause);
    nodes.push({id: 0, label: "⊥", group: "bottom"});
    for(var j = 0; j < conflictClause.length; j++)
	    if(Math.abs(conflictClause[j]) != i)
	      edges.push({from: Math.abs(conflictClause[j]), to: 0, style: "arrow", label: clauseLabel}); 
  }
  

  
  if(nodes.length == 0)
        nodes.push({id: 1, label: "nothing", group: "nothing"});



  
  var container = document.getElementById(containerName);
    var data= {
    nodes: nodes,
    edges: edges,
  };
  
  
  var options = {
    width: '900px',
    height: '500px',
    zoomView: false,
    zoomable: false,
    groups: {
      decision: {
	color: {
	  background: 'yellow'
	}
      },
      
      nothing: {
	color: {
	  background: 'white'
	}
      },
      
      bottom: {
	color: {
	  background: 'orange'
	}
      }
      // add more groups here
  }
  };
  
  var graph = new vis.Graph(container, data, options);

  printConsole("</br>");

}

function UIDPLL_init()
{
	//$("#console").val("");
	numstep = 0;
	//$( "#execution" ).html("");


}




function trailToString(trail)
{

	if(trail.length == 0)
		return "[]";
	else
	{
		var s = "[";
	
		for(var i = 0;  i < trail.length - 1; i++)
			s += getPrettyPrintFromLiteralNumber(trail[i]) + " , ";


		s += getPrettyPrintFromLiteralNumber(trail[trail.length - 1]) + "]";

		return s;
	}


}


function UIDPLL_backtrack_before(state, clause)
{
	if(!UIDPLLoutputenabled) return;

	printConsole("We backtrack ");
	printConsole("because the clause " + getPrettyPrintFromClauseWithNumber(clause));
	printConsole(" is false.");
	
	printClausesAndGraph(state, clause);

}




function printStepTitle()
{
    numstep++;
    printConsole("<h3>Step " + numstep + "</h3>");

}



function printClausesAndGraph(state, clause)
{
        
    	if(state.clauses.length < 30)
	{
    		printConsole("<table><tr><td>" + getClausesTableString(state) + "</td><td><span class='graph' id='graph" + numstep + "'></span></td></tr></table>");
	}
	else
	{
		printConsole("<table><tr><td><span class='graph' id='graph" + numstep + "'></span></td></tr></table>");
	}
    constructImplicationGraph(state, "graph" + numstep, clause);
      

  
}






function UIDPLL_backtrack_after(state, clause, reason)
{
	if(!UIDPLLoutputenabled) return;

	printStepTitle();
	printConsole("We learned the clause " + getPrettyPrintFromClauseWithNumber(reason));
	printConsole(". The implication graph is: ");
	printClausesAndGraph(state);
	

}





function UIDPLL_literalSet(state, literal, reason)
{
	if(!UIDPLLoutputenabled) return;

        printStepTitle();
        if(reason != null) 
	{
	  printConsole("We set " + getPrettyPrintFromLiteralNumber(literal));
	  printConsole(" because of " + getPrettyPrintFromClauseWithNumber(reason));
	  printConsole(". "); //trail: " + trailToString(state.trail));
	//printConsole("");
	}
	
	
	printClausesAndGraph(state);

        

}






function UIDPLL_selectLiteral(state, literal)
{
	if(!UIDPLLoutputenabled) return;

        printStepTitle();
	printConsole("We randomly select " + getPrettyPrintFromLiteralNumber(literal));
	printConsole(". ");
}
