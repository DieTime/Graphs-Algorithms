let Nodes = []; // Array of all nodes
let Graph = []; // Adjacency matrix

let nodes; // Array of nodes objects for render graph
let edges; // Array of nodes objects for render graph
// Options for drawing graph
let options = {
    layout: {randomSeed: 20180310806},
    nodes: {
        color: {border: 'black', background: 'white'},
        font: {color: 'black', size: 14, face: 'Roboto'}
    },
    edges: {color: 'black'}
};

// Function for parsing nodes from an adjacency matrix
function parse_nodes(cities) {
    let renderNodes = []; // Array of nodes for render graph

    // Create arrays of nodes
    cities.map((item, index) => {
        renderNodes.push({id: index, label: item.trim()});
        // Add node to array of all nodes
        Nodes.push(item.trim());
    });

    return renderNodes;
}

// Function for parsing edges from an adjacency matrix
function parse_edges(input_weights) {
    let renderEdges = []; // Array of edges for render graph

    input_weights.map((item, index) => {
        let MatrixRow = []; // Row of Graph adjacency matrix

        let weights = item.trim().split(/(?: )+/);
        weights.map((value, id) => {
            // Add weight to matrix row
            MatrixRow.push(Number(value));

            // If the node is reach
            if (value !== "0") {

                // Trying to find a mutual edge
                let founded = false;
                renderEdges.map((edges_val, edges_index) => {
                    // If a mutual edge is found change direction to two-way
                    if (JSON.stringify(edges_val) === JSON.stringify({
                        from: id,
                        to: index,
                        label: value,
                        arrows: 'to'
                    })) {
                        renderEdges[edges_index].arrows = 'to;from';
                        founded = true;
                    }
                });

                // Else add edge to array of edges for render graph
                if (!founded) {
                    renderEdges.push({from: index, to: id, label: value, arrows: 'to'});
                }
            }
        });
        // Fill the adjacency matrix
        Graph.push(MatrixRow);
    });

    return renderEdges;
}

// Initialization and graph output
function init_graph() {
    document.getElementById('my-file').addEventListener('change', function (e) {
        console.log(e.target.files);
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.onload = function (e) {
                // Getting data from file
                let data = e.target.result.split('\n');

                // Parse nodes and edges
                nodes = parse_nodes(data[1].split(' '));
                edges = parse_edges(data.slice(2));

                // Render graph
                if (document.location.pathname.split('/').slice(-1)[0] === 'prim.html') {
                    document.getElementById('start-data').innerHTML =
                        `<input class='start-node' id="start" type="text" onfocus="this.value=''" value="Start node">
                         <input type="button" value="Choose" id="btn" class='button' onclick='prim()'>
                         <input type="button" value="Refresh" id="refresh" class='button' onclick='refreshGraph()'>`;

                    document.getElementById('title').innerHTML = 'Building a minimum<br>spanning tree';

                    document.getElementById('start').addEventListener('keyup', function (e) {
                        if (e.keyCode === 13) {
                            document.getElementById("btn").click();
                        }
                    });
                } else {
                    document.getElementById('start-data').innerHTML =
                        `<input class='start-node' id="start" type="text" onfocus="this.value=''" value="Start node">
                         <input class='start-node' id="end" style="margin-left: 5px" type="text" onfocus="this.value=''" value="End node">
                         <input type="button" value="Choose" id="btn" class='button' onclick='dijkstra()'>`;

                    document.getElementById('title').innerHTML = 'Find the shortest<br>path and location';

                    document.getElementById('end').addEventListener('keyup', function (e) {
                        if (e.keyCode === 13) {
                            document.getElementById("btn").click();
                        }
                    });
                }

                let network = new vis.Network(document.getElementById('graph'), {nodes, edges}, options);
            };
            reader.readAsText(file);
            //document.getElementById('my-file').value = '';
        }
    });
}

function refreshGraph() {
    let network = new vis.Network(document.getElementById('graph'), {nodes, edges}, options);
    document.getElementById('answer').innerHTML = null;
}

// Prim's algorithm
function prim() {
    let start = document.getElementById('start').value; // name of start node
    let result = "<strong>Edges included in the tree:\n</strong>"; // string for output
    let breaking = false; // breakdown flag

    // If start node is correct
    if (Nodes.indexOf(start) !== -1) {

        let used = new Array(Nodes.length); // Array of used nodes
        let min_edge_length = new Array(Nodes.length); // Array of minimum edge for each node
        let next_node = new Array(Nodes.length); // Array of next node for each node
        let edges = []; // array for render tree

        // Fill arrays
        for (let i = 0; i < min_edge_length.length; i++) {
            used[i] = false;
            min_edge_length[i] = Infinity;
            next_node[i] = -1;
        }

        // Select start node
        min_edge_length[Nodes.indexOf(start)] = 0;

        // Пo through all the nodes
        for (let i = 0; i < Nodes.length; i++) {
            let min_edge_node = -1;

            // Find index of node with min edge length
            for (let j = 0; j < Nodes.length; j++) {
                if (!used[j] && (min_edge_node === -1 || min_edge_length[j] < min_edge_length[min_edge_node])) {
                    min_edge_node = j;
                }
            }

            // if node not found stop
            if (min_edge_length[min_edge_node] === Infinity) {
                breaking = true;
                break;
            }

            // Select node as used
            used[min_edge_node] = true;

            // Prepare output string and edges for render the tree
            if (next_node[min_edge_node] !== -1) {
                result += Nodes[next_node[min_edge_node]] + ' -> ' + Nodes[min_edge_node] + ' = ' + Graph[next_node[min_edge_node]][min_edge_node] + "\n";
                edges.push({
                    from: next_node[min_edge_node],
                    to: min_edge_node,
                    label: Graph[next_node[min_edge_node]][min_edge_node],
                    arrows: 'to'
                });
            }

            // Update arrays of min edge and next nodes for all nodes
            for (let to = 0; to < Nodes.length; to++) {
                if (Graph[min_edge_node][to] !== 0 && Graph[min_edge_node][to] < min_edge_length[to]) {
                    min_edge_length[to] = Graph[min_edge_node][to];
                    next_node[to] = min_edge_node;
                }
            }
        }

        // Render new Graph
        if (!breaking) {
            let network = new vis.Network(document.getElementById('graph'), {nodes, edges}, options);
        }
    }

    // If tree not found
    else if (breaking) {
        result = '<strong>No MST!</strong>'
    }

    // If input data incorrect
    else {
        result = '<strong>No node with that name</strong>'
    }

    // Return the results of work
    document.getElementById('answer').innerHTML = result;
}

// Dijkstra algorithm
function dijkstra() {
    let start = document.getElementById('start').value; // name of start node
    let end = document.getElementById('end').value; // name of end node
    let breaking = false; // breakdown flag

    // If data is correct start finding path
    if (Nodes.indexOf(start) !== -1 && Nodes.indexOf(end) !== -1) {

        //---------------- Find the distance for all nodes-----------------//

        let distance = []; // Array of distance for all nodes
        let visited = []; // Has the node been visited?
        Nodes.map(() => {
            distance.push(Infinity);
            visited.push(false)
        });

        distance[Nodes.indexOf(start)] = 0; // Set distance of start node = 0

        // Walk through the remaining nodes
        for (let i = 0; i < Nodes.length - 1; i++) {
            let min = Infinity; // minimum weight
            let min_index = 0; // node index with minimum weight

            // Find node with minimum weight
            for (let j = 0; j < Nodes.length; j++) {
                if (!visited[j] && distance[j] <= min) {
                    min = distance[j];
                    min_index = j;
                }
            }

            // If the path was not found, stop the search
            if (min === Infinity) {
                breaking = true;
                break;
            }

            // Updating distance for neighbors of the founded node
            for (let j = 0; j < Nodes.length; j++) {
                if (!visited[j] && Graph[min_index][j] && distance[min_index] !== Infinity && distance[min_index] + Graph[min_index][j] < distance[j]) {
                    distance[j] = distance[min_index] + Graph[min_index][j];
                }
            }

            // Mark as visited
            visited[min_index] = true;
        }

        // Preparation result string for output
        let result = "";
        distance.map((node, index) => {
            if (Nodes[index] !== start) {
                result += (start + ' → ' + Nodes[index] + ' = ' + node) + '\n';
            }
        });

        //---------------------- Find the shortest path ----------------------//

        let path = []; // nodes of shortest path

        // If the search was successful
        if (!breaking) {
            let current_node = Nodes.indexOf(end); // the node where we are now (on start it's end node)
            // While the starting node is reached do...
            while (current_node !== Nodes.indexOf(start)) {
                let current_weight = distance[current_node]; // Weight of current node

                // View all nodes
                for (let i = 0; i < Nodes.length; i++) {

                    // Weight from the current node to the node being viewed
                    let dist = Graph[i][current_node];

                    // If the node is reachable from the current
                    if (dist !== 0) {
                        let searchable_node_weight = current_weight - dist;

                        // Add node to path and change current node
                        if (searchable_node_weight === distance[i]) {
                            path.push(Nodes[current_node]);
                            current_node = i;
                        }
                    }
                }
            }
            // Add start node to path
            path.push(start);

            // Return the results of work
            document.getElementById('answer').innerHTML = '<strong>The shortest path:</strong>\n' + path.reverse().join(' → ') + ' = ' + distance[Nodes.indexOf(end)] + '\n';
            document.getElementById('answer').innerHTML += '\n' + result;
        }

        // If path not found
        else {
            document.getElementById('answer').innerHTML = '<strong>No shortest path!</strong>\n';
        }

    }

    // If input data incorrect
    else {
        // Return the results of work
        document.getElementById('answer').innerHTML = '<strong>No node with that name</strong>';
    }
}





