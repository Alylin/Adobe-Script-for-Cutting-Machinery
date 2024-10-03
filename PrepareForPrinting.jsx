//@include LE_Functions.js
#target illustrator

function traceImage(rasterImage, isBlackAndWhite) {
    var itemTrace = rasterImage.trace();
    var tracingOptions = itemTrace.tracing.tracingOptions;

	const ignoreColor = new RGBColor();
	ignoreColor.red = 255;
	ignoreColor.green = 255;
	ignoreColor.blue = 255;

    tracingOptions.tracingMode = isBlackAndWhite ? TracingModeType.TRACINGMODEBLACKANDWHITE : TracingModeType.TRACINGMODECOLOR;
    tracingOptions.tracingMethod = isBlackAndWhite ? TracingMethodType.TRACINGMETHODABUTTING : TracingMethodType.TRACINGMETHODOVERLAPPING;
	  tracingOptions.ignoreColor = isBlackAndWhite ? ignoreColor : false;
	  tracingOptions.ignoreWhite = !!isBlackAndWhite;
    tracingOptions.pathFidelity = 100;
    tracingOptions.cornerFidelity = 40;
    tracingOptions.colorFidelity = 100;
    tracingOptions.noiseFidelity = 100;
    tracingOptions.fills = true;
    tracingOptions.tracingColorTypeValue = TracingColorType.TRACINGFULLCOLOR
    
    return itemTrace.tracing.expandTracing().pathItems;
}

function smoothCorners(pathToSmooth, doc, smoothAmount) {
	var temporaryPath = pathToSmooth.duplicate(doc, ElementPlacement.INSIDE);  

	LE_OffsetPath(
		temporaryPath,
		{
			offset: 5,
			joinType: 0,
			miterLimit: 4,
			expandAppearance: false
		}
	);
	temporaryPath.selected = true;
	app.executeMenuCommand("expandStyle");

	var color = new RGBColor();
    color.red = 0;
    color.green = 255;
    color.blue = 0;

	temporaryPath.stroked = true;
	temporaryPath.strokeWidth = 10;
	temporaryPath.strokeColor = color;
}

function showUI(silhouette, rasterImage, maskingPath, doc) {
    var win = new Window('dialog', 'Outline Image');
    win.orientation = 'column';

    var sizeGrp = win.add('group');
    sizeGrp.alignChildren = 'fill';
    sizeGrp.spacing = 20;

    sizeGrp.add('statictext', undefined, 'Size');
    var sizeInp = sizeGrp.add('edittext', undefined, 10);
    sizeInp.preferredSize.width = 60;
    
    sizeGrp.add('statictext', undefined, 'Border Size');
    var sizeInp2 = sizeGrp.add('edittext', undefined, 10);
    sizeInp2.preferredSize.width = 60;

    var btns = win.add('group');
    btns.alignChildren = 'fill';
    
    var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    var ok = btns.add('button', undefined, 'Apply',  { name: 'apply' });


	function onKeyUpBorder() {
        var borderSize = Number(sizeInp2.text);
		
		var size = Number(sizeInp.text);
		if (borderSize > 0 && size > 0) {
			resizeTemporary(maskingPath, silhouette, rasterImage, size, borderSize);

			releaseMask(maskingPath);
			var temporarySilhouette = silhouette.duplicate(doc, ElementPlacement.INSIDE);  
			LE_OffsetPath(
				temporarySilhouette,
				{
					offset: borderSize,
					joinType: 0,
					miterLimit: 4,
					expandAppearance: false
				}
			);
			temporarySilhouette.selected = true;
			app.executeMenuCommand("expandStyle");
			temporarySilhouette = doc.selection[0];

			maskingPath = createMask(rasterImage, temporarySilhouette, doc);
			temporarySilhouette.remove();
			app.redraw();
		}
	}
	sizeInp2.addEventListener('keyup', onKeyUpBorder);

	onKeyUpBorder();

    function okClick() {
        var areaSize = Number(sizeInp.text);
        var borderSize = Number(sizeInp2.text);

		resizeTemporary(maskingPath, silhouette, rasterImage, areaSize, borderSize);

		releaseMask(maskingPath);
		LE_OffsetPath(
			silhouette,
			{
				offset: borderSize,
				joinType: 0,
				miterLimit: 4,
				expandAppearance: false
			}
		);
		silhouette.selected = true;
		app.executeMenuCommand("expandStyle");
		silhouette = doc.selection[0];

		smoothCorners(silhouette, doc, 10);

		//maskingPath = createMask(rasterImage, silhouette, doc);
		//silhouette.remove();

        win.close();
    }

    function cancelClick() {
        win.close();
    }

    ok.onClick = okClick; 
    cancel.onClick = cancelClick;  

    win.center();
    win.show();
}

function simplify(ipath, doc) {
	app.executeMenuCommand('deselectall');
	ipath.selected = true;

    var actionCode = "/version 3" +
	"/name [ 4" +
	"	73657431" +
	"]" +
	"/isOpen 1" +
	"/actionCount 1" +
	"/action-1 {" +
	"	/name [ 6" +
	"		616374696f6e" +
	"	]" +
	"	/keyIndex 0" +
	"	/colorIndex 0" +
	"	/isOpen 1" +
	"	/eventCount 1" +
	"	/event-1 {" +
	"		/useRulersIn1stQuadrant 0" +
	"		/internalName (ai_plugin_simplify)" +
	"		/localizedName [ 8" +
	"			53696d706c696679" +
	"		]" +
	"		/isOpen 0" +
	"		/isOn 1" +
	"		/hasDialog 1" +
	"		/showDialog 0" +
	"		/parameterCount 4" +
	"		/parameter-1 {" +
	"			/key 1919182693" +
	"			/showInPalette 4294967295" +
	"			/type (unit real)" +
	"			/value 0.0" +
	"			/unit 592474723" +
	"		}" +
	"		/parameter-2 {" +
	"			/key 1634561652" +
	"			/showInPalette 4294967295" +
	"			/type (unit real)" +
	"			/value 0.0" +
	"			/unit 591490663" +
	"		}" +
	"		/parameter-3 {" +
	"			/key 1936553064" +
	"			/showInPalette 4294967295" +
	"			/type (boolean)" +
	"			/value 0" +
	"		}" +
	"		/parameter-4 {" +
	"			/key 1936552044" +
	"			/showInPalette 4294967295" +
	"			/type (boolean)" +
	"			/value 0" +
	"		}" +
	"	}" +
	"}" +
	"";

    var tmp = File(Folder.desktop + "/tmpSet1.aia");  
    
    tmp.open('w');  
    tmp.write(actionCode); 
    tmp.close();

    app.loadAction(tmp); 

    app.doScript("action", "set1", false);  
    app.unloadAction("set1","");
  
    tmp.remove();

	app.executeMenuCommand("expandStyle");
	return doc.selection[0];
}

function createSilhouette(rasterImage, doc, automatic, isBlackAndWhite) {
    var duplicateRasterImage = rasterImage.duplicate(doc, ElementPlacement.INSIDE);  

	var pathItems = traceImage(duplicateRasterImage, isBlackAndWhite);
	if (automatic && !isBlackAndWhite) {
		pathItems[pathItems.length-1].remove();
	}
	app.executeMenuCommand('deselectall');
    for (var i = 0; i < pathItems.length; i++) {
        pathItems[i].selected = true;
    }
    
    app.executeMenuCommand('ungroup');
    app.executeMenuCommand('group');
    app.executeMenuCommand("Live Pathfinder Merge");
    app.executeMenuCommand("Live Pathfinder Add");
	
    app.executeMenuCommand("expandStyle");
	
	return doc.selection[0];
}

function movePathToFront(path) {
	var layer = app.activeDocument.layers[0];
    path.move(layer, ElementPlacement.PLACEATBEGINNING);
}

function resizeTemporary(outline, silhouette, rasterImage, newAreaInInches, borderInPoints) {
    var originalWidthInches = ((silhouette.width) / 72);
    var originalHeightInches = ((silhouette.height) / 72);
    var originalAreaInches = originalWidthInches * originalHeightInches;

	var test = Math.sqrt(newAreaInInches);
	test = test - ((borderInPoints * 2) / 72);

    var scaleFactor = Math.sqrt((test*test) / originalAreaInches);
    outline.resize(scaleFactor * 100, scaleFactor * 100, true, true, true, true, scaleFactor * 100, Transformation.DOCUMENTORIGIN);
	silhouette.resize(scaleFactor * 100, scaleFactor * 100, true, true, true, true, scaleFactor * 100, Transformation.DOCUMENTORIGIN);
	rasterImage.resize(scaleFactor * 100, scaleFactor * 100, true, true, true, true, scaleFactor * 100, Transformation.DOCUMENTORIGIN);
}

function createMask(rasterImage, maskingPath, doc) {
	var duplicateMaskingPath = maskingPath.duplicate(doc, ElementPlacement.INSIDE);  
	app.executeMenuCommand('deselectall');
	duplicateMaskingPath.selected = true;
	
  app.executeMenuCommand("Live Pathfinder Merge");
  app.executeMenuCommand("Live Pathfinder Add");
  app.executeMenuCommand("expandStyle");
	duplicateMaskingPath = doc.selection[0];

	app.executeMenuCommand("compoundPath");
	rasterImage.selected = true;
  movePathToFront(duplicateMaskingPath);

  app.executeMenuCommand("makeMask");  
	return duplicateMaskingPath;
}

function releaseMask(maskingPath) {
	app.executeMenuCommand('deselectall');
	maskingPath.selected = true;

	app.executeMenuCommand("releaseMask");
	maskingPath.remove();
}

function prepareForPrint(automatic) {
    if (app.documents.length == 0) {
        alert("No document is open or no document is active.");
        return;
    }

    var doc = app.activeDocument;
    var selection = doc.selection;

	  var rasterImageSilhouette;
    var rasterImage;
	  var silhouette;

    if (selection.length === 1) {
        rasterImageSilhouette = selection[0];
        rasterImage = selection[0];
        silhouette = createSilhouette(rasterImageSilhouette, doc, automatic, false);
    }
    else if (selection.length === 2) {
        rasterImageSilhouette = selection[0];
        rasterImage = selection[1];

        rasterImageSilhouette.left = rasterImage.left;
        rasterImageSilhouette.top = rasterImage.top;
        silhouette = createSilhouette(rasterImageSilhouette, doc, automatic, false);
        rasterImageSilhouette.remove();
    }
    else {
        alert("Select either 1 or 2 raster images");
        return;
    }
	
	var maskingPath = createMask(rasterImage, silhouette, doc);

	showUI(silhouette, rasterImage, maskingPath, doc);
}

prepareForPrint(true);