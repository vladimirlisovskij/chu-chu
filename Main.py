from flask import Flask, render_template, request, redirect, url_for
from keras.layers import Dense, Dropout, Flatten
from keras.layers import Conv2D, MaxPooling2D
from keras.models import Sequential
from keras.losses import categorical_crossentropy
from keras.optimizers import Adadelta
from keras.backend import set_session
import tensorflow as tf
import pandas as pd

app = Flask(__name__)

input_shape = (128,)

layers_list = [{"class_name": "Dense",
                "config": {"units": 10,
                           "activation": "relu"
                           }
                }]

loss_name = "categorical_crossentropy"

optimizer_name = "Adadelta"

mode = "edit"

fed = False

Sess = tf.Session()
graph = tf.get_default_graph()

model = None


@app.route("/create",
           methods=["POST"])
def create():
    global layers_list

    layer_type = request.form.get("layer_type")  # выпадающий список
    layer_neur = request.form.get("neurons")  # текстовое поле
    layer_activation = request.form.get("activation")  # выпадающий список

    if layer_type == "Dense":
        layers_list.append({"class_name": layer_type,
                            "config": {"units": int(layer_neur),
                                       "activation": layer_activation
                                       }
                            })
    elif layer_type == "Dropout":
        layers_list.append({"class_name": layer_type,
                            "config": {"rate": float(layer_neur)}
                            })
    elif layer_type == "Conv2D":
        layers_list.append({"class_name": layer_type,
                            "config": {"kernel_size": (3, 3),
                                       "filters": int(layer_neur),
                                       "activation": layer_activation
                                       }
                            })
    elif layer_type == "Flatten":
        layers_list.append({"class_name": layer_type,
                            "config": {}
                            })
    elif layer_type == "MaxPooling2D":
        layers_list.append({"class_name": layer_type,
                            "config": {"pool_size": (int(layer_neur),
                                                     int(layer_neur))}
                            })

    return redirect(url_for("index"),
                    code=302)


@app.route("/delete/<int:index>",
           methods=["POST"])
def delete(index):
    global layers_list

    layers_list.pop(int(index))

    return redirect(url_for("index"),
                    code=302)


@app.route("/modeEdit",
           methods=["POST"])
def change_mode_to_edit():
    global mode, input_shape, loss, loss_name, optimizer, optimizer_name, model, layers_list, graph, fed, Sess

    if mode == "edit":
        if not len(layers_list):
            return redirect(url_for("index"),
                            code=302)

        compile_layers_list = []

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

            firs_layer = layers_list[0]
            if firs_layer["class_name"] == "Dense":
                compile_layers_list.append(Dense(units=firs_layer["config"]["units"],
                                                 activation=firs_layer["config"]["activation"],
                                                 input_shape=input_shape))
            elif firs_layer["class_name"] == "Dropout":
                compile_layers_list.append(Dropout(rate=firs_layer["config"]["rate"],
                                                   input_shape=input_shape))
            elif firs_layer["class_name"] == "Flatten":
                compile_layers_list.append(Flatten(input_shape=input_shape))
            elif firs_layer["class_name"] == "Conv2D":
                compile_layers_list.append(Conv2D(kernel_size=firs_layer["config"]["kernel_size"],
                                                  filters=firs_layer["config"]["filters"],
                                                  activation=firs_layer["config"]["activation"],
                                                  input_shape=input_shape))
            elif firs_layer["class_name"] == "MaxPoling2D":
                compile_layers_list.append(MaxPooling2D(pool_size=firs_layer["config"]["pool_size"],
                                                        input_shape=input_shape))

            for layer in layers_list[1:]:
                if layer["class_name"] == "Dense":
                    compile_layers_list.append(Dense(units=layer["config"]["units"],
                                                     activation=layer["config"]["activation"]))
                elif layer["class_name"] == "Dropout":
                    compile_layers_list.append(Dropout(rate=layer["config"]["rate"]))
                elif layer["class_name"] == "Flatten":
                    compile_layers_list.append(Flatten())
                elif layer["class_name"] == "Conv2D":
                    compile_layers_list.append(Conv2D(kernel_size=layer["config"]["kernel_size"],
                                                      filters=layer["config"]["filters"],
                                                      activation=layer["config"]["activation"]))
                elif layer["class_name"] == "MaxPoling2D":
                    compile_layers_list.append(MaxPooling2D(pool_size=layer["config"]["pool_size"]))

            model = Sequential(compile_layers_list)
            model.compile(optimizer=optimizer,
                          loss=loss)

        mode = "view"
        fed = False

    else:
        mode = "edit"

    return redirect(url_for("index"),
                    code=302)


@app.route("/feed",
           methods=["POST"])
def feed():
    global model, graph, mode, fed, Sess

    mode = "view"

    batch = int(request.form.get("batch"))
    epochs = int(request.form.get("epochs"))

    request.files["x_frame"].save("/home/vladimir/PycharmProjects/OPD/files/x_frame.csv")
    x_frame = pd.read_csv("files/x_frame.csv").to_numpy()

    request.files["y_frame"].save("/home/vladimir/PycharmProjects/OPD/files/y_frame.csv")
    y_frame = pd.read_csv("files/y_frame.csv").to_numpy()

    with graph.as_default():
        set_session(Sess)
        w = model.get_weights()
        print (w)
        print()
        model.fit(x=x_frame,
                  y=y_frame,
                  epochs=epochs,
                  batch_size=batch)
        print(model.get_weights())
        print()
        model.set_weights(w)
        print()
        print(model.get_weights())

    fed = True

    return redirect(url_for("index"),
                    code=302)


@app.route("/modeFeed",
           methods=["POST"])
def change_mode_to_feed():
    global mode, model, graph

    if mode == "view":
        mode = "feed"
    elif mode == "feed":
        mode = "view"

    return redirect(url_for("index"),
                    code=302)

@app.route("/modePredict",
           methods=["POST"])
def change_mode_to_predict():
    global mode, model, graph

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
    global layers_list, loss, mode, optimizer, input_shape

    if mode == "edit":
        return render_template("editTemplate.html",
                               len=len(layers_list),
                               lay=layers_list,
                               loss=loss_name,
                               optimizer=optimizer_name,
                               input_shape=input_shape)
    elif mode == "view":
        return render_template("viewTemplate.html",
                               len=len(layers_list),
                               lay=layers_list,
                               loss=loss_name,
                               optimizer=optimizer_name,
                               input_shape=input_shape,
                               fed = fed)
    elif mode == "feed":
        return render_template("feedTemplate.html")
    elif mode == "predict":
        return render_template("predictTemplate.html")


if __name__ == "__main__":
    app.run(debug=True)