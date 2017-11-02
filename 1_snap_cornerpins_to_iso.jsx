var mainComp = app.project.activeItem,  											// get the selected layer
	layerIndex = mainComp.selectedLayers[0].index,   								// grab index of selected layer
	layer = mainComp.layer(layerIndex)
	vertsEnd = [layer.property("Effects").property("Corner Pin").property("Upper Left"), 
				layer.property("Effects").property("Corner Pin").property("Upper Right"),
				layer.property("Effects").property("Corner Pin").property("Lower Left"),
				layer.property("Effects").property("Corner Pin").property("Lower Right")
				],
	vertsStart = [vertsEnd[0].valueAtTime(mainComp.time,true), 
				  vertsEnd[1].valueAtTime(mainComp.time,true),
				  vertsEnd[2].valueAtTime(mainComp.time,true),
				  vertsEnd[3].valueAtTime(mainComp.time,true)
				  ],
 	isoWidth = 50,
	isoDist = Math.tan(degreesToRadians(30)) * isoWidth
	;

app.beginUndoGroup("undo discrete");

var discreteVerts =	descritizeVerts(vertsStart, isoDist, isoWidth);

for (var i = 0; i < 4; i++)
{
	vertsEnd[i].setValueAtTime(mainComp.time, discreteVerts[i]);
}
app.endUndoGroup();

function descritizeVerts(verts, _isoDist, _isoWidth)
{
	var returnVerts = [ ];
	_isoWidth = _isoWidth/ 4;
	_isoDist = _isoDist / 2;

	for(var i = 0; i < 4; i++)
	{
		var discreteVert = [ verts[i][0], verts[i][1] ]

		if ((discreteVert[0] % (_isoWidth)) > _isoWidth / 2)
		{
			discreteVert[0] = discreteVert[0] - (discreteVert[0] % (_isoWidth)) + (_isoWidth);
		}
		else if ((discreteVert[0] % (_isoWidth)) < _isoWidth / 2)
		{
			discreteVert[0] = verts[i][0] - (verts[i][0] % (_isoWidth));
		}
		
		// absolute value goes in both directions for point
		// 

		if ((discreteVert[1] % (_isoDist)) > _isoDist / 2)
		{
			discreteVert[1] = discreteVert[1] - (discreteVert[1] % (_isoDist)) + (_isoDist);
		}
		else if ((discreteVert[1] % (_isoDist)) < _isoDist / 2)
		{
			discreteVert[1] = verts[i][1] - (verts[i][1] % (_isoDist));
		}

		// if (Math.abs(discreteVert[1] % (_isoDist)) < _isoDist && )
		// {
		// 	discreteVert[1] = discreteVert[1] - (discreteVert[1] % (_isoDist * 2)) + (_isoDist);
		// }



		returnVerts.push(discreteVert);
	}
	return returnVerts;
}

function degreesToRadians(degrees)
{
	var returnRadians = degrees * Math.PI/180;
	return returnRadians;
}
		// else if (Math.abs(discreteVert[1] % (_isoDist * 2)) > 0 && Math.abs(discreteVert[1] % (_isoDist * 2)) < 14)
		// {
		// 	discreteVert[1] = verts[i][1] - (verts[i][1] % (_isoDist));
		// }	
		// else if ((discreteVert[1] % (_isoDist * 2)) < _isoDist / 2 && (discreteVert[1] % (_isoDist * 2)) < 0)
		// {
		// 	discreteVert[1] = verts[i][1] - (verts[i][1] % (_isoDist) + (_isoDist));
		// 	if (i == 0)
		// 	{
		// 		alert( [ discreteVert[1] % (_isoDist) , _isoDist / 2  ]);

		// 	}
		// }