var mainComp = app.project.activeItem,  											// get the selected layer
	layerIndex = mainComp.selectedLayers[0].index,   								// grab index of selected layer
	layer = mainComp.layer(layerIndex),
	cornerPin = layer.property("Effects").property("Corner Pin");

cornerPin.selected = true;
