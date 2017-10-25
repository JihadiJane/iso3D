
var mainComp = app.project.activeItem,  											// get the selected layer
layerIndex = mainComp.selectedLayers[0].index,  								// grab index of selected layer
layer = mainComp.layer(layerIndex),
temp,
fps = 24,
isoWidth = 50;
pointA = [ 1250, 218 ],
pointB = [ 960, 894 ],
pointC = [ 389, 84 ],
pointD = [ 1800, 970 ],
selectedPoints = [ 0, 0, 0, 0 ]
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

var groupIcon = groupInput.add("group");
var current = File($.fileName).path;  
var iconPath = current + "/icon.jpg"; 
groupIcon.add ("image", undefined, iconPath);

var groupRot = groupInput.add ("group");
var rotAmount = groupRot.add ("statictext", undefined, "Amount to rot:");	
var inputRot = groupRot.add ("edittext", undefined, "degrees");													
inputRot.characters = 6;
groupRot.alignChildren = "center";



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

	var currentTime = mainComp.time,
		currentFrame = convertTimeToFPS(currentTime, fps),
		direction = 1,
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

			var dist = distance(centerPoint, rotPoint),
				currentAngle = Math.atan2(rotPoint[1] - centerPoint[1], rotPoint[0] - centerPoint[0]) * 180 / Math.PI + 90,
				isoDist = Math.tan(degreesToRadians(30)) * isoWidth * 2
				;

			for (var i = 0; i <= Math.abs(rotAmount); i++)
			{
				if (currentAngle > 360)
				{
					currentAngle = 0;
				}

				var newCenterPoint,
					newCurrentAngle,
					rotationValues
					;

				rotationValues = rotatePoint(currentAngle, centerPoint, dist, isoDist, isoWidth, direction); // incomplete

				vertsEnd[j].setValueAtTime(convertFPSToTime(currentFrame + i, fps),rotateAroundPoint(0, rotationValues[0], dist, 0, rotationValues[1], rotationValues[2]));

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

function rotateAroundPoint(direction, _centerPoint, dist, startAngle, _currentAngle,_mult)
{
	var endLocation = [ 0 , 0 ],
		_rotPoint = [ 0 , 0 ]
		;

	_currentAngle = degreesToRadians((_currentAngle - 90));
	
	_rotPoint[0] = _centerPoint[0] + (Math.cos(_currentAngle) * (dist * _mult));
	_rotPoint[1] = _centerPoint[1] + (Math.sin(_currentAngle) * (dist * _mult));

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

	alpha = (angle - min) / (max - min);

	returnInterpolated  = _in + (alpha * (_out - _in));
	return returnInterpolated;
}

function degreesToRadians(degrees)
{
	var returnRadians = degrees * Math.PI/180;
	return returnRadians;
}

function rotatePoint(_currentAngle, _centerPoint, _dist, _isoDist, _isoWidth, axis)
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
		// newCurrentAngle = currentAngle - 15;
		returnAngle = reprojectAngle(_currentAngle, 0, 90, angleLimits[axis][0][0], angleLimits[axis][0][1]);
		returnMult = multipliersXYZ[axis][0];
		returnCenterPoint[0] = _centerPoint[0] + (((_dist / _isoDist) * _isoWidth) / 3) - (_dist / _isoDist);
		returnCenterPoint[1] = _centerPoint[1] - _dist / 2;
	}
	else if (_currentAngle >= 90 && _currentAngle < 180)
	{
		// newCurrentAngle = currentAngle - 90;
		returnAngle = reprojectAngle(_currentAngle, 90, 180, angleLimits[axis][1][0], angleLimits[axis][1][1]);						
		returnMult = multipliersXYZ[axis][1];
		returnCenterPoint[0] = _centerPoint[0] - (_dist / _isoDist) * _isoWidth - (_dist / _isoDist);
		returnCenterPoint[1] = _centerPoint[1] - _dist / 2;
		
	}
	else if (_currentAngle >= 180 && _currentAngle < 270)
	{
		returnAngle = reprojectAngle(_currentAngle, 180, 270, angleLimits[axis][2][0], angleLimits[axis][2][1]);
		returnMult = multipliersXYZ[axis][2];
		returnCenterPoint[0] = _centerPoint[0] - (((_dist / _isoDist) * _isoWidth) / 3) - (_dist / _isoDist);
		returnCenterPoint[1] = _centerPoint[1] + _dist / 2;	
	}
	else if (_currentAngle >= 270 && _currentAngle < 360)					
	{
		returnAngle = reprojectAngle(_currentAngle, 270, 360, angleLimits[axis][3][0], angleLimits[axis][3][1]);
		returnMult = multipliersXYZ[axis][3];
		returnCenterPoint[0] = _centerPoint[0] + (_dist / _isoDist) * _isoWidth;
		returnCenterPoint[1] = _centerPoint[1] + _dist / 2;					
	}

	var returns = [ returnCenterPoint, returnAngle, returnMult ];
	return returns;
}
