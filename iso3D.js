
var mainComp = app.project.activeItem,  											// get the selected layer
layerIndex = mainComp.selectedLayers[0].index,  								// grab index of selected layer
layer = mainComp.layer(layerIndex),
temp,
fps = 24,
isoWidth = 50;
selectedPoints = [ 0, 0, 0, 0 ]
sliderAngle = layer.property("Effects").property("Slider Control").property("Slider")
;


var windowAEFKR = new Window ("dialog", "AEFKR"); 											// create window

var groupInput = windowAEFKR.add ("group");													// create input groups
groupInput.orientation = "column";

var groupSelectionsTop = groupInput.add ("group");
var selection0 = groupSelectionsTop.add ("checkbox", undefined, "top left");
var selection1 = groupSelectionsTop.add ("checkbox", undefined, "top right");
var groupSelectionsBot = groupInput.add ("group");
var selection2 = groupSelectionsBot.add ("checkbox", undefined, "bot left");
var selection3 = groupSelectionsBot.add ("checkbox", undefined, "bot right");

var groupPlaneHeight = groupInput.add ("group");
var planeHeightInput = groupPlaneHeight.add ("statictext", undefined, "plane height:");	
var inputHeight = groupPlaneHeight.add ("edittext", undefined, "int");
inputHeight.characters = 3;
groupPlaneHeight.alignChildren = "left";	

var groupRot = groupInput.add ("group");
var rotAmount = groupRot.add ("statictext", undefined, "Amount to rot:");	
var inputRot = groupRot.add ("edittext", undefined, "degrees");													
inputRot.characters = 6;
groupRot.alignChildren = "center";

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
	selectedPoints[0] = selection0.value;
	selectedPoints[1] = selection1.value;
	selectedPoints[2] = selection2.value;
	selectedPoints[3] = selection3.value;

	var startTime = mainComp.time,
		startFrame = convertTimeToFPS(startTime, fps),
		direction = 1,
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
		rotAmount = parseFloat(inputRot.text)
		;

	for (var j = 0; j < 4; j++)
	{
		if (selectedPoints[j] == true)
		{	
			var centerPoint = [ 0, 0 ],
				rotPoint = [ 0, 0 ]
				;

			if (j == 0 || j == 1)	// add direction modifier to this for rotation around other axes
			{
				rotPoint = vertsStart[j];
				centerPoint = vertsStart[j + 2]; 
			}
			else if (j == 2 || j == 3)
			{
				rotPoint = vertsStart[j];
				centerPoint = vertsStart[j - 2];
			}

			var isoDist = Math.tan(degreesToRadians(30)) * isoWidth,
				dist = isoDist * planeHeight,
				currentAngle = sliderAngle.valueAtTime(startTime, fps)
				;

			if (inputRot > 0)
			{
				currentAngle += 1;
			}
			else
			{
				currentAngle -= 1;
			}

			//alert (dist);

			for (var i = 1; i <= Math.abs(rotAmount) + 2; i++)
			{
				if (currentAngle >= 360)
				{
					currentAngle = currentAngle - 360;
				}
				else if (currentAngle < 0)
				{
					currentAngle = 360 + currentAngle;
				}

				var newCenterPoint,
					newCurrentAngle,
					rotationValues
					;

				rotationValues = rotatePoint(currentAngle, centerPoint, dist, isoDist, isoWidth, direction, planeHeight); // incomplete
				sliderAngle.setValueAtTime(convertFPSToTime(startFrame + i, fps), currentAngle);
				vertsEnd[j].setValueAtTime(convertFPSToTime(startFrame + i, fps),rotateAroundPoint(0, rotationValues[0], dist, rotationValues[1], rotationValues[2]));

				if (rotAmount > 0)
				{
				currentAngle++;						
				}
				else 
				{
				currentAngle--;							
				}
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

function rotateAroundPoint(direction, _centerPoint, _dist, _currentAngle,_mult)
{
	var endLocation = [ 0 , 0 ],
		_rotPoint = [ 0 , 0 ]
		;

	_currentAngle = degreesToRadians((_currentAngle - 90));
	
	_rotPoint[0] = _centerPoint[0] + (Math.cos(_currentAngle) * (_dist * _mult));
	_rotPoint[1] = _centerPoint[1] + (Math.sin(_currentAngle) * (_dist * _mult));

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

function rotatePoint(_currentAngle, _centerPoint, _dist, _isoDist, _isoWidth, axis, _planeHeight)
{
	var limitsX = [ [ -30, 90 ], [ 90, 150 ], [ 150, 270 ], [ 270, 330 ] ],
		limitsY = [ [ -30, 90 ], [ 90, 150 ], [ 150, 270 ], [ 270, 330 ] ],
		limitsZ = [ [ -30, 90 ], [ 90, 150 ], [ 150, 270 ], [ 270, 330 ] ],
		angleLimits = [ limitsX, limitsY, limitsZ ],
		multX = [ [ .6 ], [ 1.75 ], [ .6 ], [ 1.775 ] ],
		multY = [ [ .6 ], [ 1.75 ], [ .6 ], [ 1.775 ] ],
		multZ = [ [ .6 ], [ 1.75 ], [ .6 ], [ 1.775 ] ],
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
		returnCenterPoint[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (1 * _planeHeight);
		returnCenterPoint[1] = _centerPoint[1] - _dist / 2;
	}
	else if (_currentAngle >= 90 && _currentAngle < 180)
	{
		// newCurrentAngle = currentAngle - 90;
		returnAngle = reprojectAngle(_currentAngle, 90, 180, angleLimits[axis][1][0], angleLimits[axis][1][1]);						
		returnMult = multipliersXYZ[axis][1];
		returnCenterPoint[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)); //- (1 * _planeHeight);
		returnCenterPoint[1] = _centerPoint[1] - _dist / 2;
		
	}
	else if (_currentAngle >= 180 && _currentAngle < 270)
	{
		returnAngle = reprojectAngle(_currentAngle, 180, 270, angleLimits[axis][2][0], angleLimits[axis][2][1]);
		returnMult = multipliersXYZ[axis][2];
		returnCenterPoint[0] = _centerPoint[0] - ((_isoWidth * (2/3) / 2) * (_planeHeight / 2)); //- (.5 * _planeHeight);
		returnCenterPoint[1] = _centerPoint[1] + _dist / 2 - (.5 * _planeHeight);	
	}
	else if (_currentAngle >= 270 && _currentAngle < 360)					
	{
		returnAngle = reprojectAngle(_currentAngle, 270, 360, angleLimits[axis][3][0], angleLimits[axis][3][1]);
		returnMult = multipliersXYZ[axis][3];
		returnCenterPoint[0] = _centerPoint[0] + ((_isoWidth * (2/3) / 2) * (_planeHeight / 2 * 3)) + (.5 * _planeHeight);
		returnCenterPoint[1] = _centerPoint[1] + _dist / 2;					
	}

	//alert(returnAngle);

	var returns = [ returnCenterPoint, returnAngle, returnMult ];
	return returns;
}
