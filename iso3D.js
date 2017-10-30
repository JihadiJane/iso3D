
var mainComp = app.project.activeItem,  											// get the selected layer
layerIndex = mainComp.selectedLayers[0].index,  								// grab index of selected layer
layer = mainComp.layer(layerIndex),
temp,
fps = 24,
isoWidth = 50,
isoDist = Math.tan(degreesToRadians(30)) * isoWidth,
sliderAngle = layer.property("Effects").property("Slider Control").property("Slider"),
timeControl = layer.property("Effects").property("Point Control").property("Point")
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
		currentAngle = sliderAngle.valueAtTime(startTime, fps),
		fixedVerts
		;

	if (currentAngle == 0 || currentAngle == 90 || currentAngle == 180 || currentAngle == 270 || currentAngle == 360) 
		{
			fixedVerts = descritizeVerts(vertsStart, isoDist, isoWidth);
		}
	else 
		{
			fixedVerts = vertsStart;
		}

	var newPointValuesX = [fixedVerts[0][0], fixedVerts[1][0], fixedVerts[2][0], fixedVerts[3][0]],
		newPointValuesY = [fixedVerts[0][1], fixedVerts[1][1], fixedVerts[2][1], fixedVerts[3][1]],
		unsortedPoints = [fixedVerts[0], fixedVerts[1], fixedVerts[2], fixedVerts[3]],
		unsortedPointsX = [fixedVerts[0][0], fixedVerts[1][0], fixedVerts[2][0], fixedVerts[3][0]],
		unsortedPointsY = [fixedVerts[0][1], fixedVerts[1][1], fixedVerts[2][1], fixedVerts[3][1]],
		sortedPointsX = newPointValuesX,
		sortedPointsY = newPointValuesY,
		maxX = Math.max(newPointValuesX[0], newPointValuesX[1], newPointValuesX[2], newPointValuesX[3]),
		maxY = Math.max(newPointValuesY[0], newPointValuesY[1], newPointValuesY[2], newPointValuesY[3]),
		minX = Math.min(newPointValuesX[0], newPointValuesX[1], newPointValuesX[2], newPointValuesX[3]),
		minY = Math.min(newPointValuesY[0], newPointValuesY[1], newPointValuesY[2], newPointValuesY[3]),
		centerPoints = [[ 0, 0 ], [ 0, 0 ]],
		rotPoints = [[ 0, 0 ], [ 0, 0 ]],
		newCenterPoints = [[ 0, 0 ], [ 0, 0 ]],
		newRotPoints = [[ 0, 0 ], [ 0, 0 ]],
		tempPoints,
		remapTime = timeControl.valueAtTime(startTime, fps),
		dist = isoDist * planeHeight,
		points
		;

	for (var i = 0; i < 4; i++)
	{
		vertsEnd[i].setValueAtTime(convertFPSToTime(startFrame, fps), fixedVerts[i]);		
	}

	sliderAngle.setValueAtTime(convertFPSToTime(startFrame, fps), currentAngle);
	sortedPointsX.sort(function(a, b){return a - b});
	sortedPointsY.sort(function(a, b){return a - b});

	if (currentAngle == 0 || currentAngle == 90 || currentAngle == 180 || currentAngle == 270 || currentAngle == 360)
	{
		points = assignRotAndCenterPoints(direction, currentAngle, vertsEnd, centerPoints, rotPoints, sortedPointsX, sortedPointsY, unsortedPointsX, unsortedPointsY, planeHeight, i, startFrame, fps);		
	}
	else
	{
		points = vertsStart;
	}
	rotPoints = [ points[0], points[1] ];
	centerPoints = [ points[2], points[3] ];

	for (var i = 1; i <= Math.abs(rotAmount); i++)
	{
		var rotationValues;

		if (rotAmount > 0)
		{
		currentAngle++;						
		}
		else 
		{
		currentAngle--;							
		}

		sliderAngle.setValueAtTime(convertFPSToTime(startFrame + i, fps), currentAngle);

		for (var j = 0; j < 2; j++)
		{
		rotationValues = moveDrawCenter(currentAngle, centerPoints[j], dist, isoDist, isoWidth, direction, planeHeight, direction);
		newRotPoints[j] = rotatePointAroundCircle(rotationValues[0], dist, rotationValues[1], rotationValues[2]);			
		}

		//alert(centerPoints);
		vertsEnd[0].setValueAtTime(convertFPSToTime(startFrame + i, fps),newRotPoints[0]);
		vertsEnd[1].setValueAtTime(convertFPSToTime(startFrame + i, fps),newRotPoints[1]);
		vertsEnd[2].setValueAtTime(convertFPSToTime(startFrame + i, fps),centerPoints[0]);
		vertsEnd[3].setValueAtTime(convertFPSToTime(startFrame + i, fps),centerPoints[1]);

		// if currentAngle == 90, 180, etc, check verts
		// after assigning the verts correctly, do rotations

		if (currentAngle > 360)
		{
			currentAngle = currentAngle - 360;
		}
		else if (currentAngle < 0)
		{
			currentAngle = 360 + currentAngle;
		}
		else if (currentAngle == 360)
		{
			currentAngle = 0;
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

function rotatePointAroundCircle(drawCenter, _dist, _currentAngle, _mult)
{
	var endLocation = [ 0 , 0 ],
		_rotPoint = [ 0 , 0 ],
		_newCurrentAngle
		;

	_newCurrentAngle = degreesToRadians((_currentAngle - 90));
	
	_rotPoint[0] = drawCenter[0] + (Math.cos(_newCurrentAngle) * (_dist * _mult));
	_rotPoint[1] = drawCenter[1] + (Math.sin(_newCurrentAngle) * (_dist * _mult));

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

function moveDrawCenter(_currentAngle, _centerPoint, _dist, _isoDist, _isoWidth, _direction, _planeHeight, _direction) // fix this: something to do with the centerPoint
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
		returnDrawCenter = [ 0, 0 ]
		;

	if (_currentAngle < 90)
	{
		// returnAngle = currentAngle - 15;
		returnAngle = reprojectAngle(_currentAngle, 0, 90, angleLimits[_direction][0][0], angleLimits[_direction][0][1]);
		returnMult = multipliersXYZ[_direction][0];

		switch (_direction)
		{
			case 0:
				returnDrawCenter[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)) + (.5 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] + _dist / 2;	
			break;
		
			case 1:
				returnDrawCenter[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (1 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] - _dist / 2;
			break;
		
			case 2:
				returnDrawCenter[0] = _centerPoint[0]; //- (1 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] + _dist;
			break;		
		}
	}
	else if (_currentAngle >= 90 && _currentAngle < 180)
	{
		returnAngle = reprojectAngle(_currentAngle, 90, 180, angleLimits[_direction][1][0], angleLimits[_direction][1][1]);						
		returnMult = multipliersXYZ[_direction][1];

		switch (_direction)
		{
			case 0:
				returnDrawCenter[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (.5 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] + _dist / 2 - (.5 * _planeHeight);	
			break;
		
			case 1:
				returnDrawCenter[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)); //- (1 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] - _dist / 2;
			break;
		
			case 2:
				returnDrawCenter[0] = _centerPoint[0] + ((_isoWidth * (1/3) * _planeHeight)); //- (1 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1];
			break;	
		}
	}
	else if (_currentAngle >= 180 && _currentAngle < 270)
	{
		returnAngle = reprojectAngle(_currentAngle, 180, 270, angleLimits[_direction][2][0], angleLimits[_direction][2][1]);
		returnMult = multipliersXYZ[_direction][2];

		switch (_direction)
		{
			case 0:
				returnDrawCenter[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)); //- (1 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] - (_dist / 2); // - (_isoDist * 2); // fix this: incorrectly placed rotation
			break;
		
			case 1:
				returnDrawCenter[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (.5 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] + _dist / 2 - (.5 * _planeHeight);	
			break;
		
			case 2:
				returnDrawCenter[0] = _centerPoint[0]; //- (1 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] - _dist;
			break;
				
		}		
	}
	else if (_currentAngle >= 270 && _currentAngle < 360)					
	{
		returnAngle = reprojectAngle(_currentAngle, 270, 360, angleLimits[_direction][3][0], angleLimits[_direction][3][1]);
		returnMult = multipliersXYZ[_direction][3];
		switch (_direction)
		{
			case 0:
				returnDrawCenter[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (.5 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] - _dist / 2 - (.5 * _planeHeight);	
			break;
		
			case 1:
				returnDrawCenter[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)) + (.5 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1] + _dist / 2;	
			break;
		
			case 2:
				returnDrawCenter[0] = _centerPoint[0] - ((_isoWidth * (1/3) * _planeHeight)); //- (1 * _planeHeight);
				returnDrawCenter[1] = _centerPoint[1];
			break;	
		}
				
	}

	

	var returns = [ returnDrawCenter, returnAngle, returnMult ];
	return returns;
}

function indexOfItem(item, array, _planeHeight)
{
	for (var i = 0; i < array.length; i++)
	{
		if (Math.abs(parseFloat(item) - parseFloat(array[i])) < .3)
		{
			return i;
		}
	}
	return null;
}

function countInArray(elem, array) 
{
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] == elem) {
            count++;
        }
    }
    return count;
}

function descritizeVerts(verts, _isoDist, _isoWidth)
{
	var returnVerts = [ ];

	for(var i = 0; i < 4; i++)
	{
		var discreteVert = [ verts[i][0], verts[i][1] ]
		
		if ((discreteVert[0] % (_isoWidth / 2)) > _isoWidth / 4)
		{
			discreteVert[0] = discreteVert[0] - (discreteVert[0] % (_isoWidth / 2)) + (_isoWidth / 2);
		}
		else if ((discreteVert[0] % (_isoWidth / 2)) < _isoWidth / 4)
		{
			discreteVert[0] = verts[i][0] - (verts[i][0] % (_isoWidth / 2));
		}

		if ((discreteVert[1] % (_isoDist)) > _isoDist / 2)
		{
			discreteVert[1] = discreteVert[1] - (discreteVert[1] % (_isoDist)) + (_isoDist);
		}
		else if ((discreteVert[1] % (_isoDist)) < _isoDist / 2)
		{
			discreteVert[1] = verts[i][1] - (verts[i][1] % (_isoDist));
		}	
		
		returnVerts.push(discreteVert);
	}
	return returnVerts;
}

function assignRotAndCenterPoints(_direction, _currentAngle, _vertsEnd, _centerPoints, _rotPoints, _sortedPointsX, _sortedPointsY, _unsortedPointsX, _unsortedPointsY, _planeHeight, _i, _startFrame, _fps)
{
	var returnRotPoints = [ [ 0, 0 ], [ 0, 0 ]],
		returnCenterPoints = [ [ 0, 0 ], [ 0, 0 ]]
		;

	switch(_direction)
	{
		case 0:
			if (_currentAngle == 0 || _currentAngle == 360)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];
				returnCenterPoints[0][1] = _sortedPointsY[3];			
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[1],_unsortedPointsY)];
				returnRotPoints[0][1] = _sortedPointsY[1];

				returnCenterPoints[1][0] =	_unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY, _planeHeight)];		
				returnCenterPoints[1][1] =  _sortedPointsY[2];
				returnRotPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0], _unsortedPointsY)];
				returnRotPoints[1][1] = _sortedPointsY[0];
			}
			if (_currentAngle == 90)
			{
				returnCenterPoints[0][0] = _sortedPointsX[0];			
				returnCenterPoints[0][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[0], _unsortedPointsX, _planeHeight)];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3],_unsortedPointsY)];
				returnRotPoints[0][1] = _sortedPointsY[3];


				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0], _unsortedPointsY, _planeHeight)];			
				returnCenterPoints[1][1] = _sortedPointsY[0];
				returnRotPoints[1][0] = _sortedPointsX[3];	
				returnRotPoints[1][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[3],_unsortedPointsX)];
			
			}
			if (_currentAngle == 180)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[1],_unsortedPointsY)];
				returnCenterPoints[0][1] = _sortedPointsY[1];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];
				returnRotPoints[0][1] = _sortedPointsY[3];	

				returnCenterPoints[1][1] = _sortedPointsY[0];
				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0], _unsortedPointsY)];					
				returnRotPoints[1][0] =	_unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY, _planeHeight)];		
				returnRotPoints[1][1] =  _sortedPointsY[2];

			}
			if (_currentAngle == 270)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3],_unsortedPointsY)];
				returnCenterPoints[0][1] = _sortedPointsY[3];
				returnRotPoints[0][0] = _sortedPointsX[0];			
				returnRotPoints[0][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[0], _unsortedPointsX, _planeHeight)];

				returnCenterPoints[1][0] = _sortedPointsX[3];	
				returnCenterPoints[1][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[3],_unsortedPointsX)];
				returnRotPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0], _unsortedPointsY, _planeHeight)];			
				returnRotPoints[1][1] = _sortedPointsY[0];
			}

			else 
			{
				_rotPoints[0] = _vertsEnd[0].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_rotPoints[1] = _vertsEnd[1].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_centerPoints[0] = _vertsEnd[2].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_centerPoints[1] = _vertsEnd[3].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
			}
		break;

		case 1:
			if (_currentAngle == 0 || _currentAngle == 360)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY, _planeHeight)];
				returnCenterPoints[0][1] = _sortedPointsY[2];			
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0],_unsortedPointsY)];
				returnRotPoints[0][1] = _sortedPointsY[0];

				returnCenterPoints[1][0] =	_unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];	
				returnCenterPoints[1][1] =  _sortedPointsY[3];
				returnRotPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[1], _unsortedPointsY)];
				returnRotPoints[1][1] = _sortedPointsY[1];
			}
			if (_currentAngle == 90)
			{
				returnCenterPoints[0][0] = _sortedPointsX[0];			
				returnCenterPoints[0][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[0], _unsortedPointsX, _planeHeight)];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0],_unsortedPointsY)];
				returnRotPoints[0][1] = _sortedPointsY[0];


				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];		
				returnCenterPoints[1][1] = _sortedPointsY[3];
				returnRotPoints[1][0] = _sortedPointsX[3];	
				returnRotPoints[1][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[3],_unsortedPointsX)];
			
			}
			if (_currentAngle == 180)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0],_unsortedPointsY)];
				returnCenterPoints[0][1] = _sortedPointsY[0];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY, _planeHeight)];
				returnRotPoints[0][1] = _sortedPointsY[2];	

				returnCenterPoints[1][1] = _sortedPointsY[1];
				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[1], _unsortedPointsY)];					
				returnRotPoints[1][0] =	_unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];		// point 1 , X
				returnRotPoints[1][1] =  _sortedPointsY[3];

			}
			if (_currentAngle == 270)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0],_unsortedPointsY)];
				returnCenterPoints[0][1] = _sortedPointsY[0];
				returnRotPoints[0][0] = _sortedPointsX[0];			// point 0 , X
				returnRotPoints[0][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[0], _unsortedPointsX, _planeHeight)];

				returnCenterPoints[1][0] = _sortedPointsX[3];	
				returnCenterPoints[1][1] = _unsortedPointsY[indexOfItem(_sortedPointsX[3],_unsortedPointsX)];
				returnRotPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];			// point 1 , X
				returnRotPoints[1][1] = _sortedPointsY[3];
			}

			else 
			{
				_rotPoints[0] = _vertsEnd[0].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_rotPoints[1] = _vertsEnd[1].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_centerPoints[0] = _vertsEnd[2].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_centerPoints[1] = _vertsEnd[3].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
			}
		break;

		case 2:
			if (_currentAngle == 0 || _currentAngle == 360)
			{
				returnCenterPoints[0][0] =	_unsortedPointsX[indexOfItem(_sortedPointsY[1], _unsortedPointsY, _planeHeight)];
				returnCenterPoints[0][1] =  _sortedPointsY[1];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0], _unsortedPointsY)];
				returnRotPoints[0][1] = _sortedPointsY[0];

				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];
				returnCenterPoints[1][1] = _sortedPointsY[3];			
				returnRotPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY, _planeHeight)];
				returnRotPoints[1][1] = _sortedPointsY[2];
			}
			if (_currentAngle == 90)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[1],_unsortedPointsY)];			
				returnCenterPoints[0][1] = _sortedPointsY[1];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0],_unsortedPointsY)];
				returnRotPoints[0][1] = _sortedPointsY[0];


				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];		
				returnCenterPoints[1][1] = _sortedPointsY[3];
				returnRotPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY, _planeHeight)];	
				returnRotPoints[1][1] = _sortedPointsY[2];
			
			}
			if (_currentAngle == 180)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0],_unsortedPointsY)];
				returnCenterPoints[0][1] = _sortedPointsY[0];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[1], _unsortedPointsY, _planeHeight)];
				returnRotPoints[0][1] = _sortedPointsY[1];	

				returnCenterPoints[1][1] = _sortedPointsY[2];
				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY)];					
				returnRotPoints[1][0] =	_unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];		// point 1 , X
				returnRotPoints[1][1] =  _sortedPointsY[3];

			}
			if (_currentAngle == 270)
			{
				returnCenterPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[0],_unsortedPointsY)];
				returnCenterPoints[0][1] = _sortedPointsY[0];
				returnRotPoints[0][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[1],_unsortedPointsY)];			// point 0 , X
				returnRotPoints[0][1] = _sortedPointsY[1];

				returnCenterPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[2], _unsortedPointsY, _planeHeight)];		
				returnCenterPoints[1][1] = _sortedPointsY[2];
				returnRotPoints[1][0] = _unsortedPointsX[indexOfItem(_sortedPointsY[3], _unsortedPointsY, _planeHeight)];			// point 1 , X
				returnRotPoints[1][1] = _sortedPointsY[3];
			}

			else 
			{
				_rotPoints[0] = _vertsEnd[0].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_rotPoints[1] = _vertsEnd[1].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_centerPoints[0] = _vertsEnd[2].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
				_centerPoints[1] = _vertsEnd[3].valueAtTime(convertFPSToTime(_startFrame + _i, _fps), true);
			}
		break;
	}

	var returnAllPoints = [ returnRotPoints[0], returnRotPoints[1], returnCenterPoints[0], returnCenterPoints[1] ];
	return returnAllPoints;
}