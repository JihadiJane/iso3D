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
	fps = 24,
	isoWidth = 50;
	pointA = [ 1250, 218],
	pointB = [ 960, 894],
	pointC = [ 389, 84],
	pointD = [ 1800, 970]
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
			direction = "Y",
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
			centerPoint = vertsStart[3],
			newCenterPoint = [ 0 , 0 ],
			rotPoint = vertsStart[1],
			dist = Distance(centerPoint, rotPoint),
			currentAngle = 0//Math.atan2(rotPoint[1] - centerPoint[1], rotPoint[0] - centerPoint[0]) * 180 / Math.PI + 90,
			newCurrentAngle = 0,
			newRotPoint = [ 0 , 0 ]
			;

		switch (direction)
		{
			case "X":
				break;
			
			case "Y":
				//alert(currentAngle);
				for (var i = 0; i <= rotY; i++)
					{
						var mult = 1;

						if (currentAngle < 120)
						{
							newCurrentAngle = currentAngle - 15;
							newRotPoint = rotPoint;
							newCenterPoint[0] = centerPoint[0] + isoWidth / 3;
							newCenterPoint[1] = centerPoint[1] - dist / 2;
						}
						else if (currentAngle >= 120 && currentAngle < 180)
						{
							newCurrentAngle = currentAngle - 90;
							newRotPoint = rotPoint;
							mult = 1.725;
							newCenterPoint[0] = centerPoint[0] - isoWidth;
							newCenterPoint[1] = centerPoint[1] - dist / 2;
							
						}
						else if (currentAngle >= 180 && currentAngle < 270)
						{
							newCurrentAngle = currentAngle - 35;
							newRotPoint = rotPoint;
							mult = .375;
							newCenterPoint[0] = centerPoint[0] - isoWidth / 3;
							newCenterPoint[1] = centerPoint[1] + dist / 2;	
						}
						else if (currentAngle >= 270 && currentAngle < 360)					
						{
							newCurrentAngle = currentAngle + 30;
							newRotPoint = rotPoint;
							newCenterPoint[0] = centerPoint[0] + isoWidth;
							newCenterPoint[1] = centerPoint[1] + dist / 2;					
						}
						vertsEnd[1].setValueAtTime(convertFPSToTime(currentFrame + i, fps),rotateAroundPoint(0,newCenterPoint, rotPoint, 0, newCurrentAngle, mult));

						currentAngle++;
					}



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

function rotateAroundPoint(direction, _centerPoint, _rotPoint, startAngle, _currentAngle,_mult)
{
	var endLocation = [ 0 , 0 ];

	_currentAngle /= 57.5;
	//alert(Math.sin(_currentAngle) * 90);
	//endLocation[0] = _centerPoint[0] + (_rotPoint[0] - _centerPoint[0])*Math.cos(_currentAngle) - (_rotPoint[1] - _centerPoint[1])*Math.sin(_currentAngle);
	//endLocation[1] = _centerPoint[1] + (_rotPoint[1] - _centerPoint[1])*Math.sin(_currentAngle) + (_rotPoint[0] - _centerPoint[0])*Math.cos(_currentAngle);
	endLocation[0] = _centerPoint[0] + ((_rotPoint[0] - _centerPoint[0])*Math.cos(_currentAngle)*_mult - (_rotPoint[1] - _centerPoint[1])*Math.sin(_currentAngle)*_mult);
	endLocation[1] = _centerPoint[1] + ((_rotPoint[1] - _centerPoint[1])*Math.cos(_currentAngle)*_mult + (_rotPoint[0] - _centerPoint[0])*Math.sin(_currentAngle)*_mult);
	return endLocation;
}

function Distance(start, end)
{
	var returnDist;
	returnDist = Math.sqrt(Math.pow((end[0] - start[0]), 2) + Math.pow((end[1] - start[1]), 2));
	return returnDist;
}
