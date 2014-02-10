/**
 * Map Area Draw
 * 
 * @author Serhio Magpie <serdidg@gmail.com> http://screensider.com
 * @fork Sergey Glazun <t4gr1m@gmail.com> http://tagrim.ru
 * 
 */

/**
 * Painter
 * 
 * @param {object} buttons
 * @returns {object}
 */
painter = function(buttons, raw_data) {
	var nodes,
		context,
		that		  = this,
		isCanvas	  = false,
		points		  = [],
		areas		  = [],
		default_clear = {
			type  : 'button',
			value : 'Clear All',
			class : 'btn',
			style : 'margin-right: 5px;'
		},
		default_add	 = {
			type  : 'button',
			value : 'Add Area',
			class : 'btn'
		},
		default_save	= {
			type  : 'button',
			value : 'Save Area',
			class : 'btn'
		};

	var checkCanvas = function() {
		if (nodes['canvas'].getContext) {
			isCanvas			   = true;
			nodes['canvas'].width  = nodes['draw'].offsetWidth;
			nodes['canvas'].height = nodes['draw'].offsetHeight;
			context				   = nodes['canvas'].getContext('2d');
		} else {
			_.remove(nodes['canvas']);
		}
	};

	var clearAllBtn = function() {
	var options				 	   = (buttons && buttons.clear) ? Object.extend(default_clear, buttons.clear) : default_clear;
		nodes['clear_all']		   = nodes['buttons'].appendChild(_.node('input', options));
		nodes['clear_all'].onclick = clearAll;
	};

	var addBtn = function() {
	var options				 = (buttons && buttons.add) ? Object.extend(default_add, buttons.add) : default_add;
		nodes['add']		 = nodes['buttons'].appendChild(_.node('input', options));
		nodes['add'].onclick = add;
	};

	var saveBtn = function() {
	var options			 	  = (buttons && buttons.save) ? Object.extend(default_save, buttons.save) : default_save;
		nodes['save']		  = nodes['buttons'].appendChild(_.node('input', options));
		nodes['save'].onclick = save;
	};

	var clearAll = function() {
		clear();
		_.clearNode(nodes['info']);
		points = [];
		areas  = [];

		// Clear preview from points or canvas
		if (isCanvas) {
			clearCanvas();
		} else {
			clearPoints();
		}
	};
		
	var add = function() {
		_.remove(nodes['add']);
		_.addClass(nodes['preview'], 'draw');
		_.addEvent(nodes['draw'], 'mousedown', addPoint);
		saveBtn();
	};
	
	var save = function() {
		clear();
		areas.push(_.clone(points));
		points = [];
		renderInfo();
	};
	
	var clear = function() {
		_.remove(nodes['add']);
		_.remove(nodes['save']);
		_.removeClass(nodes['preview'], 'draw');
		_.removeEvent(nodes['draw'], 'mousedown', addPoint);
		addBtn();
	};
	
	var clearCanvas = function() {
		context.clearRect(0, 0, nodes['canvas'].width, nodes['canvas'].height);
	};
	
	var clearPoints = function() {
		_.clearNode(nodes['points']);
	};
	
	var addPoint = function(e) {
		var e	   = _.getEvent(e),
			offset = _.getOffset(nodes['draw']),
			x	   = e.clientX + _.getDocScrollLeft() - offset[0],
			y	   = e.clientY + _.getDocScrollTop() - offset[1];

		points.push({'x' : x, 'y' : y});

		if (isCanvas) {
			drawCanvasAll();
		} else {
			drawHtmlPoint(x,y);
		}
		// Prevent drag event
		e.preventDefault && e.preventDefault();
		return false;
	};
	
	var drawHtmlPoint = function(x, y) {
		var node		= nodes['points'].appendChild(_.node('div', { class: 'point' }));
		node.style.top	= y - 1 + 'px';
		node.style.left = x - 1 + 'px';
	};
	
	var drawCanvasPoints = function(o) {
		// Draw lines
		context.fillStyle	 = 'rgba(0, 172, 239, 0.2)';
		context.lineWidth	 = 1;
		context.strokeStyle = 'rgba(0, 172, 239, 0.8)';
		context.beginPath();
		for (var i = 0, l = o.length; i < l; i++) {
			if (i === 0) {
				context.moveTo(o[i]['x'], o[i]['y']);
			} else {
				context.lineTo(o[i]['x'], o[i]['y']);
			}
		}
		context.closePath();
		context.fill();
		context.stroke();

		// Draw points
		context.fillStyle = 'rgba(0, 139, 191, 0.8)';
		for (var i = 0, l = o.length; i < l; i++) {
			context.fillRect(o[i]['x']- 2, o[i]['y']- 2, 4, 4);
		}
	};
	
	var drawCanvasAll = function() {
		clearCanvas();
		// Draw saved areas
		for (var i = 0, l = areas.length; i < l; i++) {
			drawCanvasPoints(areas[i]);
		}
		// Draw current area
		drawCanvasPoints(points);
	};
	
	var renderInfo = function() {
		var text;
		
		_.clearNode(nodes['info']);
		
		if (!raw_data) {
			nodes['info'].appendChild(_.node('span', '<map>'));
			nodes['info'].appendChild(_.node('br'));
		}
		
		for (var i = 0, l = areas.length; i < l; i++) {
			if (areas[i].length > 0) {
				text = (raw_data) ? '': '<area shape="poly" coords="';
				for (var i2 = 0, l2 = areas[i].length; i2 < l2; i2++) {
					if (i2 > 0) {
						text += ',';
					}
					text += areas[i][i2]['x'] + ',' + areas[i][i2]['y'];
				}
				text += (raw_data) ? '' : '">';
				nodes['info'].appendChild(_.node('span', text));
				nodes['info'].appendChild(_.node('br'));
			}
		}
		
		if (!raw_data) {
			nodes['info'].appendChild(_.node('span', '</map>'));
		}
	};
	
	that.init = function(options) {
		if (options && options.length) {
			nodes = options;
		} else {
			nodes = {
			preview: _.getEl('preview'),
			draw	 : _.getEl('draw'),
			canvas : _.getEl('canvas'),
			points : _.getEl('points'),
			buttons: _.getEl('bar'),
			info	 : _.getEl('info')
			};
		}

	 		checkCanvas();
		clearAllBtn();
		addBtn();
	};
};

window.onload = function() {
	var map_area = new painter;
	map_area.init();
};