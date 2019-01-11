import { Dense, Conv2D, Layer, MaxPooling2D, Input, Output } from "./shapes/layer";
import { Draggable } from "./shapes/draggable";
import { Relu, Sigmoid, Tanh } from "./shapes/activation";
import { windowProperties } from "./window";
import { buildNetwork, buildNetworkDAG } from "../model/build_network";
import { blankTemplate, defaultTemplate } from "./model_templates";
import { graphToJson } from "../model/export_model";
import { train } from "../model/mnist_model";

export interface DraggableData {
	draggable: Array<Draggable>
	input: Input
	output: Output
}

document.addEventListener("DOMContentLoaded", function() { 
    // This function runs when the DOM is ready, i.e. when the document has been parsed
	
	// Initialize the network tab to selected
	document.getElementById("network").classList.add("tab-selected");
	
	// Hide the progress and visualization tabs
	document.getElementById("progressTab").style.display = "none"
	document.getElementById("visualizationTab").style.display = "none"
	document.getElementById("informationTab").style.display = "none"

	// Hide the progress and visualization menus
	document.getElementById("progressMenu").style.display = "none";
	document.getElementById("visualizationMenu").style.display = "none";
	
	var elmts = document.getElementsByClassName('tab');
	for(let elmt of elmts){
		dispatchSwitchTabOnClick(elmt);
	}
	
	var elmts = document.getElementsByClassName('option');
	for(let elmt of elmts){
		dispatchCreationOnClick(elmt);
	}
	
	var elmts = document.getElementsByClassName('train');
	for(let elmt of elmts){
		trainOnClick(elmt)
	}
    
    window.addEventListener('create', function( e ) {
		appendItem(e);
	});

	window.addEventListener('switch', function( e: any ) {
		if (e.detail.tabType == 'information') {
			console.log("clicked on information")
			showInformationOverlay()
		} else {
			console.log("switching tabs")
			switchTab(e);
		}
	});
	
	document.getElementById("informationTab").onclick = (_) => 	document.getElementById("informationTab").style.display = "none";

	document.getElementById("svg").addEventListener("click", function(event) {
		// Only click if there is a selected element, and the clicked element is an SVG Element, and its id is "svg"
		// It does this to prevent unselecting if we click on a layer block or other svg shape
		if(windowProperties.selectedElement && event.target instanceof SVGElement && event.target.id == "svg"){
			windowProperties.selectedElement.unselect();
			windowProperties.selectedElement = null;
		}
	})

	window.onkeyup = function(event){
		switch(event.key){
			case 'Escape' :
				if(windowProperties.selectedElement){
					windowProperties.selectedElement.unselect();
					windowProperties.selectedElement = null;
				}
				break;
			case 'Delete' :
				if(windowProperties.selectedElement){
					windowProperties.selectedElement.delete();
					windowProperties.selectedElement = null;
				}
				break;
			case 'Enter' :
				// graphToJson();
				train(buildNetwork(svgData.input))
				break;
		}
	};

	svgData.input = new Input();
	svgData.output = new Output();
	defaultTemplate(svgData)
});

function trainOnClick(elmt){
	elmt.addEventListener('click', async function(e){
		let trainingBox = document.getElementById('ti_training');
		trainingBox.children[1].innerHTML = 'Yes'
		elmt.innerHTML = "Training"
		// TODO: Change color during training
		// elmt.style.backgroundColor = '#900000'
		let model = buildNetworkDAG(svgData.output)
		console.log("Built Model... ")
		console.log(model)
		await train(model)
		elmt.innerHTML = "Train"
		trainingBox.children[1].innerHTML = 'No'
	});
}

function dispatchSwitchTabOnClick(elmt){
	elmt.addEventListener('click', function(e){
        var tabType = elmt.getAttribute('data-tabType')
		var detail = { tabType : tabType}
        var event = new CustomEvent('switch', { detail : detail } );
		window.dispatchEvent(event);
	});
}


function dispatchCreationOnClick(elmt){
	elmt.addEventListener('click', function(e){
        var itemType = elmt.parentElement.getAttribute('data-itemType')
        var detail = { itemType : itemType}
		detail[itemType + 'Type'] = elmt.getAttribute('data-'+itemType+'Type')
        var event = new CustomEvent('create', { detail : detail } );
		window.dispatchEvent(event);
	});
}

function appendItem(options){
	var item: Draggable
	var template = null
	switch(options.detail.itemType){
        case 'layer': switch(options.detail.layerType) {
			case "dense": item = new Dense(); console.log("Created Dense Layer"); break;
			case "conv2D": item = new Conv2D(); console.log("Created Conv2D Layer"); break;
			case "maxPooling2D": item = new MaxPooling2D(); console.log("Created MaxPooling2D Layer"); break;
		}
		case 'activation': switch(options.detail.activationType) {
			case 'relu': item = new Relu(); console.log("Created Relu"); break;
			case 'sigmoid': item = new Sigmoid(); console.log("Created Sigmoid"); break;
			case 'tanh': item = new Tanh(); console.log("Created Tanh"); break;
		}
		case 'template':  switch(options.detail.templateType) {
			case 'default': template = true; defaultTemplate(svgData); console.log("Created Default Template"); break;
			case 'blank': template = true; blankTemplate(svgData); console.log("Created Blank Template"); break;
		}
	}

	if (template == null) {
		item.select()
		svgData.draggable.push(item);
	}
}


function switchTab(tab) {
	// Hide all tabs
	document.getElementById("networkTab").style.display = "none"
    document.getElementById("progressTab").style.display = "none"
	document.getElementById("visualizationTab").style.display = "none"
	document.getElementById("informationTab").style.display = "none";

	// Hide all menus
	document.getElementById("networkMenu").style.display = "none";
	document.getElementById("progressMenu").style.display = "none";
	document.getElementById("visualizationMenu").style.display = "none";

	// Unselect all tabs
	document.getElementById("network").classList.remove("tab-selected")
	document.getElementById("progress").classList.remove("tab-selected")
	document.getElementById("visualization").classList.remove("tab-selected")

	// Display only the selected tab
	switch(tab.detail.tabType){
		case "network": 
			document.getElementById("networkTab").style.display = null; 
			document.getElementById("network").classList.add("tab-selected");
			document.getElementById("networkMenu").style.display = null;
			break; 
		case "progress": 
			document.getElementById("progressTab").style.display = null; 
			document.getElementById("progress").classList.add("tab-selected");
			document.getElementById("progressMenu").style.display = null; 
			break;
		case "visualization": 
			document.getElementById("visualizationTab").style.display = null; 
			document.getElementById("visualization").classList.add("tab-selected");
			document.getElementById("visualizationMenu").style.display = null; 
			break;
	}
}

function showInformationOverlay() { 
	console.log("Setting information tab to null.")
	console.log(document.getElementById("informationTab").style.display)
	if (document.getElementById("informationTab").style.display == "none") {
		document.getElementById("informationTab").style.display = "block";
	} else {
		document.getElementById("informationTab").style.display = "none";
	}
}

function off(){
	document.getElementById("informationTab").style.display = "none";
}

let svgData: DraggableData = {
	draggable : [],
	input: null,
	output: null
}	