// get current values of corner pins
// pick direction of face
// pick end location and time
//	// put a keyframe for each rotation
// 	// always rotate on "lower" end
//	//	// if sideways, non rotating edge becomes "lower"

var mainComp = app.project.activeItem,  											// get the selected layer
	layerIndex = mainComp.selectedLayers[0].index,  								// grab index of selected layer
	layer = mainComp.layer(layerIndex),
	temp,
	fps = 24
	;

var windowAEFKR = new Window ("dialog", "AEFKR"); 											// create window

var groupInput = windowAEFKR.add ("group");													// create input groups
groupInput.orientation = "column";

var groupRotZ = groupInput.add ("group");
var rotZ = groupRotZ.add ("statictext", undefined, "Z rot:");									
var inputRotZ = groupRotZ.add ("edittext", undefined, "Z");
inputRotZ.characters = 4;
groupRotZ.alignChildren = "center";

var groupRotXY = groupInput.add ("group");
var rotX = groupRotXY.add ("statictext", undefined, "X rot:");									
var inputRotX = groupRotXY.add ("edittext", undefined, "X");
var rotY = groupRotXY.add ("statictext", undefined, "Y rot:");	
var inputRotY = groupRotXY.add ("edittext", undefined, "Y");
inputRotX.characters = 4;						
inputRotY.characters = 4;
groupRotXY.alignChildren = "center";

var groupIcon = groupInput.add("group");
var current = File($.fileName).path;  
var iconPath = current + "/icon.jpg"; 

groupIcon.add ("image", undefined,iconPath);

var groupButtons = windowAEFKR.add ("group");
groupButtons.alignment = "right";
var buttonOK = groupButtons.add ("button", undefined, "OK");
var buttonCancel = groupButtons.add ("button", undefined, "Cancel");


windowAEFKR.show();

app.beginUndoGroup("undo script");
buttonOK.onClick = execute(groupInput);
app.endUndoGroup();
//////////////////////////////////////////////////

function execute()
{
	var currentTime = mainComp.time,
		currentFrame = convertTimeToFPS(currentTime, fps),
		direction = "X",
		vertsEnd = [layer.property("Effects").property("Corner Pin").property("Upper Left"), 
					  layer.property("Effects").property("Corner Pin").property("Upper Right"),
					  layer.property("Effects").property("Corner Pin").property("Lower Left"),
					  layer.property("Effects").property("Corner Pin").property("Lower Right"),
					  ],
		vertsStart = [vertsEnd[0].valueAtTime(currentTime,true), 
					  vertsEnd[1].valueAtTime(currentTime,true),
					  vertsEnd[2].valueAtTime(currentTime,true),
					  vertsEnd[3].valueAtTime(currentTime,true),
					  ],
		rotX = parseFloat(inputRotX.text),
		rotY = parseFloat(inputRotY.text),
		rotZ = parseFloat(inputRotZ.text),
		currentAngle = 0
		;

	switch (direction)
	{
		case "X":
			//inputRotX.text

			for (var i = 0; i <= rotX; i++)
			{
				currentAngle = i;
				vertsEnd[0].setValueAtTime(convertFPSToTime(i, fps),rotateAroundPoint(0,vertsStart[2], vertsStart[0], 0, currentAngle));

			}
			// create for loop to loop for each degree of rotation
			//	// loop for each point
			//	//	


			break;
		
		case "Y":
			break;
		
		case "Z":
			break;

	}
}

function convertTimeToFPS(time, targetFPS)
{
	var convertedTime;

	convertedTime = Math.floor(time * targetFPS);

	return convertedTime;
}

function convertFPSToTime(frame, targetFPS) 
{
	var convertedFPS;

	convertedFPS = frame / targetFPS;
	return convertedFPS;
}

function rotateAroundPoint(direction, centerPoint, rotPoint, startAngle, _currentAngle)
{
	var endLocation = [ 0 , 0 ];

	_currentAngle = (_currentAngle + startAngle)/57.3;
	//alert(Math.sin(_currentAngle) * 90);
	//endLocation[0] = _centerPoint[0] + (_rotPoint[0] - _centerPoint[0])*Math.cos(_currentAngle) - (_rotPoint[1] - _centerPoint[1])*Math.sin(_currentAngle);
	//endLocation[1] = _centerPoint[1] + (_rotPoint[1] - _centerPoint[1])*Math.sin(_currentAngle) + (_rotPoint[0] - _centerPoint[0])*Math.cos(_currentAngle);
	endLocation[0] = centerPoint[0] +  ((rotPoint[0] - centerPoint[0])*Math.cos(_currentAngle) - (rotPoint[1] - centerPoint[1])*Math.sin(_currentAngle));
	endLocation[1] = centerPoint[1] +  ((rotPoint[1] - centerPoint[1])*Math.cos(_currentAngle) + (rotPoint[0] - centerPoint[0])*Math.sin(_currentAngle));

	return endLocation;
}

function getAngle(start, end)
{
}