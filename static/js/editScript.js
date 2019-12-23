var ol = document.getElementById("layers_list");


let num = document.getElementsByTagName('li');
num = num.length;
for (let i = 0; i < num; i ++) {
    let doc = document.getElementById(i);
    doc.onclick = function (event) {
        if (event.target.tagName == "BUTTON") {
            let id = this.id + 1;
            this.remove();
            alert(id, document.getElementById(id+1).id);
            for (let i = id; i < num; i++) {
                document.getElementById(i).id = i - 1;
            }
            num--;
        }
    };
}


function disp() {
    let units = document.getElementById("units");
    let activation = document.getElementById("activation");
    let name = document.getElementById("layers");

    if (name.value === "Flatten"){
        activation.style.display = "none";
        units.style.display = "none";
    } else if (name.value === "Dropout"){
        activation.style.display = "none";
        units.style.display = "inline-block";
    } else {
        activation.style.display = "inline-block";
        units.style.display = "inline-block";
    }
}

function create() {
    let units = document.getElementById("units");
    let activation = document.getElementById("activation");
    let name = document.getElementById("layers");
    let num = document.getElementsByTagName('li');
    num = num.length;
    num ++;

    let li = document.createElement('li');
    let div = document.createElement("div");
    div.style.display = "flex";

    let but = document.createElement("button");
    but.innerText = "[X]";

    num ++;
    li.id = num-1;
    li.onclick = function (event) {
        if (event.target.tagName == "BUTTON") {
            let id = this.id;
            this.remove();
            num--;
            for (let i = id + 1; i < num; i++) {
                console.log(i, num);
                document.getElementById(i).id = i - 1;
            }
        }
    };

    let new_el = document.createElement("p");
    if (name.value === "Flatten"){
        new_el.innerText = name.value;
    } else if (name.value === "Dropout"){
    new_el.innerText = name.value + " " + units.value ;
    } else {
        new_el.innerText = name.value + " " + units.value + " " +  activation.value;
    }
    div.appendChild(but);
    div.appendChild(new_el);

    li.appendChild(div);
    ol.appendChild(li);
}

function send (){
    let arr = document.querySelectorAll("li");
    let num = arr.length;
    if (!num){
    } else {
        let result = [];

        for (let i = 0; i < num; i ++) {
            let text = arr[i].innerText.split("\n")[2].split(" ");
            if (text[0] === "Flatten") {
                result.push([text[0]]);
            } else if (text[0] === "Dropout") {
                result.push([text[0], text[1]]);
            } else {
                result.push([text[0], text[1], text[2]]);
            }
        }
        let res = [];
        res.push(result);
        res.push(document.getElementById("input_shape").value);
        res.push(document.getElementById("loss").value);
        res.push(document.getElementById("optimizer").value);
        window.location.href = "/ok/" + JSON.stringify(res);
    }
}

