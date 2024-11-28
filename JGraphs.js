//track mouse position on mousemove
var mousePosition;

//track state of mousedown and up
var isMouseDown;

//reference to the canvas element
var c = document.getElementById("myCanvas");

//reference to 2d context
var ctx = c.getContext("2d");
ctx.font = "10px Arial";
ctx.lineWidth = 2;
ctx.strokeStyle = "white";

var vS = document.getElementById("vertexSize");
var eW = document.getElementById("edgeWidth");
var tS = document.getElementById("textSize");

var vertexsize = 5;
var nVertices = 0;

var addingEdge = {
    intento: -1,
    head: -1,
    tail: -1
};

//add listeners
let timer
document.addEventListener('click', event => {
  if (event.detail === 1) {
    timer = setTimeout(() => {
    }, 250)
  }
})
document.addEventListener('dblclick', event => {
  clearTimeout(timer)
  console.log('dblclick')
})
document.addEventListener('mousemove', move, false);
document.addEventListener('mousedown', setDraggable, false);
document.addEventListener('mouseup', setDraggable, false);
document.addEventListener('dblclick', addVertex, false);
vS.addEventListener('input', updateVertexSize, false);
tS.addEventListener('input', updateTextSize, false);
eW.addEventListener('input', updateEdgeWidth, false);


//make a collection of circles
var circles = [];
var edges = [];
var removedEdges = [];

function updateVertexSize() {
    vertexsize = vS.value;
    draw()
}

function updateEdgeWidth() {
    ctx.lineWidth = eW.value;
    draw()
}

function updateTextSize() {
    ctx.font = tS.value.toString() + "px Arial";
    draw()
}

//input as text
function textinput(e) {
    if(event.key === 'Enter') {
        var text = document.getElementById("graphinput").value;

        if(text[0] == 'P') {
            //alert("The value of the input field was changed to " + text);
            var n = parseInt(text.substring(1,text.length));

            for ( var i = 0; i < n; i++ ){
                var cx = c.width/2 - ( 200 * Math.cos( ( 2 * Math.PI * i ) / n ) );
                var cy = c.height/2 + ( 200 * Math.sin( ( 2 * Math.PI * i ) / n ) );
                
                var auxc = new Circle(cx, cy, "red", nVertices++);

                circles.push(auxc);

                if (i > 0){
                    edges.push([nVertices-2,nVertices-1]);
                }
            }
            draw();
        } else if (text[0] == 'C') {
            var n = parseInt(text.substring(1,text.length));

            for ( var i = 0; i < n; i++ ){
                var cx = c.width/2 - ( 200 * Math.cos( ( 2 * Math.PI * i ) / n ) );
                var cy = c.height/2 + ( 200 * Math.sin( ( 2 * Math.PI * i ) / n ) );
                
                var auxc = new Circle(cx, cy, "red", nVertices++);

                circles.push(auxc);

                if (i > 0){
                    edges.push([nVertices-2,nVertices-1]);
                }
                if (i == n-1){
                    edges.push([nVertices-n,nVertices-1]);
                }
            }
            draw();
        } else if (text[0] == 'K') {
            var n = parseInt(text.substring(1,text.length));
            var nVerticesinicial = nVertices;

            for ( var i = 0; i < n; i++ ){
                var cx = c.width/2 - ( 200 * Math.cos( ( 2 * Math.PI * i ) / n ) );
                var cy = c.height/2 + ( 200 * Math.sin( ( 2 * Math.PI * i ) / n ) );
                
                var auxc = new Circle(cx, cy, "red", nVertices++);

                circles.push(auxc);

                for ( var j = i + 1; j < n; j ++){
                    edges.push([nVertices - 1, nVerticesinicial + j ]);
                }
                
            }
            draw();
        } else if (text[0] == 'T') {
            var n = parseInt(text.substring(1,text.length));

            for ( var i = 0; i < n; i++ ){
                var cx = c.width/2 - ( 200 * Math.cos( ( 2 * Math.PI * i ) / n ) );
                var cy = c.height/2 + ( 200 * Math.sin( ( 2 * Math.PI * i ) / n ) );
                
                var auxc = new Circle(cx, cy, "red", nVertices++);

                circles.push(auxc);
                
            }
            draw();
        } else if (text == 'toLatex') {
            var cx = c.width/2;
            var cy = c.height/2;

            var cadena = "\\documentclass[11pt,twoside]{amsart}\n";
            cadena = cadena + "\\usepackage{tikz}\n";
            cadena = cadena + "\\begin{document}\n";
            cadena = cadena + "	\\begin{center}\n";
            cadena = cadena + "		\\begin{tikzpicture}[scale=2,thick]\n";
            cadena = cadena + "		\\tikzstyle{every node}=[minimum width=0pt, inner sep=2pt, circle]\n";

            for ( var i = 0; i < circles.length; i++ ) {
                if( circles[i].vivo){
                    cadena = cadena + "			\\draw (" + ((circles[i].x - cx)/100) + "," + ((cy - circles[i].y)/100) + ") node[draw] (" + i + ") { \\tiny " + i + "};\n";
                }
            }

            for ( var i = 0; i < edges.length; i++) {
                if ( circles[edges[i][0]].vivo && circles[edges[i][1]].vivo ) {
                    cadena = cadena + "			\\draw  (" + (edges[i][0]) + ") edge (" + (edges[i][1]) + ");\n";
                }
            }
            cadena = cadena + "		\\end{tikzpicture}\n";
            cadena = cadena + "	\\end{center}\n";
            cadena = cadena + "\\end{document}\n";

            document.getElementById("graphoutput").textContent=cadena;
        } else if (text == 'toSage') {
            document.getElementById("graphoutput").textContent="g=Graph(" + graph2string() +")";
        } else if (text == 'toR') {
            document.getElementById("graphoutput").textContent="library(igraph)\ng <- graph.formula(" + graph2Rstring() +")";
        } else if (text == 'toM2') {
            document.getElementById("graphoutput").textContent="loadPackage \"Graphs\"\nG = graph(" + graph2M2string() +")";
        } else if (text == 'computeFM') {
            var cadena = "# Forbidden graphs form MZ <= 3\n";
            cadena = cadena + "min_forbid5=[Graph('DBg', name = 'P5')]\n";
            cadena = cadena + "min_forbid6=[Graph('E?NG', name = 'G2'),\n";
            cadena = cadena + "    Graph('E@JW', name = 'G3'),\n";
            cadena = cadena + "    Graph('E?NW', name = 'G4'),\n";
            cadena = cadena + "    Graph('E?Nw', name = 'G5'),\n";
            cadena = cadena + "    Graph('E?]w', name = 'G6'),\n";
            cadena = cadena + "    Graph('E@`w', name = 'G7'),\n";
            cadena = cadena + "    Graph('E@YW', name = 'G8'),\n";
            cadena = cadena + "    Graph('E@UW', name = 'G9'),\n";
            cadena = cadena + "    Graph('EGNW', name = 'G10'),\n";
            cadena = cadena + "    Graph('EAMw', name = 'G11'),\n";
            cadena = cadena + "    Graph('E@Vw', name = 'G12'),\n";
            cadena = cadena + "    Graph('ECXw', name = 'G13'),\n";
            cadena = cadena + "    Graph('E@^W', name = 'G14'),\n";
            cadena = cadena + "    Graph('EJeg', name = 'G15'),\n";
            cadena = cadena + "    Graph('E?oo', name = 'G20'),\n";
            cadena = cadena + "    Graph('ECQ_', name = 'G21'),\n";
            cadena = cadena + "    Graph('EK]w', name = 'G16')]\n";
            cadena = cadena + "min_forbid7=[Graph('F?Cfw', name ='G17'),\n";
            cadena = cadena + "    Graph('F?D~o', name ='G18'),\n";
            cadena = cadena + "    Graph('F?`@_', name = 'G22'),\n";
            cadena = cadena + "    Graph('F?`Do', name = 'G23'),\n";
            cadena = cadena + "    Graph('F?`bg', name = 'G24'),\n";
            cadena = cadena + "    Graph('F?D~w', name ='G19')]\n";
            cadena = cadena + "min_forbid8=[Graph('G?`@?_', name = 'G25')]\n";
            cadena = cadena + "\n";
            cadena = cadena + "G = Graph(" + graph2string() + ")\n";
            cadena = cadena + "\n";
            cadena = cadena + "flag = True\n";
            cadena = cadena + "\n";
            cadena = cadena + "for H in min_forbid5 + min_forbid6 + min_forbid7 + min_forbid8:\n";
            cadena = cadena + "    D = G.subgraph_search(H, induced=True)\n";
            cadena = cadena + "    if D != None:\n";
            cadena = cadena + "        print(H.name() + \" \" + str(D.vertices(sort=True)))\n";
            cadena = cadena + "        D.show()\n";
            cadena = cadena + "        flag = False\n";
            cadena = cadena + "        break\n";
            cadena = cadena + "\n";
            cadena = cadena + "if flag:\n";
            cadena = cadena + "    print(\"Allowed graph\")\n";
            cadena = cadena + "\n";

            document.getElementById("graphoutput").textContent=cadena;
        }
        
    }
}

function graph2string() {
    var graph = "{";
    
    var adyacencias = [];
    adyacencias.length = circles.length;
    
    for (var i = 0; i < circles.length; i++) {
        adyacencias[i] = "";
    }

    for ( var i = 0; i < edges.length; i++ ) {
        if ( circles[edges[i][1]].vivo ){
            if ( adyacencias[edges[i][0]].length > 0 ){
                adyacencias[edges[i][0]] = adyacencias[edges[i][0]] + ","
            }
            adyacencias[edges[i][0]] = adyacencias[edges[i][0]] + edges[i][1].toString(); 
        }
    }

    for (var i = 0; i < circles.length; i++) {
        if ( circles[i].vivo ){
            if (graph[graph.length-1] == "]") {
                graph = graph + ",";
            }
            if ( adyacencias[i].length > 0 ) {
                graph = graph + i.toString() + ":[" + adyacencias[i] + "]";
            } else {
                graph = graph + i.toString() + ":[]";
            }
        }
    }
    graph = graph + "}";
    return graph
}

function graph2Rstring() {
    var graph = "";

    for ( var i = 0; i < edges.length; i++ ) {
        if ( circles[edges[i][0]].vivo && circles[edges[i][1]].vivo ){
            if ( graph.length > 0 ) {
                graph = graph + ","
            }
            graph = graph + edges[i][0] + "-" + edges[i][1];
        }
    }
    
    return graph
}

function graph2M2string() {
    var graph = "{";
    
    var singletons = Array.from({length: circles.length}, (_, i) => 1);

    for (var i = 0; i < edges.length; i++) {
        if ( circles[edges[i][0]].vivo && circles[edges[i][1]].vivo ){
            if (graph[graph.length-1] == "}") {
                graph = graph + ",";
            }
            graph = graph + "{" + edges[i][0].toString() + "," + edges[i][1] + "}";
            singletons[edges[i][0]] = 0;
            singletons[edges[i][1]] = 0;
        }
    }

    graph = graph + "}";

    for (var i = 0; i < circles.length; i++) {
        if ( circles[i].vivo == true && singletons[i] == 1 ) {
            if (graph[graph.length-1] == "}") {
                graph = graph + ", Singletons => {";
            } else if ( Number(graph[graph.length-1]) > -1 ) {
                console.log(graph[graph.length-1]);
                graph = graph + ",";
            }
            graph = graph + i.toString();
        }
    }
    if ( graph[graph.length-1] != "}" ) {
        graph = graph + "}";
    }
    
    return graph
}

//add vertex
function addVertex(e){
    getMousePosition(e);
    if ( mousePosition.x >= 0 && mousePosition.x <= c.width && mousePosition.y >= 0 && mousePosition.y <= c.height) {

        removeVertex = -1;
        for (var i = 0; i < circles.length; i++) {
            if (intersects(circles[i])) {
                removeVertex = i;
                break;
            }
        }
        if (removeVertex > -1) {
            if ( circles[i].vivo ) {
                circles[i].vivo = false;
                draw();
            } else {
                circles[i].vivo = true;
                draw()
            }
            
        } else {
            var auxc = new Circle(mousePosition.x, mousePosition.y, "red", nVertices++);
            circles.push(auxc);
            draw();
        }
        
    }
    
}

//main draw method
function draw() {
    //clear canvas
    ctx.clearRect(0, 0, c.width, c.height);
    
    drawEdges();
    drawCircles();
    
}

//draw edges
function drawEdges() {
    for ( var i = edges.length - 1; i >= 0 ; i--) {
        if ( circles[edges[i][0]].vivo && circles[edges[i][1]].vivo ){
            head = edges[i][0];
            tail = edges[i][1];
            ctx.beginPath();
            ctx.moveTo(circles[head].x, circles[head].y);
            ctx.lineTo(circles[tail].x, circles[tail].y);
            ctx.stroke();
        }
    }
}


//draw circles
function drawCircles() {
    for (var i = circles.length - 1; i >= 0; i--) {
        circles[i].draw();
    }
}

//key track of circle focus and focused index
var focused = {
   key: 0,
   state: false
}

//circle Object
function Circle(x, y, fill, indice) {
    this.startingAngle = 0;
    this.endAngle = 2 * Math.PI;
    this.x = x;
    this.y = y;
    this.indice = indice;
    this.fill = fill;
    this.vivo = true;

    this.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, vertexsize, this.startingAngle, this.endAngle);
        if(this.vivo){
            ctx.fillStyle = this.fill;
            ctx.fill();
        }
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillText(this.indice.toString(), this.x, this.y - 10 - vertexsize + 5);
    }
}

function move(e) {

    if (!isMouseDown) {
        return;
    }

    getMousePosition(e);

    //if any circle is focused
    if (focused.state) {
        circles[focused.key].x = mousePosition.x;
        circles[focused.key].y = mousePosition.y;
        draw();
        return;
    }

    //no circle currently focused check if circle is hovered
    for (var i = 0; i < circles.length; i++) {
        if (intersects(circles[i])) {
            focused.key = i;
            focused.state = true;
            break;
        }
    }
    draw();
}

//set mousedown state
function setDraggable(e) {
    var t = e.type;
    if (t === "mousedown") {
        isMouseDown = true;
    } else if (t === "mouseup") {
        if (focused.state  == false){

            getMousePosition(e);

            if (addingEdge.intento == -1){
                addingEdge.head = -1;
                addingEdge.tail = -1;
            }

            for (var i = 0; i < circles.length; i++) {
                if (circles[i].vivo && i != addingEdge.head && intersects(circles[i])) {
                    if (addingEdge.intento == -1){
                        addingEdge.head = i;
                        circles[addingEdge.head].fill = "green";
                        draw()
                    } else {
                        addingEdge.tail = i;
                    }
                    break;
                }
            }

            if (addingEdge.intento == 1 && addingEdge.tail == -1) {
                circles[addingEdge.head].fill = "red";
                draw();
                addingEdge.intento = -1;
            } else if (addingEdge.tail > -1) {

                addingEdge.intento = -1;

                var mayor = addingEdge.head > addingEdge.tail? addingEdge.head : addingEdge.tail;
                var menor = addingEdge.tail > addingEdge.head? addingEdge.head : addingEdge.tail;

                var auxindex = edges.indexOf([menor,mayor]);

                for ( var i = 0; i < edges.length; i++ ){
                    if ( edges[i][0] == menor && edges[i][1] == mayor ){
                        auxindex = i;
                        break;
                    }
                }

                console.log("indices: " + menor + "," + mayor + ", indice encontrado: " + auxindex);

                if ( auxindex > -1 ) {
                    edges.splice(auxindex,1);
                } else {
                    edges.push([menor,mayor]);
                }

                circles[addingEdge.head].fill = "red";
                draw();
                
            } else if (addingEdge.head > -1){
                addingEdge.intento = 1;
            } else {
                addingEdge.intento = -1;
            }

            console.log("intento: " + addingEdge.intento.toString() + ", head: " + addingEdge.head.toString() + ", tail: " + addingEdge.tail.toString() );
        }
        isMouseDown = false;
        releaseFocus();
    }
}

function releaseFocus() {
    focused.state = false;
}

function getMousePosition(e) {
    var rect = c.getBoundingClientRect();
    mousePosition = {
        x: Math.round(e.x - rect.left),
        y: Math.round(e.y - rect.top)
    }
}

//detects whether the mouse cursor is between x and y relative to the radius specified
function intersects(circle) {
    
    return (Math.abs(mousePosition.x - circle.x) <= vertexsize) &&  (Math.abs(mousePosition.y - circle.y) <= vertexsize)
}

draw();
