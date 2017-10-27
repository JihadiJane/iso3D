
var mainComp = app.project.activeItem,  											// get the selected layer
layerIndex = mainComp.selectedLayers[0].index,  								// grab index of selected layer
layer = mainComp.layer(layerIndex),
temp,
fps = 24,
isoWidth = 50,
sliderAngle = layer.property("Effects").property("Slider Control").property("Slider")
;


var windowAEFKR = new Window ("dialog", "AEFKR"); 											// create window

var groupInput = windowAEFKR.add ("group");													// create input groups
groupInput.orientation = "column";

var groupPlaneHeight = groupInput.add ("group");
var planeHeightInput = groupPlaneHeight.add ("statictext", undefined, "plane height:");	
var inputHeight = groupPlaneHeight.add ("edittext", undefined, "int");
inputHeight.characters = 3;
groupPlaneHeight.alignChildren = "left";	

var groupRot = groupInput.add ("group");
var rotAmount = groupRot.add ("statictext", undefined, "rotate:");	
var inputRot = groupRot.add ("edittext", undefined, "deg");													
var rotDirection = groupRot.add ("statictext", undefined, "direction:");	
var inputDir = groupRot.add ("edittext", undefined, "xyz");													
inputRot.characters = 2;
inputDir.characters = 2;
groupRot.alignChildren = "left";

var groupIcon = groupInput.add("group");
var current = File($.fileName).path;  
var iconPath = current + "/icon.jpg"; 
groupIcon.add ("image", undefined, iconPath);

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
	var startTime = mainComp.time,
		startFrame = convertTimeToFPS(startTime, fps),
		direction = parseInt(inputDir.text),
		vertsEnd = [layer.property("Effects").property("Corner Pin").property("Upper Left"), 
					layer.property("Effects").property("Corner Pin").property("Upper Right"),
					layer.property("Effects").property("Corner Pin").property("Lower Left"),
					layer.property("Effects").property("Corner Pin").property("Lower Right"),
					],
		vertsStart = [vertsEnd[0].valueAtTime(startTime,true), 
					  vertsEnd[1].valueAtTime(startTime,true),
					  vertsEnd[2].valueAtTime(startTime,true),
					  vertsEnd[3].valueAtTime(startTime,true),
					  ],
		planeHeight = parseInt(inputHeight.text),
		rotAmount = parseFloat(inputRot.text),
		newPointValuesX = [vertsStart[0][0], vertsStart[1][0], vertsStart[2][0], vertsStart[3][0]],
		newPointValuesY = [vertsStart[0][1], vertsStart[1][1], vertsStart[2][1], vertsStart[3][1]],
		sortedPointsY = newPointValuesY,
		unsortedPoints = [vertsStart[0], vertsStart[1], vertsStart[2], vertsStart[3]]
		unsortedPointsX = [vertsStart[0][0], vertsStart[1][0], vertsStart[2][0], vertsStart[3][0]],
		unsortedPointsY = [vertsStart[0][1], vertsStart[1][1], vertsStart[2][1], vertsStart[3][1]],
		maxX = Math.max(newPointValuesX[0], newPointValuesX[1], newPointValuesX[2], newPointValuesX[3]),
		maxY = Math.max(newPointValuesY[0], newPointValuesY[1], newPointValuesY[2], newPointValuesY[3]),
		minX = Math.min(newPointValuesX[0], newPointValuesX[1], newPointValuesX[2], newPointValuesX[3]),
		minY = Math.min(newPointValuesY[0], newPointValuesY[1], newPointValuesY[2], newPointValuesY[3]),
		centerPoints = [[ 0, 0 ], [ 0, 0 ]],
		rotPoints = [[ 0, 0 ], [ 0, 0 ]],
		currentAngle = sliderAngle.valueAtTime(startTime, fps)
		;

	for(var i = 0; i < 4; i++)
	{
		vertsEnd[i].setValueAtTime(convertFPSToTime(startFrame, fps),vertsStart[i]);
	}

	sortedPointsY.sort(function(a, b){return a - b});
	switch (direction) // set plane to direction
	{

		case 0: // X
			if (currentAngle == 0)
			{
				rotPoints[0][1] = sortedPointsY[1];
				rotPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[1],unsortedPointsY)];
				centerPoints[0][1] = maxY;				
				centerPoints[0][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];

				rotPoints[1][1] = sortedPointsY[0];
				rotPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[0], unsortedPointsY)];
				centerPoints[1][1] = sortedPointsY[2];				
				centerPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[2], unsortedPointsY)];
			}
			else if (currentAngle == 90)
			{
				rotPoints[0][1] = maxY;
				rotPoints[0][0] = unsortedPointsX[indexOfItem(maxY,unsortedPointsY)];
				centerPoints[0][0] = minX;
				centerPoints[0][1] = unsortedPointsY[indexOfItem(minX,unsortedPointsX)];

				rotPoints[1][1] = unsortedPointsY[indexOfItem(maxX,unsortedPointsX)];
				rotPoints[1][0] = maxX;
				centerPoints[1][1] = minY;				
				centerPoints[1][0] = unsortedPointsX[indexOfItem(minY, unsortedPointsY)];
			}
			else if (currentAngle == 180)
			{
				centerPoints[0][1] = sortedPointsY[1];
				centerPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[1],unsortedPointsY)];
				rotPoints[0][1] = maxY;				
				rotPoints[0][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];

				centerPoints[1][1] = minY;
				centerPoints[1][0] = unsortedPointsX[indexOfItem(minY, unsortedPointsY)];
				rotPoints[1][1] = sortedPointsY[2];				
				rotPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[2], unsortedPointsY)];				
			}
			else if (currentAngle == 270)
			{
				centerPoints[0][1] = maxY;
				centerPoints[0][0] = unsortedPointsX[indexOfItem(maxY,unsortedPointsY)];
				rotPoints[0][0] = minX;
				rotPoints[0][1] = unsortedPointsY[indexOfItem(minX,unsortedPointsX)];

				centerPoints[1][1] = unsortedPointsY[indexOfItem(maxX,unsortedPointsX)];
				centerPoints[1][0] = maxX;
				rotPoints[1][1] = minY;				
				rotPoints[1][0] = unsortedPointsX[indexOfItem(minY, unsortedPointsY)];
			}
		break;

		case 1: // Y			
			if (currentAngle == 0)
			{
				rotPoints[0][1] = minY;
				rotPoints[0][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				centerPoints[0][1] = sortedPointsY[2];				
				centerPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[2], unsortedPointsY)];

				rotPoints[1][1] = sortedPointsY[1];
				rotPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[1],unsortedPointsY)];
				centerPoints[1][1] = maxY;				
				centerPoints[1][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];
			}
			else if (currentAngle == 90)
			{
				rotPoints[0][1] = minY;
				rotPoints[0][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				centerPoints[0][0] = minX;
				centerPoints[0][1] = unsortedPointsY[indexOfItem(minX,unsortedPointsX)];

				rotPoints[1][1] = unsortedPointsY[indexOfItem(maxX,unsortedPointsX)];
				rotPoints[1][0] = maxX;
				centerPoints[1][1] = maxY;				
				centerPoints[1][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];
			}
			else if (currentAngle == 180)
			{
				centerPoints[0][1] = minY;
				centerPoints[0][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				rotPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[2],unsortedPointsY)];
				rotPoints[0][1] = sortedPointsY[2];

				centerPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[1],unsortedPointsY)];
				centerPoints[1][1] = sortedPointsY[1];
				rotPoints[1][1] = maxY;				
				rotPoints[1][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];	
			}
			else if (currentAngle == 270)
			{
				centerPoints[0][1] = minY;
				centerPoints[0][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				rotPoints[0][1] = unsortedPointsY[indexOfItem(minX, unsortedPointsX)];				
				rotPoints[0][0] = minX;

				centerPoints[1][0] = maxX;
				centerPoints[1][1] = unsortedPointsY[indexOfItem(maxX,unsortedPointsX)];
				rotPoints[1][1] = maxY;				
				rotPoints[1][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];
			}
		break;

		case 2:	// Z		
			if (currentAngle == 0)
			{
				rotPoints[0][1] = sortedPointsY[2];
				rotPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[2],unsortedPointsY)];
				centerPoints[0][1] = maxY;				
				centerPoints[0][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];

				rotPoints[1][1] = minY;
				rotPoints[1][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				centerPoints[1][1] = sortedPointsY[1];				
				centerPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[1], unsortedPointsY)];
			}
			else if (currentAngle == 90)
			{
				rotPoints[0][1] = sortedPointsY[2];
				rotPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[2],unsortedPointsY)];
				centerPoints[0][1] = maxY;
				centerPoints[0][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];

				rotPoints[1][1] = minY;
				rotPoints[1][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				centerPoints[1][1] = sortedPointsY[1];
				centerPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[1],unsortedPointsY)];
				alert(centerPoints[1]);
			}
			else if (currentAngle == 180)
			{
				centerPoints[0][1] = sortedPointsY[2];
				centerPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[2],unsortedPointsY)];
				rotPoints[0][1] = maxY;				
				rotPoints[0][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];

				centerPoints[1][1] = minY;
				centerPoints[1][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				rotPoints[1][1] = sortedPointsY[1];				
				rotPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[1], unsortedPointsY)];			
			}
			else if (currentAngle == 270)
			{
				centerPoints[0][1] = minY;
				centerPoints[0][0] = unsortedPointsX[indexOfItem(minY,unsortedPointsY)];
				rotPoints[0][1] = sortedPointsY[1];				
				rotPoints[0][0] = unsortedPointsX[indexOfItem(sortedPointsY[1], unsortedPointsY)];

				centerPoints[1][1] = sortedPointsY[2];
				centerPoints[1][0] = unsortedPointsX[indexOfItem(sortedPointsY[2],unsortedPointsY)];
				rotPoints[1][1] = maxY;				
				rotPoints[1][0] = unsortedPointsX[indexOfItem(maxY, unsortedPointsY)];
			}
		break;
	}

	if (rotAmount > 0) 	
	{
		currentAngle += 1;
	}
	else
	{
		currentAngle -= 1;
	}

	for (var j = 0; j < 2; j++)
	{

		var centerPoint = [ centerPoints[j][0], centerPoints[j][1] ],	// fill this
			rotPoint = [ rotPoints[j][0], rotPoints[j][1] ],	// fill this
			isoDist = Math.tan(degreesToRadians(30)) * isoWidth,
			dist = isoDist * planeHeight,
			newCurrentAngle = currentAngle
			;

		for (var i = 1; i <= Math.abs(rotAmount); i++)
		{

			var rotationValues,
				rotIndex,
				rotCheck = [ indexOfItem(rotPoint[0], unsortedPointsX), indexOfItem(rotPoint[1], unsortedPointsY) ] 				// fix this: check for the X and Y
			;

			if (newCurrentAngle > 360)
			{
				newCurrentAngle = newCurrentAngle - 360;
			}
			else if (newCurrentAngle < 0)
			{
				newCurrentAngle = 360 + newCurrentAngle;
			}
			else if (newCurrentAngle == 360)
			{
				newCurrentAngle = 0;
			}

			if (rotCheck[0] == rotCheck[1])
			{
				rotIndex = rotCheck[0];
			}
			else if (countInArray(rotPoint[0], unsortedPointsX) == 2)
			{
				rotIndex = rotCheck[1];
			}
			else if (countInArray(rotPoint[1], unsortedPointsY) == 2)
			{
				rotIndex = rotCheck[0];
			}

			//if (j == 1) {alert(centerPoints);}

			rotationValues = moveCenterPoint(newCurrentAngle, centerPoints[j], dist, isoDist, isoWidth, direction, planeHeight, direction);

			sliderAngle.setValueAtTime(convertFPSToTime(startFrame + i, fps), newCurrentAngle);
			var tempRot = setRotPoints(0, rotationValues[0], dist, rotationValues[1], rotationValues[2])
		

			vertsEnd[rotIndex].setValueAtTime(convertFPSToTime(startFrame + i, fps),tempRot);

			if (rotAmount > 0)
			{
			newCurrentAngle++;						
			}
			else 
			{
			newCurrentAngle--;							
			}
		}
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

function setRotPoints(direction, _centerPoint, _dist, _currentAngle,_mult)
{
	var endLocation = [ 0 , 0 ],
		_rotPoint = [ 0 , 0 ],
		_newCurrentAngle
		;

	_newCurrentAngle = degreesToRadians((_currentAngle - 90));
	
	_rotPoint[0] = _centerPoint[0] + (Math.cos(_newCurrentAngle) * (_dist * _mult));
	_rotPoint[1] = _centerPoint[1] + (Math.sin(_newCurrentAngle) * (_dist * _mult));

	return _rotPoint;
}

function distance(start, end)
{
	var returnDist = Math.sqrt(Math.pow((end[0] - start[0]), 2) + Math.pow((end[1] - start[1]), 2));
	return returnDist;
}

function reprojectAngle(angle, min, max, _in, _out)
{

	var alpha,
		returnInterpolated
		;

	angle = angle;
	alpha = (angle - min) / (max - min);

	returnInterpolated  = _in + (alpha * (_out - _in));
	return returnInterpolated;
}

function degreesToRadians(degrees)
{
	var returnRadians = degrees * Math.PI/180;
	return returnRadians;
}

function moveCenterPoint(_currentAngle, _centerPoint, _dist, _isoDist, _isoWidth, axis, _planeHeight, _direction) // fix this: something to do with the centerPoint
{
	var limitsX = [ [ 30, 90 ], [ 90, 210 ], [ 210, 270 ], [ 270, 390 ] ],
		limitsY = [ [ -30, 90 ], [ 90, 150 ], [ 150, 270 ], [ 270, 330 ] ],
		limitsZ = [ [ -30, 30 ], [ 30, 150 ], [ 150, 210 ], [ 210, 330 ] ],
		angleLimits = [ limitsX, limitsY, limitsZ ],
		multX = [ [ 1.75 ], [ .6 ], [ 1.75 ], [ .6 ] ],
		multY = [ [ .6 ], [ 1.75 ], [ .6 ], [ 1.75 ] ],
		multZ = [ [ 1.75 ], [ .6 ], [ 1.75 ], [ .6 ] ],
		multipliersXYZ = [ multX, multY, multZ ],
		returnAngle = 0,
		returnMult = 0,
		returnCenterPoint = [ 0, 0 ]
		;

	if (_currentAngle < 90)
	{
		// returnAngle = currentAngle - 15;
		returnAngle = reprojectAngle(_currentAngle, 0, 90, angleLimits[axis][0][0], angleLimits[axis][0][1]);
		returnMult = multipliersXYZ[axis][0];

		switch (_direction)
		{
			case 0:
				returnCenterPoint[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)) + (.5 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] + _dist / 2;	
			break;
		
			case 1:
				returnCenterPoint[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (1 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] - _dist / 2;
			break;
		
			case 2:
				returnCenterPoint[0] = _centerPoint[0]; //- (1 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] + _dist;
			break;		
		}
	}
	else if (_currentAngle >= 90 && _currentAngle < 180)
	{
		returnAngle = reprojectAngle(_currentAngle, 90, 180, angleLimits[axis][1][0], angleLimits[axis][1][1]);						
		returnMult = multipliersXYZ[axis][1];

		switch (_direction)
		{
			case 0:
				returnCenterPoint[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (.5 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] + _dist / 2 - (.5 * _planeHeight);	
			break;
		
			case 1:
				returnCenterPoint[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)); //- (1 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] - _dist / 2;
			break;
		
			case 2:
				returnCenterPoint[0] = _centerPoint[0] + ((_isoWidth * (1/3) * _planeHeight)); //- (1 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1];
			break;	
		}
	}
	else if (_currentAngle >= 180 && _currentAngle < 270)
	{
		returnAngle = reprojectAngle(_currentAngle, 180, 270, angleLimits[axis][2][0], angleLimits[axis][2][1]);
		returnMult = multipliersXYZ[axis][2];

		switch (_direction)
		{
			case 0:
				returnCenterPoint[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)); //- (1 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] - (_dist / 2); // - (_isoDist * 2); // fix this: incorrectly placed rotation
			break;
		
			case 1:
				returnCenterPoint[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (.5 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] + _dist / 2 - (.5 * _planeHeight);	
			break;
		
			case 2:
				returnCenterPoint[0] = _centerPoint[0]; //- (1 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] - _dist;
			break;
				
		}		
	}
	else if (_currentAngle >= 270 && _currentAngle < 360)					
	{
		returnAngle = reprojectAngle(_currentAngle, 270, 360, angleLimits[axis][3][0], angleLimits[axis][3][1]);
		returnMult = multipliersXYZ[axis][3];
		switch (_direction)
		{
			case 0:
				returnCenterPoint[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (.5 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] - _dist / 2 - (.5 * _planeHeight);	
			break;
		
			case 1:
				returnCenterPoint[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)) + (.5 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1] + _dist / 2;	
			break;
		
			case 2:
				returnCenterPoint[0] = _centerPoint[0] - ((_isoWidth * (1/3) * _planeHeight)); //- (1 * _planeHeight);
				returnCenterPoint[1] = _centerPoint[1];
			break;
				
		}	
				
	}

	

	var returns = [ returnCenterPoint, returnAngle, returnMult ];
	return returns;
}

function indexOfItem(item, array)
{
	for (var i = 0; i < array.length; i++)
	{
		if (parseFloat(item) == parseFloat(array[i]))
		{
			return i;
		}
	}
	return null;
}

function countInArray(elem, array) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] == elem) {
            count++;
        }
    }
    return count;
}