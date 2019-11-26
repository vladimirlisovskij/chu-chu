from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from keras.layers import Dense, Dropout, Flatten
from keras.layers import Conv2D, MaxPooling2D
from keras.models import Sequential, load_model
from keras.losses import categorical_crossentropy
from keras.optimizers import Adadelta
from keras.backend import set_session
import tensorflow as tf
import pandas as pd
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

input_shape = (128,)

layers = [{"class_name": "Dense",
                "config": {"units": 10,
                           "activation": "relu"
                           }
                }]

loss_name = "categorical_crossentropy"

optimizer_name = "Adadelta"

mode = "edit"

Sess = tf.Session()
graph = tf.get_default_graph()

batch = 1
epochs = 1

x_frame = None
y_frame = None
val_size = 0

@app.route("/loadModel",
           methods=["POST"])
def get_model():
    global model, graph, Sess, mode, layers

    request.files["load_model"].save("/home/vladimir/PycharmProjects/OPD/files/load_model.h5")

    if mode == "edit":
        mode = "view"

    with graph.as_default():
        set_session(Sess)
        model = load_model("files/load_model.h5")
        layers = model.get_config()["layers"]

    return redirect(url_for("index"),
                    code=302)


@app.route("/saveModel",
           methods=["POST"])
def save_model():
    global model, graph, Sess

    with graph.as_default():
        set_session(Sess)
        model.save("files/save_model.h5")

    return send_from_directory("/home/vladimir/PycharmProjects/OPD/files", "save_model.h5")

@app.route("/create",
           methods=["POST"])
def create():
    global layers

    layer_type = request.form.get("layer_type")  # выпадающий список
    layer_neur = request.form.get("neurons")  # текстовое поле
    layer_activation = request.form.get("activation")  # выпадающий список

    if layer_type == "Dense":
        layers.append({"class_name": layer_type,
                            "config": {"units": int(layer_neur),
                                       "activation": layer_activation
                                       }
                            })
    elif layer_type == "Dropout":
        layers.append({"class_name": layer_type,
                            "config": {"rate": float(layer_neur)}
                            })
    elif layer_type == "Conv2D":
        layers.append({"class_name": layer_type,
                            "config": {"kernel_size": (3, 3),
                                       "filters": int(layer_neur),
                                       "activation": layer_activation
                                       }
                            })
    elif layer_type == "Flatten":
        layers.append({"class_name": layer_type,
                            "config": {}
                            })
    elif layer_type == "MaxPooling2D":
        layers.append({"class_name": layer_type,
                            "config": {"pool_size": (int(layer_neur),
                                                     int(layer_neur))}
                            })

    return redirect(url_for("index"),
                    code=302)


@app.route("/delete/<int:index>",
           methods=["POST"])
def delete(index):
    global layers

    layers.pop(int(index))

    return redirect(url_for("index"),
                    code=302)


@app.route("/modeEdit",
           methods=["POST"])
def change_mode_to_edit():
    global mode, input_shape, loss, loss_name, optimizer, optimizer_name, model, layers, graph, fed, Sess

    if mode == "edit":
        if not len(layers):
            return redirect(url_for("index"),
                            code=302)

        compile_layers = []

        input_shape = list(map(int,
                               request.form.get("input_shape").split(" ")))

        with graph.as_default():
            set_session(Sess)
            loss_name = request.form.get("loss")
            if loss_name == "categorical_crossentropy":
                loss = categorical_crossentropy

            optimizer_name = request.form.get("optimizer")
            if optimizer_name == "Adadelta":
                optimizer = Adadelta()

            firs_layer = layers[0]
            if firs_layer["class_name"] == "Dense":
                compile_layers.append(Dense(units=firs_layer["config"]["units"],
                                                 activation=firs_layer["config"]["activation"],
                                                 input_shape=input_shape))
            elif firs_layer["class_name"] == "Dropout":
                compile_layers.append(Dropout(rate=firs_layer["config"]["rate"],
                                                   input_shape=input_shape))
            elif firs_layer["class_name"] == "Flatten":
                compile_layers.append(Flatten(input_shape=input_shape))
            elif firs_layer["class_name"] == "Conv2D":
                compile_layers.append(Conv2D(kernel_size=firs_layer["config"]["kernel_size"],
                                                  filters=firs_layer["config"]["filters"],
                                                  activation=firs_layer["config"]["activation"],
                                                  input_shape=input_shape))
            elif firs_layer["class_name"] == "MaxPoling2D":
                compile_layers.append(MaxPooling2D(pool_size=firs_layer["config"]["pool_size"],
                                                        input_shape=input_shape))

            for layer in layers[1:]:
                if layer["class_name"] == "Dense":
                    compile_layers.append(Dense(units=layer["config"]["units"],
                                                     activation=layer["config"]["activation"]))
                elif layer["class_name"] == "Dropout":
                    compile_layers.append(Dropout(rate=layer["config"]["rate"]))
                elif layer["class_name"] == "Flatten":
                    compile_layers.append(Flatten())
                elif layer["class_name"] == "Conv2D":
                    compile_layers.append(Conv2D(kernel_size=layer["config"]["kernel_size"],
                                                      filters=layer["config"]["filters"],
                                                      activation=layer["config"]["activation"]))
                elif layer["class_name"] == "MaxPoling2D":
                    compile_layers.append(MaxPooling2D(pool_size=layer["config"]["pool_size"]))

            model = Sequential(compile_layers)
            model.compile(optimizer=optimizer,
                          loss=loss,
                          metrics=["acc"])

        mode = "view"
        fed = False

    else:
        mode = "edit"

    return redirect(url_for("index"),
                    code=302)


def do_feed():
    global batch, epochs, x_frame, y_frame, Sess, graph, epochs, val_size

    x_val = x_frame[:val_size]
    y_val = y_frame[:val_size]

    x_frame1 = x_frame[val_size:]
    y_frame1 = y_frame[val_size:]


    per = 100/(x_frame1.__len__())
    per2 = 100/epochs

    socketio.on("connect", namespace="/iter")
    socketio.on("connect", namespace="/epoch")
    socketio.on("connect", namespace="/acc")
    for j in range(epochs):
        print(j, "!!!!!!!!!!")
        socketio.emit("progress", {"text": int((j)* per2)}, namespace="/epoch")
        for i in range(x_frame1.__len__()//batch*batch):
            with graph.as_default():
                set_session(Sess)
                hist = model.fit(x=x_frame1[i:i+batch],
                          y=y_frame1[i:i+batch],
                                 validation_data = (x_val,
                                                    y_val))

            # print(hist.history['acc'])
            socketio.emit("progress", {"text": [str(hist.history['loss'][0]), str(hist.history['val_loss'][0])]}, namespace="/acc")

            socketio.emit("progress", {"text":int((1 + i )* per)}, namespace="/iter")
        socketio.emit("progress", {"text": 100}, namespace="/iter")
    print(x_frame.__len__(), batch)
    socketio.emit("progress", {"text": 100}, namespace="/epoch")
    socketio.on("connect", namespace="/test22")
    socketio.emit("isConnected", {"isConnected": True }, namespace="/test22")

    socketio.on("disconnect", namespace="/test22")
    socketio.on("disconnect", namespace="/iter")



@app.route("/feed",
           methods=["POST", "GET"])
def feed():
    global model, graph, mode, Sess, batch, epochs, x_frame, y_frame, app, val_size

    batch = int(request.form.get("batch"))
    epochs = int(request.form.get("epochs"))
    val_size = int(request.form.get("val_size"))

    # request.files["x_frame"].save("/home/vladimir/PycharmProjects/OPD/files/x_frame.csv")
    x_frame = pd.read_csv("files/x_frame.csv").to_numpy()

    # request.files["y_frame"].save("/home/vladimir/PycharmProjects/OPD/files/y_frame.csv")
    y_frame = pd.read_csv("files/y_frame.csv").to_numpy()

    mode = "feed_load"

    return redirect(url_for("index"),
                    code=302)



@app.route("/modeFeed",
           methods=["POST"])
def change_mode_to_feed():
    global mode, model

    if mode == "view":
        mode = "feed"
    elif mode == "feed" or mode == "feed_load":
        mode = "view"

    return redirect(url_for("index"),
                    code=302)

@app.route("/modePredict",
           methods=["POST"])
def change_mode_to_predict():
    global mode, model

    if mode == "view":
        mode = "predict"
    elif mode == "predict":
        mode = "view"

    return redirect(url_for("index"),
                    code=302)


@app.route("/predict",
           methods=["POST"])
def predict():
    global model, graph, Sess

    request.files["data"].save("/home/vladimir/PycharmProjects/OPD/files/data.csv")
    data = pd.read_csv("files/data.csv").to_numpy()

    with graph.as_default():
        set_session(Sess)
        print(model.predict(data))

    return redirect(url_for("index"),
                    code=302)


@app.route("/",
           methods=["POST",
                    "GET"
                    ])
def index():
    global layers, loss, mode, optimizer, input_shape, bath

    if mode == "edit":
        return render_template("editTemplate.html",
                               len=len(layers),
                               lay=layers,
                               loss=loss_name,
                               optimizer=optimizer_name,
                               input_shape=input_shape)
    elif mode == "view":
        return render_template("viewTemplate.html",
                               len=len(layers),
                               layers=layers,
                               loss=loss_name,
                               optimizer=optimizer_name,
                               input_shape=input_shape)
    elif mode == "feed":
        return render_template("feedTemplate.html")
    elif mode == "feed_load":
        socketio.start_background_task(target=do_feed)
        return render_template("load.html")
    elif mode == "predict":
        return render_template("predictTemplate.html")


if __name__ == "__main__":
    app.run(debug=True)