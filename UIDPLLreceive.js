function UIonMessage(event)
{
      if(event.printConsole != undefined)
      {
          printConsole(event.string);
      }
      else
      if(event.newGraph != undefined)
      {
          newGraph(event);
          
          
          
      }
    
}








function printConsole(string)
{
	//$("#console").val($("#console").val() + "\n" + string);
    $( "#execution" ).append(string);
    
}




function newGraph(event)
{
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
  
  
    var container = document.getElementById(event.containerName);
    var graph = new vis.Graph(container, event.data, options);
    
    
    
    
    
    
} 

