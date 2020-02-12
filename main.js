let Nodes = [];
let Graph = [];

function parse_nodes(cities) {
    let nodes = [];
    cities.map((item, index) => {
        nodes.push({id: index, label: item.trim()});
        Nodes.push(item.trim());
    });
    return nodes;
}

function parse_edges(input_weights) {
    let edges = [];
    input_weights.map((item, index) => {
        let GraphObj = [];
        let weights = item.trim().split(/(?: )+/);
        weights.map((value, id) => {
            GraphObj.push(Number(value));
            if (value !== "0") {
                let founded = false;
                edges.map((edges_val, edges_index) => {
                    if (JSON.stringify(edges_val) === JSON.stringify({
                        from: id,
                        to: index,
                        label: value,
                        arrows: 'to'
                    })) {
                        edges[edges_index].arrows = 'to;from';
                        founded = true;
                    }
                });
                if (!founded) {
                    edges.push({from: index, to: id, label: value, arrows: 'to'});
                }
            }
        });
        Graph.push(GraphObj);
    });
    return edges;
}

function Dijkstra() {
    let value = document.getElementById('start-node').value;
    if (Nodes.indexOf(value) !== -1) {
        let distance = [];
        let visited = [];
        Nodes.map(() => {
            distance.push(Infinity);
            visited.push(false)
        });
        distance[Nodes.indexOf(value)] = 0;
        for (let i = 0; i < Nodes.length - 1; i++) {
            let min = Infinity;
            let min_index = 0;
            for (let j = 0; j < Nodes.length; j++) {
                if (!visited[j] && distance[j] <= min) {
                    min = distance[j];
                    min_index = j;
                }
            }
            visited[min_index] = true;
            for (let j = 0; j < Nodes.length; j++) {
                if (!visited[j] && Graph[min_index][j] && distance[min_index] !== Infinity && distance[min_index] + Graph[min_index][j] < distance[j]) {
                    distance[j] = distance[min_index] + Graph[min_index][j];
                }
            }
        }
        let result = "";
        distance.map((node, index) => {
            if (Nodes[index] !== value) {
                result += (value + ' → ' + Nodes[index] + ' = ' + node) + '\n';
            }
        });
        document.getElementById('answer').innerHTML = result;
    }
}

document.getElementById('my-file').addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            let data = e.target.result.split('\n');
            let nodes = parse_nodes(data[1].split(' '));
            let input_weights = data.slice(2);
            let edges = parse_edges(input_weights);

            let options = {
                layout: {randomSeed: 20180310806},
                nodes: {color: {border: 'black', background: 'white'}, font: {color: 'black'}},
                edges: {color: 'black'}
            };

            document.getElementById('start-data').innerHTML +=
                '  <h3 style="color: #000">Найти кратчайшие растояния</h3>\n' +
                '  <input id=\'start-node\' type="text" onfocus="this.value=\'\'" value="Начальная вершина">\n' +
                '  <input type="button" value="Выбрать" id=\'button\' onclick=\'Dijkstra()\'>\n';
            let network = new vis.Network(document.getElementById('graph'), {nodes, edges}, options);
            network.once('stabilized', function () {
                let scaleOption = {scale: 1.2};
                network.moveTo(scaleOption);
            })
        };
        reader.readAsText(file);
    }
});

document.getElementById('start-data').addEventListener('keydown', function(e) {
    if (e.keyCode === 13) {
        Dijkstra(document.getElementById('start-node').value);
    }
});


