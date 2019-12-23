let train_acc = [];
let val_acc = [];
let i = 0;
let labels = [];

document.getElementById("go_back").style.display = "none";

let app = new Vue({
    el: "#iter",
    data: {
        progress: 0,
        socket: null,
    },
    created: function() {
        socket = io.connect("http://" + document.domain + ":" + location.port + "/iter");
        socket.on("progress", (msg) => {
            this.progress = msg.text;
        });
    },
});

let app2 = new Vue({
    el: "#epoch",
    data: {
        progress: 0,
        socket: null,
    },
    created: function() {
        socket = io.connect("http://" + document.domain + ":" + location.port + "/epoch");
        socket.on("progress", (msg) => {
            this.progress = msg.text;
        });
    },
});

let app3 = new Vue({
    data: {
        socket: null,
    },
    created: function() {
        socket = io.connect("http://" + document.domain + ":" + location.port + "/acc");
        socket.on("progress", (msg) => {
            train_acc.push(Number(msg.text[0]));
            val_acc.push(Number(msg.text[1]));
            labels.push(i);
            i++;
        });
    },
});

socket2 = io.connect("http://" + document.domain + ":" + location.port + "/test22");
socket2.on("isConnected", function(data) {
// Receive the 'data' and check if 'isConnected' is true

if(data.isConnected === true) {
    // Now hide the div.
    document.getElementById("go_back").style.display = "inline-block";
    // Create liteChart.js Object
    let d = new liteChart("chart", {
        axisX: {
            show: true,
            color: "#e9edf1",
            width: 2,
            value: "",
        },
        axisY: {
            show: true,
            color: "#e9edf1",
            width: 2,
            value: "",
            minValue: 0,
            maxValue: 0,
        },
        line: {
            width: 2,
            style: "straight",
            shadow: true,
        },
        point: {
            show: false
        }
    });
    // Set labels
    d.setLabels(labels);
    // Set legends and values
    console.log(val_acc);
    d.addLegend({"name": "train acc", "stroke": "#CDDC39", "values": train_acc});
    d.addLegend({"name": "val acc", "stroke": "#9e77dc", "values": val_acc});

    // Inject chart into DOM object
    let div = document.getElementById("your-id");
    d.inject(div);

    // Draw
    d.draw();
    }
});