/**
 * liteChart.js object.
 * @constructor
 * @param {String} id - DOM id for chart object
 * @param {Object} settings
 */
function liteChart(id, settings) {

	// Check id is duplicated
	let element = document.getElementById(id);

	if(undefined != element) {
		throw new Error("DOM id " + id + " is already exist.");
	}

	// Attributes: Common
	this.id = id;
	
	panel = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	panel.setAttribute("id", id);
	panel.setAttribute("class", id);
	var def = {
		animate: {
			show: this.isIE ? false : true,
			duration: 0.5,                        // Set animation duration (seconds)
		},
		axisX: {
			show: true,
			color: "#e9edf1",
			width: 2,
			value: "",
			minValue: 0,
			maxValue: 0,
		},
		axisY: {
			show: true,
			color: "#e9edf1",
			width: 2,
			value: "",
			minValue: 0,
			maxValue: 0,
		},
		eventCoord: {
			x: 0,
			y: 0,
		},
		fill: "gradient", // null, origin or gradient
		gridX: {
			show: true,
			interval: 0,
			fill: 1,
			label: {
				show: true
			},
			stroke:"#e9edf1",
			width:2,
			dasharray:"0 10.04",
			linecap:"round",
		},
		gridY: {
			show: true,
			interval: 0,
			fill: 1,
			label: {
				show: true
			},
			stroke:"#e9edf1",
			width:2,
			dasharray:"0 10.04",
			linecap:"round",
		},
		isIE: (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (navigator.userAgent.toLowerCase().indexOf("msie") != -1) ? true : false,
		labels: {
			show: true,
			fontColor: "#c5c6d0",
			fontSize: 12,
			fontFamily: "sans-serif",
			fontWeight: "normal",
			list: null,
		},
		legends: {
			list: null,
			map: null,
			table: {
				show: true,
				position: {
					x: "center",
					y: 370,
				},
				direction: "horizontal",
			},
			fill: "#c5c6d0",
		},
		line: {
			width: 3,
			style: "curve", // curve | straight
			shadow: true,
			dasharray: null, // null or value
		},
		padding: {
			top: 55,
			right: 15,
			bottom: 40,
			left: 20,
		},
		panel: panel,
		point: {
			show: true,
			radius: 5,
			strokeWidth: 5,
			stroke: "#ffffff", // null or color by hex/rgba
		},
		tooltip: {
			show: true,
			backgroundColor: "rgba(255, 255, 255, 0.8)",
			fontColor: "#000000",
			object: null,
		},
		type: "Line",
		valueOnliteChart: {
			show: false,
		},
	};
	Object.assign(this,def,settings);
}

/**
 * Create NS element
 * @param {String} elem - element type Example: rect, line, circle
 * @param {Object} attributes
 * @returns {String} svg element
 */
function createElement( elem, attributes ) {
	el = document.createElementNS("http://www.w3.org/2000/svg", elem);
	for (var key in attributes) {
		el.setAttribute(key, attributes[key]);
	}
	return el;
}

/**
 * Create SVG element: text
 */
function createText( id, x, y, fontSize, textAnchor, alignmentBaseline, fill, contents ) {
	// Modify y coordinate beacuse IE not supported alignment-baseline attribute
	let agent = navigator.userAgent.toLowerCase();

	if(chart.isIE) {
		if("hanging" == alignmentBaseline) {
			y += fontSize;
		} else if("middle" == alignmentBaseline) {
			y += fontSize/2;	
		} else if("baseline" == alignmentBaseline) {
			// No modify
		}
	}
	
	let text = createElement( "text", {"id":id,"x":x.toFixed(0),"y":y.toFixed(0),"font-size":fontSize,"text-anchor":textAnchor,"fill":fill} );
	
	// IE not supported alignment-baseline attribute
	if(!chart.isIE) {
		text.setAttribute("alignment-baseline", alignmentBaseline);	
	}

	text.innerHTML = contents;
	text.textContent = contents;

	return text;
}

/**
 * Get path
 */
function getPath(chart,chords) {
	i = 0;
	path = "";
	if ( "straight" === chart.line.style ) {
		chords.forEach(function(elem) {
			if ( i === 0 ) {
				path += " M ";
			}
			path += elem.x1.toFixed(0) + " " + elem.y1.toFixed(0) + " ";
			++i;
			if ( chords.length === i ) {
				path += elem.x2.toFixed(0) + " " + elem.y2.toFixed(0);
			}
		});
	} else if ( "curve" === chart.line.style ) {
		chords.forEach(function(elem) {
			if ( i === 0 ) {
				path += "M " + elem.x1.toFixed(0) + " " + elem.y1.toFixed(0);
			}
			path += " C " + elem.cx1.toFixed(0) + " " + elem.cy1.toFixed(0) + " " + elem.cx2.toFixed(0) + " " + elem.cy2.toFixed(0) + " " + elem.x2.toFixed(0) + " " + elem.y2.toFixed(0);
			++i;
		});
	}
	return path;
}

/**
 * Get width of chart object.
 * @returns {Number} width of chart object
 */
liteChart.prototype.getWidth = function() {
	return this.panel.getBoundingClientRect().width;
}

/**
 * Get height of chart object.
 * @returns {Number} height of chart object
 */
liteChart.prototype.getHeight = function() {
	return this.panel.getBoundingClientRect().height;
}

/**
 * Set labels.
 * @param {(String|Array)} labels - array of label string.
 */
liteChart.prototype.setLabels = function(labels) {
	this.labels.list = labels;
}

/**
 * Add legend and values.
 * name, values attributes are required.
 * @param {Object} legend - (String) name, (String) fill, (String) stroke, (Number|Array) values
 */
liteChart.prototype.addLegend = function(legend) {

	let r = null;
	let g = null;
	let b = null;

	if(null == this.legends.list) {
		this.legends.list = new Array();
	}

	if(undefined == legend.fill) {

		r = Math.floor(Math.random() * 255);
		g = Math.floor(Math.random() * 255);
		b = Math.floor(Math.random() * 255);

		legend.fill = "rgba("
			+ r + ", "
			+ g + ", "
			+ b + ", 0.9)";
	}

	if(undefined == legend.stroke) {

		if(null != r) {

			r -= 10;
			r = r < 0 ? 0 : r;

			g -= 10;
			g = g < 0 ? 0 : g;

			b -= 10;
			b = b < 0 ? 0 : b;
		}

		legend.stroke = "rgba("
			+ r + ", "
			+ g + ", "
			+ b + ", 1)";
	}

	this.legends.list.push(legend);

	if(null == this.legends.map) {
		this.legends.map = new Map();
	}

	this.legends.map.set(legend.name, legend);
}

/**
 * Remove legend.
 * @param {string} name - legend name
 */
liteChart.prototype.removeLegend = function(name) {

	let index = -1;

	if(null == this.legends.list) {
		return;
	}

	for(let i = 0; i < this.legends.list.length; i++) {

		if(this.legends.list[i].name == name) {
			index = i;
			break;
		}
	}

	if(index > -1) {

		this.legends.list.splice(index, 1);
		this.legends.map.delete(name);
	}
}

/**
 * Get legend by name.
 * @param {string} name - legend name
 * @returns {Object} legend
 */
liteChart.prototype.getLegend = function(name) {
	return this.legends.map.get(name);
}

/**
 * Get minimum value.
 * @returns {Number} value
 */
liteChart.prototype.getMinValue = function() {
	let minValue = 0;
	let value = 0;
	let legendList = this.legends.list;
	let values = this.values;
	legendList.forEach(function(legend) {
		legend.values.forEach(function(value) {
			if(minValue > value) {
				minValue = value;
			}
		});
	});
	return minValue;
}

/**
 * Get maximum value.
 * @returns {Number} value
 */
liteChart.prototype.getMaxValue = function() {
	let maxValue = 0;
	let value = 0;
	let legendList = this.legends.list;
	let values = this.values;
	legendList.forEach(function(legend) {

		legend.values.forEach(function(value) {

			if(maxValue < value) {
				maxValue = value;
			}
		});
	});
	return maxValue;
}

/**
 * Show tooltip event handler
 * @param {Object} event - event object
 * @param {Object} element - DOM object invoked event
 * @param {Object} chart - chart.js object
 */
liteChart.prototype.showTooltip = function(event, element, chart) {

	let x = event.clientX;
	let y = event.clientY;

	// If event invoked at same coordinate, end this function.
	if(x == chart.eventCoord.x && y == chart.eventCoord.y) {
		return;
	} else {
		chart.eventCoord.x = x;
		chart.eventCoord.y = y;
	}

	let legendName = element.getAttribute("legend");
	let legend = chart.getLegend(legendName);
	let value = element.getAttribute("value");
	let label = element.getAttribute("label");
	let fontSize = chart.labels.fontSize;

	let margin = (fontSize * 0.5);

	let line1 = margin;
	let line2 = fontSize + (2 * margin);
	let line3 = (2 * fontSize) + (3 * margin);
	let line4 = (3 * fontSize) + (4 * margin);

	let width = 0;
	let widthLegend = 0;
	let widthValue = 0;
	let height = line4;

	let tooltipGroup = chart.tooltip.object;
	let ani = null;

	x += 10;
	y += 10;

	if(null == tooltipGroup || undefined == tooltipGroup) {

		tooltipGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		if(!chart.isIE) {
			tooltipGroup.classList.add("tooltips");
		}

		let box = createElement( "rect", {"id":chart.id + "-tooltip","x":x,"y":y,"width":0,"height":height,"fill":chart.tooltip.backgroundColor,stroke:"transparent","rx":5,"ry":5} );
		tooltipGroup.appendChild(box);

		let labelText = createText(chart.id + "-tooltip-label-text", x + margin, y + line1, fontSize, "start", "hanging", chart.tooltip.fontColor, label);
		tooltipGroup.appendChild(labelText);

		let legendMark = createElement( "rect", {"id":chart.id + "-tooltip-legend-mark","x":x + margin,"y":y + line2,"width":fontSize,"height":fontSize,"fill":legend.fill,stroke:legend.stroke} );
		tooltipGroup.appendChild(legendMark);

		let legendText = createText(chart.id + "-tooltip-legend-name", x + ((2 * margin) + fontSize), y + line2, fontSize, "start", "hanging", chart.tooltip.fontColor, legendName + ": ");
		tooltipGroup.appendChild(legendText);

		let valueText = createText(chart.id + "-tooltip-value", x + margin, y + line3, fontSize, "start", "hanging", chart.tooltip.fontColor, value);
		tooltipGroup.appendChild(valueText);

		chart.tooltip.object = tooltipGroup; // Set for manage as singleton
		chart.panel.appendChild(chart.tooltip.object);

		// Resize box by text width
		widthLegend = (legendMark.getAttribute("width") * 1) + margin + legendText.getBoundingClientRect().width;
		widthValue = valueText.getBoundingClientRect().width;
		width = (widthLegend > widthValue ? widthLegend : widthValue) + (2 * margin);

		box.setAttribute("width", width);
		
	} else {

		tooltipGroup = chart.tooltip.object;

		let box = tooltipGroup.childNodes[0];
		let labelText = tooltipGroup.childNodes[1];
		let legendMark = tooltipGroup.childNodes[2];
		let legendText = tooltipGroup.childNodes[3];
		let valueText = tooltipGroup.childNodes[4];

		box.setAttribute("x", x);
		box.setAttribute("y", y);

		labelText.setAttribute("x", x + margin);
		labelText.setAttribute("y", y + line1);
		labelText.innerHTML = label;

		legendMark.setAttribute("x", x + margin);
		legendMark.setAttribute("y", y + line2);
		legendMark.setAttribute("fill", legend.fill);
		legendMark.setAttribute("stroke", legend.stroke);

		legendText.setAttribute("x", x + ((2 * margin) + fontSize));
		legendText.setAttribute("y", y + line2);
		legendText.innerHTML = legendName;

		valueText.setAttribute("x", x + margin);
		valueText.setAttribute("y", y + line3);
		valueText.innerHTML = value;

		// Resize box by text width
		widthLegend = (legendMark.getAttribute("width") * 1) + margin + legendText.getBoundingClientRect().width;
		widthValue = valueText.getBoundingClientRect().width;
		width = (widthLegend > widthValue ? widthLegend : widthValue) + (2 * margin);

		box.setAttribute("width", width);

		// If tooltip box position is out of chart area, reset coordinates
		if(x < 0 || (x + width) > chart.getWidth()) {

			x = chart.getWidth() - width;

			box.setAttribute("x", x);
			labelText.setAttribute("x", x + margin);
			legendMark.setAttribute("x", x + margin);
			legendText.setAttribute("x", x + ((2 * margin) + fontSize));
			valueText.setAttribute("x", x + margin);
		}

		if(y < 0 || (y + height) > chart.getHeight()) {

			y = chart.getHeight() - height;

			box.setAttribute("y", y);
			labelText.setAttribute("y", y + line1);
			legendMark.setAttribute("y", y + line2);
			legendText.setAttribute("y", y + line2);
			valueText.setAttribute("y", y + line3);
		}
	}
}

/**
 * Hide tooltip event handler
 * @param {Object} event - event object
 * @param {Object} chart - chart.js object
 */
liteChart.prototype.hideTooltip = function(event, chart) {

	let x = event.clientX;
	let y = event.clientY;

	// If event invoked at same coordinate, end this function.
	if(x == chart.eventCoord.x && y == chart.eventCoord.y) {
		return;
	}
	else {
		chart.eventCoord.x = x;
		chart.eventCoord.y = y;
	}

	let tooltipGroup = chart.tooltip.object;

	// Move tooptip components to outside of chart area
	if(null != tooltipGroup) {

		let outsideX = chart.getWidth() + 10;
		let outsideY = chart.getHeight() + 10;
		let child = null;

		for(let i = 0; i < tooltipGroup.childNodes.length; i++) {
			child = tooltipGroup.childNodes[i];
			child.setAttribute("x", outsideX);
			child.setAttribute("y", outsideY);
		}
	}
}

/**
 * Inject chart.js object to DOM object.
 * @param {Object} obj - DOM object to inject chart.js object
 */
liteChart.prototype.inject = function(obj) {

	obj.appendChild(this.panel);

	let chart = this;
	let panel = this.panel;
	panel.style.width = obj.clientWidth;
	panel.style.height = obj.clientHeight;

	window.addEventListener("resize", function() {
		panel.style.width = obj.clientWidth;
		panel.style.height = obj.clientHeight;
		chart.tooltip.object = null;
		chart.draw(false);
	});
}

/**
 * Restart animation of all animated objects.
 */
liteChart.prototype.restartAnimation = function() {

	let animateList = this.panel.getElementsByTagName("animate");

	for(let i = 0; i < animateList.length; i++) {
		animateList[i].beginElement();
	}
}

/**
 * Draw chart by chart type
 * @param {Boolean} restartAnimation - If it's true, restart animation when draw chart
 */
liteChart.prototype.draw = function(restartAnimation) {
	
	var NS = "http://www.w3.org/2000/svg";

	if(undefined == restartAnimation) {
		restartAnimation = true;
	}

	// Remove all element
	while(this.panel.firstChild) {
		this.panel.removeChild(this.panel.firstChild);
		this.tooltip.object = null;
	}
	
	// Create SVG element: line
	let line = function(id, x1, y1, x2, y2, fill, stroke, width) {
		let strokeWidth = undefined == width ? 1 : width;
		let line = createElement( "line", {"id":id,"x1":x1.toFixed(0),"y1":y1.toFixed(0),"x2":x2.toFixed(0),"y2":y2.toFixed(0),"stroke":stroke,"stroke-width":strokeWidth} );
		return line;
	};

	// Create SVG element: curve
	let curve = function(id, x1, y1, cx1, cy1, x2, y2, cx2, cy2, stroke, width) {
		let moveTo = "M " + x1.toFixed(0) + " " + y1.toFixed(0);
		let curveTo = "C " + cx1.toFixed(0) + " " + cy1.toFixed(0) + " " + cx2.toFixed(0) + " " + cy2.toFixed(0) + " " + x2.toFixed(0) + " " + y2.toFixed(0);
		let curve = createElement( "path", {"id":id,"d":moveTo + " " + curveTo,"fill":"transparent","stroke":stroke,"stroke-width":width} );
		return curve;
	};

	// Create SVG element: Gradient
	let area = function(chart,id, chords, stroke, width, fill) {

		path = getPath(chart,chords);
		
		if (id.indexOf("area") !== -1) {
			first = chords[Object.keys(chords)[0]];
			path = path + " V" + ( height - 65 ) + " H" + first.x1.toFixed(0) + " L " + first.x1.toFixed(0) + " " + first.y1.toFixed(0);
			width = 0;
		}
		
		let gradientFill = undefined == fill ? "transparent" : fill;
		let area = createElement( "path", {"id":id,"d":path,"fill":gradientFill,"stroke":stroke,"stroke-width":width} );

		return area;
	};

	// Create SVG element: rect
	let rect = function(id, x, y, width, height, fill, stroke) {
		let rect = createElement( "rect", {"id":id,"x":x,"y":y,"width":width,"height":height,"fill":fill,"stroke":stroke} );
		return rect;
	};

	// Create SVG element: circle
	let circle = function(id, cx, cy, r, fill, stroke, strokeWidth) {
		let circle = createElement( "circle", {"id":id,"cx":cx,"cy":cy,"r":r,"fill":fill,"stroke":stroke,"stroke-width":strokeWidth} );
		return circle;
	};
	
	// Create SVG element: Gradient
	let linearGradient = function(id, color1) {
		let linear = createElement( "linearGradient", {"id":id,"x1":"0%","y1":"0%","x2":"0%","y2":"100%"} );
		let stop1 = createElement( "stop", {"offset":"0%","stop-color":color1,"stop-opacity":"0.1"} );
		let stop2 = createElement( "stop", {"offset":"100%","stop-color":color1,"stop-opacity":"0"} );
		linear.appendChild(stop1);
		linear.appendChild(stop2);
		return linear;
	};
	
	// Create SVG element: Blur
	let blurEffect = function(chart,id, stroke, chords,chordsAnimation) {
		
		let g = document.createElementNS(NS, "g");
		
		path = getPath(chart,chords);
		
		let b = createElement( "path", {"id":id,"d":path,"fill":"transparent","stroke":stroke,"opacity":"0.5","stroke-width":chart.line.width,"filter":"url(#" + id + ")"} );
		let defs = createElement( "defs" );
		let filter = createElement( "filter", {"id":id,"y":0,"x":0} );
		let feOffset = createElement( "feOffset", {"result":"offOut","in":"SourceGraphic","dx":0,"dy":7} );
		let feGaussianBlur = createElement( "feGaussianBlur", {"stdDeviation":5,"in":"offOut"} );
		let feBlend = createElement( "feBlend", {"in":"SourceGraphic","in2":"blurOut","mode":"normal"} );
		
		g.appendChild(defs);
		g.appendChild(b);
		if(chart.animate.show) {
			animation = startAnimaton(chart,b,chordsAnimation);
			b.appendChild(animation);
		}
		defs.appendChild(filter);
		filter.appendChild(feOffset);
		filter.appendChild(feGaussianBlur);
		filter.appendChild(feBlend);
		
		return g;
	};

	// Create SVG element: aniamte
	let animate = function(attributeName, from, to, dur, fill) {
		let animate = createElement( "animate", {"attributeName":attributeName,"from":from,"to":to,"dur":dur,"fill":fill} );
		return animate;
	};
	
	// Start animation
	let startAnimaton = function(chart,parentElement,chords) {
		// Flat line on axis X
		lineD0 = getPath(chart,chords);

		// Current line
		lineD1 = parentElement.getAttribute("d");

		parentElement.setAttribute("d", lineD0);
		animation = animate("d", lineD0, lineD1, chart.animate.duration, "freeze");
		return animation;
	}

	// Common function: add comma
	let addComma = function(num) {
		var regexp = /\B(?=(\d{3})+(?!\d))/g;
		return num.toString().replace(regexp, ',');
	};

	// Calculate label width left of grid y
	let getGridXLabelWidth = function(chart) {

		let width = 0;

		if(!chart.gridX.label.show) {
			return;
		}
				
		let textMargin = chart.labels.fontSize/3;
		let tempText1 = null;
		let tempText2 = null;
		let maxWidth = 0;
		let currentWidth = 0;

		if("Line" == chart.type) {

			tempText1 = createText("tempTextForCalculateWidth"
				, 0, 0
				, chart.labels.fontSize
				, "end", "middle"
				, chart.labels.fontColor
				, addComma(chart.getMaxValue()));

			chart.panel.appendChild(tempText1);
			maxWidth = tempText1.getBoundingClientRect().width;

			tempText2 = createText("tempTextForCalculateWidth"
				, 0, 0
				, chart.labels.fontSize
				, "end", "middle"
				, chart.labels.fontColor
				, addComma(chart.getMinValue()));

			chart.panel.appendChild(tempText2);
			currentWidth = tempText2.getBoundingClientRect().width;

			maxWidth = maxWidth > currentWidth ? maxWidth : currentWidth;

			chart.panel.removeChild(tempText1);
			chart.panel.removeChild(tempText2);
		}

		width = textMargin
			+ maxWidth
			+ 10
			+ textMargin;

		return width;
	}

	// Calculate label height below axis x
	let getLabelHeight = function(chart) {

		let height = 0;

		if(chart.labels.show) {

			let textMargin = chart.labels.fontSize/2;

			height = textMargin + chart.labels.fontSize + textMargin;
		}

		return height;
	}

	// Calculate axis Y min value
	let getAxisYMinValue = function(chart) {

		let axisYMinValue = chart.axisY.minValue;

		let minValue = chart.getMinValue();

		if(0 == axisYMinValue && 0 > minValue) {
			axisYMinValue = minValue;
		}

		return axisYMinValue;
	}

	// Calculate axis Y max value
	let getAxisYMaxValue = function(chart) {

		let axisYMaxValue = chart.axisY.maxValue;

		let maxValue = chart.getMaxValue();

		if(0 == axisYMaxValue && 0 < maxValue) {
			axisYMaxValue = maxValue;
		}

		return axisYMaxValue;
	}

	// Calculate axis X min value
	let getAxisXMinValue = function(chart) {

		let axisXMinValue = chart.axisX.minValue;
		let minValue = chart.getMinValue();

		if(0 == axisXMinValue && 0 > minValue) {
			axisXMinValue = minValue;
		}

		return axisXMinValue;
	}

	// Calculate axis X max value
	let getAxisXMaxValue = function(chart) {

		let axisXMaxValue = chart.axisX.maxValue;
		let maxValue = chart.getMaxValue();

		if(0 == axisXMaxValue && 0 < maxValue) {
			axisXMaxValue = maxValue;
		}

		return axisXMaxValue;
	}

	// Calculate ratio
	let getRatio = function(chart) {

		let valueRange = getAxisYMaxValue(chart) - getAxisYMinValue(chart);
		let graphHeight = chart.getHeight() - chart.padding.top - chart.padding.bottom - getLabelHeight(chart);

		return graphHeight / valueRange;
	}

	let getRatioForX = function(chart) {

		let valueRange = getAxisXMaxValue(chart) - getAxisXMinValue(chart);
		let graphWidth = chart.getWidth() - chart.padding.left - chart.padding.right - getGridXLabelWidth(chart);

		return graphWidth / valueRange;
	}

	// Calculate axis X position
	let getAxisXPosition = function(chart) {

		// Default value is most below position on graph area
		let y = chart.getHeight() - chart.padding.bottom - getLabelHeight(chart);
		let maxValue = getAxisYMaxValue(chart);
		let minValue = getAxisYMinValue(chart);

		// If chart draws only negative values, axis X located highest position 
		if(maxValue < 0) {
			y = chart.padding.top;
		}

		// If chart extends plus and minus values, get zero position
		else if(minValue < 0) {
			y = chart.padding.top + (maxValue * getRatio(chart));
		}

		return y;
	}

	// Calculate axis Y position
	let getAxisYPosition = function(chart) {

		// Default value is most below position on graph area
		let x = chart.padding.left + getGridXLabelWidth(chart);
		let maxValue = getAxisXMaxValue(chart);
		let minValue = getAxisXMinValue(chart);

		// If chart draws only negative values, axis Y located highest position 
		if(maxValue < 0) {
			x = chart.getWidth() - chart.padding.right;
		}

		// If chart extends plus and minus values, get zero position
		else if(minValue < 0) {
			x = x - (minValue * getRatioForX(chart));
		}

		return x;
	}
		
	// Get panel size
	let width = this.getWidth();
	let height = this.getHeight();

	// Get graph area size
	let graphMarginTop = this.padding.top;
	let graphMarginBottom = this.padding.bottom + getLabelHeight(this);
	let graphMarginLeft = this.padding.left + getGridXLabelWidth(this);
	let graphMarginRight = this.padding.right;

	let graphWidth = width - graphMarginLeft - graphMarginRight;
	let graphHeight = height - graphMarginTop - graphMarginBottom;

	// Draw legend table
	let drawLegendTable = function(chart) {

		if(!chart.legends.table.show) {
			return;
		}

		let x = chart.legends.table.position.x;
		let isCenter = false;
		let isRight = false;

		if("center" == x) {
			isCenter = true;
			x = 0;
		} else if("right" == x) {
			isRight = true;
			x = 0;
		}

		let y = chart.legends.table.position.y;

		let legendMark = null;
		let legendText = null;
		let legendIndex = 0;
		let linePosition = 0;
		let wordWrap = 0;
		let margin = chart.labels.fontSize * 0.5;
		let totalWidth = 0;
		let maxWidth = 0;
		let totalHeight = 0;

		let objectArray = new Array();

		x += margin;

		let panel = chart.panel;
		let labelOptions = chart.labels;
		let tableOptions = chart.legends.table;
		
		let g = document.createElementNS(NS, "g");
		if(!chart.isIE) {
			g.classList.add("legends");
		}
		panel.appendChild(g);

		chart.legends.list.forEach(function(legend) {

			if("vertical" == tableOptions.direction) {

				linePosition = y + margin + (3 * margin * legendIndex);

				legendMark = rect(id + "-mark-" + legendIndex, x, linePosition, labelOptions.fontSize, labelOptions.fontSize, legend.fill, legend.stroke);
				g.appendChild(legendMark);
				objectArray.push(legendMark);

				legendText = createText(id + "-text-" + legendIndex
					, x + margin + labelOptions.fontSize
					, linePosition
					, labelOptions.fontSize
					, "start"
					, "hanging"
					, tableOptions.fontColor
					, legend.name);
				g.appendChild(legendText);
				objectArray.push(legendText);
				
				if(!chart.isIE) {
					legendText.classList.add("legend");
				}

				totalWidth = margin + labelOptions.fontSize + margin + legendText.getBoundingClientRect().width;
				maxWidth = maxWidth > totalWidth ? maxWidth : totalWidth;

				totalHeight += margin + labelOptions.fontSize;
				
			} else if("horizontal" == tableOptions.direction) {

				linePosition = y + margin + (3 * margin * wordWrap);

				legendMark = line(id + "-mark-" + legendIndex, x, linePosition + 6, x + 12, linePosition + 6, legend.fill, legend.stroke, 4);
				g.appendChild(legendMark);
				objectArray.push(legendMark);

				x += labelOptions.fontSize + margin;

				legendText = createText(id + "-text-" + legendIndex
					, x
					, linePosition
					, labelOptions.fontSize
					, "start"
					, "hanging"
					, tableOptions.fontColor
					, legend.name);
				g.appendChild(legendText);
				objectArray.push(legendText);
				
				if(!chart.isIE) {
					legendText.classList.add("legend");
				}

				x += legendText.getBoundingClientRect().width + margin;

				totalWidth += margin + labelOptions.fontSize + margin + legendText.getBoundingClientRect().width;
				maxWidth = maxWidth > totalWidth ? maxWidth : totalWidth;

				totalHeight = (margin + labelOptions.fontSize) * (1 + wordWrap);
			}

			++legendIndex;
		});
		
		// Reset object position by align
		if(isCenter) {

			let toCenter = (chart.getWidth() - maxWidth - margin) / 2;

			i = 0;
			objectArray.forEach(function(obj){
				if (obj.nodeName === "line") {
					let x1 = obj.getAttribute("x1") * 1 + toCenter + i;
					let x2 = obj.getAttribute("x2") * 1 + toCenter + i;
					obj.setAttribute("x1", Math.round (x1));
					obj.setAttribute("x2", Math.round (x2));
				} else if (obj.nodeName === "text") {
					let x = obj.getAttribute("x") * 1;
					obj.setAttribute("x", x + toCenter + i);
					i = i + 20;
				}
			});
			
		} else if(isRight) {

			let toRight = (chart.getWidth() - maxWidth - margin * 2);

			objectArray.forEach(function(obj){
				let x = obj.getAttribute("x") * 1;
				obj.setAttribute("x", x + toRight);
			});
		}
	};

	// Draw grid X
	let drawGridX = function(chart) {

		// Draw horizontal grid
		if(!chart.gridX.show) {
			return;
		}

		let axisYMinValue = getAxisYMinValue(chart);
		let axisYMaxValue = getAxisYMaxValue(chart);

		let unit = chart.gridX.interval;

		// Calculate interval if not set it
		if(0 == unit) {

			let range = (axisYMaxValue - axisYMinValue);
			let tempInterval = Math.round(range / 5);
			let intervalLength = ("" + tempInterval).length;
			let digits = Math.pow(10, intervalLength - 1);

			unit = Math.floor(tempInterval / digits) * digits;
		}

		let baseLineValue = Math.ceil(axisYMinValue / unit) * unit;

		let currentLineValue = baseLineValue;
		let currentLineHeight = 0;

		let gridIndex = 0;
		let gridLine = null;
		let gridLineValueLabel = null;

		let fontSize = chart.labels.fontSize;
		let fontFamily = chart.labels.fontFamily;
		let fontWeight = chart.labels.fontWeight;
		
		let g = document.createElementNS(NS, "g");
			chart.panel.appendChild(g);

		while(currentLineValue <= axisYMaxValue) {

			if(currentLineValue < axisYMinValue) {
				currentLineValue += unit;
				continue;
			}

			// Draw grid line
			currentLineHeight = chart.getHeight() - chart.padding.bottom - getLabelHeight(chart) - (currentLineValue - axisYMinValue) * getRatio(chart);
				
			gridLine = createElement( "line", {
				"id":chart.id + "-grid-x-" + gridIndex,
				"x1":graphMarginLeft - 5,
				"y1":currentLineHeight,
				"x2":width - graphMarginRight,
				"y2":currentLineHeight,
				"stroke":chart.gridX.stroke,
				"stroke-width":chart.gridX.width,
				"stroke-dasharray":chart.gridX.dasharray,
				"stroke-linecap":chart.gridX.linecap}
			);

			if(!chart.isIE) {
				gridLine.classList.add("grid");
				gridLine.classList.add("grid-x");
			}

			g.appendChild(gridLine);
			
			val = addComma(currentLineValue);
			if ( chart.axisX.value ) {
				val += " " + chart.axisX.value;
			} 

			// Draw grid line value beside axis Y
			if(chart.gridX.label.show) {
				if(currentLineHeight >= fontSize / 2) {
					id = chart.id + "-grid-x-" + gridIndex + "-label"
					gridLineValueLabel = createText(id
						, graphMarginLeft - 10
						, currentLineHeight
						, fontSize
						, "end"
						, "middle"
						, chart.labels.fontColor
						, val);

					if(!chart.isIE) {
						gridLineValueLabel.classList.add("label");
					}

					g.appendChild(gridLineValueLabel);
				}
			}

			currentLineValue += unit;
			++gridIndex;
		}
	};

	// Draw grid Y
	let drawGridY = function(chart) {

		// Draw vertical grid
		if(!chart.gridY.show) {
			return;
		}

		let labelCount = chart.labels.list.length;
		let legendCount = 1;

		let groupUnit = 2 * legendCount + 1;
		let unitCount = groupUnit * labelCount + 1;

		let unitWidth = graphWidth / unitCount;

		let gridLine = null;
		let x = 0;
		let from = chart.padding.top;
		let to = chart.padding.top + graphHeight + 5;
		
		let g = document.createElementNS(NS, "g");
			chart.panel.appendChild(g);

		for(let i = 0; i < labelCount; i++) {

			x = graphMarginLeft + ((groupUnit * unitWidth) / 2) + (groupUnit * unitWidth * i) + unitWidth/2;
			
			gridLine = createElement( "line", {
				"id":chart.id + "-grid-y-" + i,
				"x1":x,
				"y1":from,
				"x2":x,
				"y2":to,
				"stroke":chart.gridY.stroke,
				"stroke-width":chart.gridY.width,
				"stroke-dasharray":chart.gridY.dasharray,
				"stroke-linecap":chart.gridY.linecap}
			);

			if(!chart.isIE) {
				gridLine.classList.add("grid");
				gridLine.classList.add("grid-y");
			}

			g.appendChild(gridLine);
		}
	};

	// Draw labels
	let drawLabels = function(chart) {

		// Draw labels
		if(!chart.labels.show) {
			return;
		}

		let labelCount = chart.labels.list.length;
		let legendCount = 1;
		let groupUnit = 2 * legendCount + 1;
		let unitCount = groupUnit * labelCount + 1;

		let unitSize = 0;
			unitSize = graphWidth / unitCount;

		let index = 0;
		let label = null;
		let labels = chart.labels.list;
		let textAnchor = "";
		let alignmentBaseline = "";

		let x = 0, y = 0;

		x = 0;
		y = chart.padding.top + graphHeight + (chart.labels.fontSize/2);
		textAnchor = "middle";
		alignmentBaseline = "hanging";
		
		let g = document.createElementNS(NS, "g");
		if(!chart.isIE) {
			g.classList.add("labels");
		}
			chart.panel.appendChild(g);

		labels.forEach(function(label) {

			x = graphMarginLeft + (groupUnit * index + legendCount + 1) * unitSize;
			
			val = label;
			if ( chart.axisY.value ) {
				val += " " + chart.axisY.value;
			} 

			label = createText(chart.id + "-label-" + index
				, x
				, y
				, chart.labels.fontSize
				, textAnchor
				, alignmentBaseline
				, chart.labels.fontColor
				, val);

			if(!chart.isIE) {
				label.classList.add("label");
			}

			g.appendChild(label);

			++index;
		});
	};
	
	let drawAxes = function(chart) {
		let g = document.createElementNS(NS, "g");
		if(!chart.isIE) {
			g.classList.add("axes");
		}
		chart.panel.appendChild(g);
			
		g.appendChild(drawAxisX(chart));
		g.appendChild(drawAxisY(chart));
	}

	// Draw axis X
	let drawAxisX = function(chart) {

		if(!chart.axisX.show) {
			return;
		}

		let y = getAxisXPosition(chart);

		let from = chart.padding.left + getGridXLabelWidth(chart) - 5;
		let to = chart.getWidth() - chart.padding.right;

		let axisX = line(
			chart.id + "-axis-x"
			, from
			, y
			, to
			, y
			, chart.axisX.color
			, chart.axisX.color
			, chart.axisX.width);

		if(!chart.isIE) {
			axisX.classList.add("axis-x");
		}
		return axisX;
	};

	// Draw axis Y
	let drawAxisY = function(chart) {

		if(!chart.axisY.show) {
			return;
		}

		let x = graphMarginLeft;

		let from = chart.padding.top;
		let to = chart.getHeight() - chart.padding.bottom - getLabelHeight(chart) + 5;

		let axisY = line(
			chart.id + "-axis-y"
			, x
			, from
			, x
			, to
			, chart.axisY.color
			, chart.axisY.color
			, chart.axisY.width);

		if(!chart.isIE) {
			axisY.classList.add("axis-y");
		}
		return axisY;
	};

	// Draw lines
	let drawLines = function(chart) {

		if(undefined == chart.labels.list) {
			return;
		}

		// Calculate variables
		let labelCount = chart.labels.list.length;
		let groupUnit = 3;
		let unitCount = groupUnit * labelCount + 1;

		let unitWidth = graphWidth / unitCount;

		let id = "";

		let legendsIndex = 0;

		// Draw lines
		chart.legends.list.forEach(function(legend) {

			let valuesIndex = 0;

			let x1 = 0;
			let x2 = 0;
			let y0 = 0;
			let y1 = null;
			let y2 = 0;

			let line1 = null;
			let lineD0 = "";
			let lineD1 = "";

			let animation = null;
			
			var chords = [];
			var chordsAnimation = [];

			legend.values.forEach(function(value) {
				
				var i = 0;

				if(labelCount > valuesIndex) {
					
					// Calculate current coordinates
					x2 = graphMarginLeft + unitWidth/2 + ((groupUnit * unitWidth) / 2) + (groupUnit * unitWidth * valuesIndex);
					
					y2 = chart.padding.top + graphHeight - ((value - getAxisYMinValue(chart)) * getRatio(chart));

					if(null != y1
						&& y2 >= chart.padding.top - 0.1
						&& y2 <= chart.padding.top + graphHeight + 0.1) {

						id = chart.id + "-line-" + legendsIndex + "-" + valuesIndex;

						var part = {
							x1: x1, y1: y1,
							cx1: (x1 + x2) / 2, cy1: y1,
							x2: x2, y2: y2,
							cx2: (x1 + x2) / 2, cy2: y2,
						}
						chords.push(part);
						
						if(chart.animate.show) {
							var anim = {
								x1: x1, y1: getAxisXPosition(chart),
								cx1: (x1 + x2) / 2, cy1: getAxisXPosition(chart),
								x2: x2, y2: getAxisXPosition(chart),
								cx2: (x1 + x2) / 2, cy2: getAxisXPosition(chart),
							}
							chordsAnimation.push(anim);
						}
					}
			
					x1 = x2;

					y0 = y1;
					y1 = y2;

					++valuesIndex;
				}
				i++;
			});
			
			line1 = area(chart,"line-" + legendsIndex
				, chords
				, legend.stroke
				, chart.line.width
				, "transparent");
			
			if(chart.line.dasharray !== null) {
				line1.setAttribute("stroke-dasharray", chart.line.dasharray);
			}
			
			if(!chart.isIE) {
				line1.classList.add("line");
				line1.classList.add("line-" + legendsIndex);
			}
			
			if(chart.animate.show) {
				animation = startAnimaton(chart,line1,chordsAnimation);
				line1.appendChild(animation);
			}			
			chart.panel.appendChild(line1);
			
			// GRADIENT
			if ( "gradient" === chart.fill || "origin" === chart.fill ) {
				let g = document.createElementNS(NS, "g");
					chart.panel.appendChild(g);
				
				if ( "gradient" === chart.fill ) {
					linear = linearGradient(legend.stroke, legend.stroke);
					g.appendChild(linear);
				}
				
				fill = "origin" === chart.fill ? legend.stroke : "url(#"+legend.stroke+")";
				grad = area(chart,"area-" + legendsIndex
					, chords
					, legend.stroke
					, chart.line.width
					, fill);
				
				if(!chart.isIE) {
					grad.classList.add("gradient");
					grad.classList.add("gradient-" + legendsIndex);
				}
				
				if(chart.animate.show) {
					grads = area(chart,"area-" + legendsIndex
						, chords
						, legend.stroke
						, chart.line.width
						, fill);
					animation = startAnimaton(chart,grads,chordsAnimation);
					grad.appendChild(animation);
				}
				
				g.appendChild(grad);
			}
			
			// SHADOW
			if(true == chart.line.shadow) {
				blur = blurEffect(chart,"elem-" + legendsIndex + "-blur",legend.stroke, chords,chordsAnimation);
				chart.panel.appendChild(blur);
			}

			++legendsIndex;
		});
	};

	// Draw points
	let drawPoints = function(chart) {

		if(undefined == chart.labels.list) {
			return;
		}

		// Calculate variables
		let labelCount = chart.labels.list.length;
		let groupUnit = 3;
		let unitCount = groupUnit * labelCount + 1;

		let unitWidth = graphWidth / unitCount;

		let id = "";

		let legendsIndex = 0;

		// Draw points
		chart.legends.list.forEach(function(legend) {

			let valuesIndex = 0;

			let x = 0;
			let y = 0;

			let point = null;
			let pointValue = null;
			let pointValueY = 0;
			let minY = chart.padding.top + graphHeight - (chart.labels.fontSize/3);
			
			let g = document.createElementNS(NS, "g");
				chart.panel.appendChild(g);

			legend.values.forEach(function(value) {

				if(labelCount > valuesIndex) {
					
					// Calculate current coordinates
					x = graphMarginLeft + unitWidth/2 + ((groupUnit * unitWidth) / 2) + (groupUnit * unitWidth * valuesIndex);
					y = chart.padding.top + graphHeight - ((value - getAxisYMinValue(chart)) * getRatio(chart));

					// Draw point
					if(chart.point.show
						&& y >= chart.padding.top - 0.1
						&& y <= chart.padding.top + graphHeight + 0.1) {

						id = chart.id + "-line-point-" + legendsIndex + "-" + valuesIndex;
						stroke = chart.point.stroke === null ? legend.stroke : chart.point.stroke;
						point = circle(id, x, y, chart.point.radius, legend.stroke, stroke, chart.point.strokeWidth);
						point.style.cursor = "pointer";
						
						if(!chart.isIE) {
							point.classList.add("point");
						}

						if(chart.animate.show) {

							point.setAttribute("cy", getAxisXPosition(chart));
							pointMove = animate("cy", getAxisXPosition(chart), y, chart.animate.duration, "freeze");
							point.appendChild(pointMove);

							point.setAttribute("r", 0);
							pointMove = animate("r", 0, chart.point.radius, chart.animate.duration, "freeze");
							point.appendChild(pointMove);
						}

						g.appendChild(point);

						// Draw tooltip
						if(chart.tooltip.show) {

							point.setAttribute("legend", legend.name);
							point.setAttribute("value", addComma(value));
							point.setAttribute("label", chart.labels.list[valuesIndex]);

							point.addEventListener("mouseover", function(event) {
								chart.showTooltip(event, this, chart);
							});
							point.addEventListener("mousemove", function(event) {
								chart.showTooltip(event, this, chart);
							});
							point.addEventListener("mouseout", function(event) {
								chart.hideTooltip(event, chart);
							});
						}
					}

					// Draw value on point
					if(chart.valueOnliteChart.show) {

						id = chart.id + "-line-" + legendsIndex + "-" + valuesIndex + "-value";
						pointValueY = y - chart.point.radius - (chart.labels.fontSize/3);

						pointValueY = minY < pointValueY ? minY : pointValueY;

						if(pointValueY > chart.labels.fontSize) {

							pointValue = createText(id
								, x, pointValueY
								, chart.labels.fontSize
								, "middle", "baseline"
								, chart.labels.fontColor
								, addComma(value));

							if(!chart.isIE) {
								pointValue.classList.add("line-value");
								pointValue.classList.add("line-value-" + legendsIndex);
							}

							if(chart.animate.show) {
								
								pointValue.setAttribute("y", getAxisXPosition(chart));
								pointMove = animate("y", getAxisXPosition(chart), pointValueY, chart.animate.duration, "freeze");
								pointValue.appendChild(pointMove);

								pointValue.setAttribute("font-size", 0);
								pointMove = animate("font-size", 0, chart.labels.fontSize, chart.animate.duration, "freeze");
								pointValue.appendChild(pointMove);
							}

							g.appendChild(pointValue);
						}
					}

					++valuesIndex;
				}
			});

			++legendsIndex;
		});
	};
	
	// Draw chart by type
	if("Line" == this.type) {

		drawGridX(this);
		drawGridY(this);
		drawLabels(this);

		drawAxes(this);

		drawLines(this);
		drawPoints(this);

		drawLegendTable(this);

	}
	
	if(restartAnimation) {
		this.restartAnimation(this);
	}
}