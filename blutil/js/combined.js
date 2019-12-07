// ==================== Unit Testing ====================
const enable_tests = false
var test_count = 0, test_passes = 0
function test(f){
    if(enable_tests){
	return f()
    }
}
function getErrorObject(){
    try { throw Error('') } catch(err) { return err; }
}
function check(a, b, f, name, stack_depth = 2){
    var err = getErrorObject()
    var caller_line = err.stack.split("\n")[stack_depth]
    var index = caller_line.indexOf(".js")
    var clean = caller_line.slice(index+4, caller_line.length)
    var result = f(a, b)

    test_count++
    if (result) {test_passes++}

    console.assert(result,
		   "Values not " + name + " on line " + clean,
		   a,
		   b)
}
function checker(f, name){
    return ((a, b) => check(a, b, f, name, 3))
}
var check_equal = checker(_.isEqual, "equal")
var check_lt = checker(_.lt, "<")
var check_gt = checker(_.gt, ">")

test(() => console.log("Testing enabled!"))
test(() =>
     {window.onload =
      (() =>
       {console.log(`Passed ${test_passes}/${test_count} checks.`)})})
function map_keys(hash, f){
    return _.map(_.keys(hash), f)
}
function map_key_values(hash, f){
    return map_keys(hash,
		    (k) => {return f(k, hash[k])})
}
function remove_duplicates(l){
    return _.uniqWith(l, _.isEqual)
}

test(() => {
    var l1 = [1, 2, 3]
    check_equal(remove_duplicates(l1),
		l1)
    var l2 = [1, 1, 2, 3]
    check_equal(remove_duplicates(l2),
		l1)
    var l3 = [1, 2, 3, 2, 1]
    check_equal(remove_duplicates(l3),
		l1)

    var l4 = [{"a": 1, "b": 2}, {"a": 1, "b": 3}]
    check_equal(remove_duplicates(l4),
		l4)
    var l5 = [{"a": 1, "b": 2}, {"a": 1, "b": 3}, {"a": 1, "b": 3}]
    check_equal(remove_duplicates(l5),
		l4)
})

function add_between(l, v){
    const make_v = ((typeof v == "function") ? v : (() => v))
    var result = []
    for(const el of l){
	result.push(el)
	result.push(make_v())
    }
    if (result.length > 0) {
	result.pop() // remove the last one
    }
    return result
}
test(() => {
    var l1 = [1, 2, 3]
    check_equal(add_between(l1, ","), [1, ",", 2, ",", 3])
    check_equal(add_between([], ","), [])
})


class StringMap {
    string_map = null
    constructor(mappings = []){
	this.string_map = new Map()
	for(const [k, v] of mappings){
	    this.set_in_place(k, v)
	}
    }
    copy(){
	var copied = new StringMap()
	for(const [str, [k, v]] of this.string_map) {
	    copied.string_map.set(str, [k, v])
	}
	return copied
    }
    repr(key){
	function replacer(key, value){
	    if (value instanceof Map){
		return Array.from(value.entries())
	    } else if (value instanceof StringMap){
		return Array.from(value.string_map.entries())
	    } else{
		return value
	    }
	}
	// if (key instanceof Map){
	//     return JSON.stringify(Array.from(key.entries()));
	// } else if (key instanceof StringMap){
	//     return JSON.stringify(Array.from(key.string_map.entries()));
	// } else{
	//     return JSON.stringify(key)
	// }
	return JSON.stringify(key, replacer)
    }
    ref(key){
	const str = this.repr(key)
	var [_, v] = this.string_map.get(str)
	return v
    }
    set_in_place(key, value){
	const str = this.repr(key)
	this.string_map.set(str, [key, value])
    }
    set(key, value){
	var updated = this.copy()
	updated.set_in_place(key, value)
	return updated
    }
    keys(){
	var res = []
	for(const [_1, [k, _2]] of this.string_map) {
	    res.push(k)
	}
	return res
    }
    values(){
	var res = []
	for(const [_1, [_2, v]] of this.string_map) {
	    res.push(v)
	}
	return res
    }
    has_key(key){
	const str = this.repr(key)
	return this.string_map.has(str)
    }
}
test(() => {
    const a = {a: 1, b: 2},
	  c = {c: 1, d: 2},
	  d = {d: 1, e: 2}
    const m = new StringMap([[a, "a"], [c, "c"]])
    check_equal(m.ref(a), "a")
    check_equal(m.ref(c), "c")
    check_equal(m.keys(), [a, c])
    check_equal(m.values(), ["a", "c"])

    const m2 = m.set(d, "d")
    check_equal(m.has_key(d), false)
    check_equal(m2.has_key(d), true)
    check_equal(m2.ref(a), "a")
    check_equal(m2.ref(c), "c")
    check_equal(m2.ref(d), "d")
    check_equal(m2.keys(), [a, c, d])


    const mm = new StringMap([[m, m2], ["a", "b"]])
    check_equal(mm.has_key(m), true)
    check_equal(mm.has_key(m2), false)
    check_equal(mm.ref(m), m2)
})
// ==================== SVG Wrappers ====================
class Bounds {
    left = null;
    top = null;
    width = null;
    height = null;
    bottom = null;
    right = null;
    constructor(left, top, width, height){
	this.left = left
	this.top = top
	this.width = width
	this.height = height
	this.bottom = top + height
	this.right = left + width
    }
}
class SVGInfo {
    raw = null;
    bounds = null;
    base = null;
    bounds_adjuster = null;

    current_x_offset = 0;
    current_y_offset = 0;

    constructor(raw, base, bounds, bounds_adjuster = null){
	this.raw = raw
	this.base = base
	this.bounds = bounds
	this.bounds_adjuster = bounds_adjuster
    }
    // -> Bounds
    get current_bounds(){
	return new Bounds(this.bounds.left + this.current_x_offset,
			  this.bounds.top  + this.current_y_offset,
			  this.bounds.width, this.bounds.height)
    }
    // real real -> void
    translate(x_offset, y_offset){
	this.current_x_offset += x_offset
	this.current_y_offset += y_offset
	this.raw.attr("transform",
		      `translate(${this.current_x_offset}, ${this.current_y_offset})`)
    }

    set_bounds(new_bounds){
	if (!_.isNull(this.bounds_adjuster)){
	    this.bounds_adjuster(this.raw, new_bounds)
	    this.bounds = new_bounds
	}
    }
}

var test_svg = test(() => d3.select("#test").append("svg"))
test(() => {
    var raw = test_svg.append("rect")
	.attr("x", 0)
	.attr("y", 30)
	.attr("width", 10)
	.attr("height", 20)
	.attr("fill", "cyan")
	.style("stroke", "rgb(255, 255, 255)")
	.style("stroke-width", 2)
    var info = new SVGInfo(raw, test_svg, new Bounds(0, 30, 10, 20))
    check_equal(info.current_bounds, new Bounds(0, 30, 10, 20))

    info.translate(0, -30)
    check_equal(info.current_bounds, new Bounds(0, 0, 10, 20))
    info.translate(100, 100)
    check_equal(info.current_bounds, new Bounds(100, 100, 10, 20))
})

function rectangle(base,
		   width, height,
		   fill,
		   stroke, stroke_width,
		   pos = {x: 0, y: 0}){
    var _base = base instanceof SVGInfo ? base.raw : base
    var raw = _base.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", width)
	.attr("height", height)
	.attr("fill", fill)
	.style("stroke", stroke)
	.style("stroke-width", stroke_width)
    var info = new SVGInfo(raw, _base, new Bounds(0, 0, width, height))
    info.translate(pos.x, pos.y)
    return info
}

test(() => {
    var r1 = rectangle(test_svg, 20, 30, "blue", "black", 2)
    check_equal(r1.current_bounds, new Bounds(0, 0, 20, 30))

    var r2 = rectangle(test_svg, 20, 30, "blue", "black", 2, {x: 0, y: 50})
    check_equal(r2.current_bounds, new Bounds(0, 50, 20, 30))
})


function label(base, str, pos = {x: 0, y: 0}){
    var _base = base instanceof SVGInfo ? base.raw : base
    var raw = _base.append("text")
	.text(str)
	.attr("x", 0)
	.attr("y", 0)
    var bbox = raw.node().getBBox()
    var bounds = new Bounds(0, 0,
			    bbox.width, bbox.height)
    var info = new SVGInfo(raw, _base,
			   bounds)
    // Somehow text is aligned by bottom left corner
    info.translate(pos.x, pos.y + bbox.height)
    return info
}
function label_maker(str, pos = {x: 0, y: 0}){
    return function(base){return label(base, str, pos)}
}

function container(base, width, height, type = "svg"){
    var _base = base instanceof SVGInfo ? base.raw : base
    var raw = _base.append(type)
	.attr("width", width)
	.attr("height", height)
    function adjust_bounds(raw, new_bounds){
	raw.attr("width", new_bounds.width)
	    .attr("height", new_bounds.height)
    }
    var info = new SVGInfo(raw, _base, new Bounds(0, 0, width, height),
			   adjust_bounds)
    return info
}

function blank(base, width, height){
    var rect = rectangle(base, width, height, "white", "white", 0)
    rect.raw.attr("visibility", "hidden")
    rect.raw.attr("id", "blank")
    return rect
}

function move_to(base, svgs){
    var _base = base instanceof SVGInfo ? base.raw : base
    for(var svg of svgs){
	var svgNode = svg.raw.node()
	var removed = svgNode.parentNode.removeChild(svgNode)
	_base.node().appendChild(removed)
    }
}

function group(base, svgs, bounds){
    var _base = base instanceof SVGInfo ? base.raw : base
    var group_container = container(base, bounds.width, bounds.height)
    move_to(group_container, svgs)
    return group_container
}
// ==================== Pict-like utilities ====================
function align_horizontal_left(svg1, svg2){
    svg2.translate(svg1.current_bounds.left - svg2.current_bounds.left, 0)
}
test(() => {
    var w = 20, w2 = 50, h = 30
    var y = 50
    var r1 = rectangle(test_svg, w, h, "blue", "black", 2)
    var r2 = rectangle(test_svg, w2, h, "blue", "black", 2, {x: 100, y: y})
    var r1_orig_bounds = r1.current_bounds
    align_horizontal_left(r1, r2)
    check_equal(r1.current_bounds, r1_orig_bounds)
    check_equal(r2.current_bounds, new Bounds(0, y, w2, h))
})

function align_vertical_top(svg1, svg2){
    svg2.translate(0, svg1.current_bounds.top - svg2.current_bounds.top)
}
test(() => {
    var w = 20, w2 = 50, h = 30
    var x = 100, y = 50
    var r1 = rectangle(test_svg, w, h, "blue", "black", 2)
    var r2 = rectangle(test_svg, w2, h, "blue", "black", 2, {x: x, y: y})
    var r1_orig_bounds = r1.current_bounds
    align_vertical_top(r1, r2)
    check_equal(r1.current_bounds, r1_orig_bounds)
    check_equal(r2.current_bounds, new Bounds(x, r1_orig_bounds.top, w2, h))
})

function bounds_center(b){
    return {x: b.left + b.width/2,
	    y: b.top + b.height/2}
}
function center(svg){
    return bounds_center(svg.current_bounds)
}
function align_horizontal_center(svg1, svg2){
    align_horizontal_left(svg1, svg2)
    svg2.translate((svg1.bounds.width - svg2.bounds.width)/2, 0)
}
test(() => {
    var w = 20, w2 = 50, h = 30
    var y = 50
    var r1 = rectangle(test_svg, w, h, "blue", "black", 2)
    var r2 = rectangle(test_svg, w2, h, "blue", "black", 2, {x: 100, y: y})

    var r1_orig_bounds = r1.current_bounds
    align_horizontal_center(r1, r2)

    // r1 unchanged
    check_equal(r1.current_bounds, r1_orig_bounds)
    // r2 moved to line up with r1 horizontally
    check_equal(center(r1).x, center(r2).x)
    // r2 unchanged vertically
    check_equal(r2.current_bounds.top, y)
})

function align_vertical_center(svg1, svg2){
    align_vertical_top(svg1, svg2)
    svg2.translate(0, (svg1.bounds.height - svg2.bounds.height)/2)
}
test(() => {
    var w = 20, w2 = 50, h = 30, h2 = 50
    var x = 100, y = 50
    var r1 = rectangle(test_svg, w, h, "blue", "black", 2)
    var r2 = rectangle(test_svg, w2, h2, "blue", "black", 2, {x: x, y: y})

    var r1_orig_bounds = r1.current_bounds
    align_vertical_center(r1, r2)

    // r1 unchanged
    check_equal(r1.current_bounds, r1_orig_bounds)
    // r2 moved to line up with r1 vertically
    check_equal(center(r1).y, center(r2).y)
    // r2 unchanged horizontally
    check_equal(r2.current_bounds.left, x)
})


function _align(svgs, init_acc, f){
    var root = svgs[0]
    var root_bounds = root.current_bounds

    var top_most = root_bounds.top
    var left_most = root_bounds.left
    var right_most = root_bounds.right
    var bottom_most = root_bounds.bottom

    var acc = init_acc(root)
    for(var svg of svgs.slice(1)){
	acc = f(root, svg, acc)

	var bounds = svg.current_bounds
	var top = bounds.top
	var left = bounds.left
	var right = bounds.left + bounds.width
	var bottom = bounds.bottom
	top_most = (top < top_most) ? top : top_most
	left_most = (left < left_most) ? left : left_most
	right_most = (right > right_most) ? right : right_most
	bottom_most = (bottom > bottom_most) ? bottom : bottom_most
    }

    var width = right_most - left_most
    var height = bottom_most - top_most
    return new Bounds(left_most, top_most, width, height)
}

function v_appender(align_horizontal){
    return function (...svgs){
	return _align(svgs,
		      (root) => {
			  return root.current_bounds.bottom
		      },
		      (root, svg, bottom_so_far) => {
			  align_horizontal(root, svg)
			  svg.translate(0, bottom_so_far - svg.current_bounds.top)
			  return svg.current_bounds.bottom
		      })
    }
}
var vc_append = v_appender(align_horizontal_center)
var vl_append = v_appender(align_horizontal_left)
var vr_append = v_appender((svg1, svg2) => {
    align_horizontal_left(svg1, svg2)
    svg2.translate(svg1.current_bounds.width, 0)
})
test(() => {
    var w = 20, w2 = 50, h = 30, h2 = 50, y_pos = 50
    var r1 = rectangle(test_svg, w, h, "blue", "black", 2)
    var r2 = rectangle(test_svg, w2, h, "blue", "black", 2, {x: 100, y: y_pos})
    var r3 = rectangle(test_svg, w2, h2, "blue", "black", 2, {x: 10, y: y_pos+20})

    var r1_orig_bounds = r1.current_bounds
    var total_bounds = vc_append(r1, r2, r3)

    check_equal(r1.current_bounds, r1_orig_bounds)
    check_equal(center(r1).x, center(r2).x)
    check_equal(center(r2).x, center(r3).x)
    check_equal(r1.current_bounds.bottom, r2.current_bounds.top)
    check_equal(r2.current_bounds.bottom, r3.current_bounds.top)

    check_equal(total_bounds,
		new Bounds(r1_orig_bounds.left - (w2 - w)/2,
			   r1_orig_bounds.top,
			   w2,
			   h*2+h2))
})

function cc_align(...svgs){
    return _align(svgs,
		  (_) => {},
		  (root, svg, _) => {
	align_horizontal_center(root, svg)
	align_vertical_center(root, svg)
    })
}
test(() => {
    var w = 20, w2 = 50, h = 30, h2 = 50, y_pos = 50
    var r1 = rectangle(test_svg, w, h, "blue", "black", 2)
    var r2 = rectangle(test_svg, w2, h, "blue", "black", 2, {x: 100, y: y_pos})
    var r3 = rectangle(test_svg, w2, h2, "blue", "black", 2, {x: 10, y: y_pos+20})

    var r1_orig_bounds = r1.current_bounds
    var total_bounds = cc_align(r1, r2, r3)

    check_equal(r1.current_bounds, r1_orig_bounds)
    check_equal(center(r1), center(r2))
    check_equal(center(r2), center(r3))

    check_equal(total_bounds,
		new Bounds(r1_orig_bounds.left - (w2 - w)/2,
			   r1_orig_bounds.top - (h2 - h)/2,
			   w2,
			   h2))
})

function h_appender(align_vertical){
    return function (...svgs){
	return _align(svgs,
		      (root) => {return root.current_bounds.right},
		      (root, svg, right_most) => {
			  align_vertical(root, svg)

			  align_horizontal_left(root, svg)
			  svg.translate(right_most, 0)
			  return svg.current_bounds.right
		      })
    }
}
var hc_append = h_appender(align_vertical_center)
var ht_append = h_appender(align_vertical_top)
var hb_append = h_appender((svg1, svg2) => {
    align_vertical_top(svg1, svg2)
    svg2.translate(0, svg1.current_bounds.height)
})
test(() => {
    var w = 20, w2 = 50, h = 30, h2 = 50, y_pos = 50
    var r1 = rectangle(test_svg, w, h, "blue", "black", 2)
    var r2 = rectangle(test_svg, w2, h, "blue", "black", 2, {x: 100, y: y_pos})
    var r3 = rectangle(test_svg, w2, h2, "blue", "black", 2, {x: 10, y: y_pos+20})

    var r1_orig_bounds = r1.current_bounds
    var total_bounds = hc_append(r1, r2, r3)

    check_equal(r1.current_bounds, r1_orig_bounds)
    check_equal(center(r1).y, center(r2).y)
    check_equal(center(r2).y, center(r3).y)
    check_equal(r1.current_bounds.right, r2.current_bounds.left)
    check_equal(r2.current_bounds.right, r3.current_bounds.left)

    check_equal(total_bounds,
		new Bounds(r1_orig_bounds.left,
			   r1_orig_bounds.top - (h2 - h)/2,
			   w+2*w2,
			   h2))
})

function ghost(base, bounds){
    var g = blank(base, bounds.width, bounds.height)
    g.raw.attr("id", "ghost")
    g.translate(bounds.left, bounds.top)
    return g
}
// ===== Simple and dumb lattice interaction implementation =====
function config(primes_level, sift_level, sieve_level){
    return new StringMap([
	["primes", primes_level],
	["sift", sift_level],
	["sieve", sieve_level]
    ])
}

// The lattice is an opaque image, so this hack is the easiest way to align
// things.
//
// A more robust alternative would be to read the SVG as XML and determine the
// locations and bounding information using the color information in
// `../figure-gen/colors.rkt` as the key to link the config SVGs (as color
// triples) to their representation as mappings from component to contract
// level.
// No time for that, though! ¯\_(ツ)_/¯
const y0 = "92.5%",
      y1 = "78%",
      y2 = "63.65%",
      y3 = "49.3%",
      y4 = "35%",
      y5 = "20.8%",
      y6 = "6.5%"
const config_positions = new StringMap([
    [config("none", "none", "none"), {x: "45%", y: y0}],

    [config("primes-types", "none", "none"), {x: "32%", y: y1}],
    [config("none", "sift-types", "none"), {x: "45%", y: y1}],
    [config("none", "none", "sieve-types"), {x: "58.1%", y: y1}],

    [config("primes-types", "sift-types", "none"), {x: "12.5%", y: y2}],
    [config("none", "sift-max", "none"), {x: "25.55%", y: y2}],
    [config("none", "sift-types", "sieve-types"), {x: "38.5%", y: y2}],
    [config("primes-types", "none", "sieve-types"), {x: "51.5%", y: y2}],
    [config("none", "none", "sieve-max"), {x: "64.3%", y: y2}],
    [config("primes-max", "none", "none"), {x: "77.5%", y: y2}],

    [config("primes-types", "sift-types", "sieve-types"), {x: "6%", y: y3}],
    [config("none", "sift-max", "sieve-types"), {x: "19%", y: y3}],
    [config("none", "sift-types", "sieve-max"), {x: "32%", y: y3}],
    [config("primes-types", "sift-max", "none"), {x: "45%", y: y3}],
    [config("primes-max", "sift-types", "none"), {x: "58%", y: y3}],
    [config("primes-max", "none", "sieve-types"), {x: "71%", y: y3}],
    [config("primes-types", "none", "sieve-max"), {x: "84%", y: y3}],

    [config("primes-max", "sift-max", "none"), {x: "12.5%", y: y4}],
    [config("primes-max", "sift-types", "sieve-types"), {x: "25.5%", y: y4}],
    [config("primes-types", "sift-types", "sieve-max"), {x: "38.5%", y: y4}],
    [config("none", "sift-max", "sieve-max"), {x: "51.5%", y: y4}],
    [config("primes-types", "sift-max", "sieve-types"), {x: "64.5%", y: y4}],
    [config("primes-max", "none", "sieve-max"), {x: "77.4%", y: y4}],

    [config("primes-max", "sift-types", "sieve-max"), {x: "32.1%", y: y5}],
    [config("primes-max", "sift-max", "sieve-types"), {x: "45%", y: y5}],
    [config("primes-types", "sift-max", "sieve-max"), {x: "58%", y: y5}],

    [config("primes-max", "sift-max", "sieve-max"), {x: "45%", y: y6}],
])
const config_height = 38
function config_size(config){
    return {width: 50, height: config_height}

    // ===== Dead code for sizing with textual configs =====

    // if (config.ref("primes").endsWith("types")) {
    // 	return {width: 70, height: config_height}
    // } else if (   config.ref("primes").endsWith("max")
    // 	       || config.ref("sieve") .endsWith("types")) {
    // 	return {width: 67, height: config_height}
    // } else if (config.ref("sieve").endsWith("max")) {
    // 	return {width: 63, height: config_height}
    // } else if (config.ref("sift").endsWith("types")) {
    // 	return {width: 61, height: config_height}
    // } else if (config.ref("sift").endsWith("max")) {
    // 	return {width: 58, height: config_height}
    // } else {
    // 	return {width: 50, height: config_height}
    // }
}

var current_highlight = null
function highlight_config_in_lattice(base, config,
				     replace = true,
				     color = "red"){
    if (replace && current_highlight !== null) {
	remove_config_highlight(current_highlight)
    }
    const size = config_size(config)
    const pos = config_positions.ref(config)
    let rect = rectangle(base,
			 size.width, size.height,
			 "none",
			 color,
			 2)
    rect.raw.attr("x", pos.x)
	.attr("y", pos.y)
    if (replace) {
	current_highlight = rect
    }
    return rect
}
function remove_config_highlight(h){
    h.raw.remove()
}


function config_to_string(config){
    c = {}
    for(const id of ["primes", "sift", "sieve"]){
	c[id] = config.ref(id)
    }
    return JSON.stringify(c, null, 4)
}


var lattice_svg = d3.select("#lattice svg")
var current_selection = []
function select_config(config){
    for(let circle of current_selection){
	circle.attr("fill", "white")
    }
    current_selection = []
    for(const id of config.keys()){
	var id_circle = d3.select("#" + id).select("#" + config.ref(id))
	    .select("circle")
	id_circle.attr("fill", "red")
	current_selection.push(id_circle)
    }

    show_run_result(config)

    console.log("selected:", config_to_string(config))
    extend_current_trail(config)

    // Highlight current config last in case it's a repeat of one in the trail
    // (so the red shows over the orange)
    highlight_config_in_lattice(lattice_svg, config)
}

var current_config = config("none", "none", "none")
function select_level(id, level){
    current_config = current_config.set(id, level)
    select_config(current_config)
}
function get_current_config(){
    return current_config
}



var result_div = d3.select("#run-result")
var blame_primes = {elt: d3.select("#run-result").select("#blame-primes"), id: "primes"}
blame_primes.elt.remove()
var blame_sift = {elt: d3.select("#run-result").select("#blame-sift"), id: "sift"}
blame_sift.elt.remove()
var blame_sieve = {elt: d3.select("#run-result").select("#blame-sieve"), id: "sieve"}
blame_sieve.elt.remove()

const config_blames = new StringMap([
    [config("none", "none", "none"), blame_primes],

    [config("primes-types", "none", "none"), blame_primes],
    [config("none", "sift-types", "none"), blame_primes],
    [config("none", "none", "sieve-types"), blame_primes],

    [config("primes-max", "none", "none"), blame_sieve],
    [config("primes-types", "sift-types", "none"), blame_primes],
    [config("primes-types", "none", "sieve-types"), blame_primes],
    [config("none", "sift-max", "none"), blame_sift],
    [config("none", "sift-types", "sieve-types"), blame_primes],
    [config("none", "none", "sieve-max"), blame_sift],

    [config("primes-types", "sift-max", "none"), blame_sift],
    [config("none", "sift-max", "sieve-types"), blame_sift],
    [config("primes-types", "none", "sieve-max"), blame_sift],
    [config("none", "sift-types", "sieve-max"), blame_sift],
    [config("primes-types", "sift-types", "sieve-types"), blame_primes],
    [config("primes-max", "sift-types", "none"), blame_sieve],
    [config("primes-max", "none", "sieve-types"), blame_sieve],

    [config("primes-max", "none", "sieve-max"), blame_sift],
    [config("primes-types", "sift-types", "sieve-max"), blame_sift],
    [config("primes-max", "sift-max", "none"), blame_sift],
    [config("primes-max", "sift-types", "sieve-types"), blame_sieve],
    [config("primes-types", "sift-max", "sieve-types"), blame_sift],
    [config("none", "sift-max", "sieve-max"), blame_sift],

    [config("primes-max", "sift-max", "sieve-types"), blame_sift],
    [config("primes-types", "sift-max", "sieve-max"), blame_sift],
    [config("primes-max", "sift-types", "sieve-max"), blame_sift],

    [config("primes-max", "sift-max", "sieve-max"), blame_sift],
])

var current_blame = blame_primes
function show_run_result(config){
    current_blame.elt.remove()
    var new_blame = config_blames.ref(config)
    var new_blame_node = new_blame.elt.node()
    result_div.node().appendChild(new_blame_node)
    current_blame = new_blame
}



var current_trail = []
function extend_current_trail(config){
    if (current_trail.length === 0
	|| !_.isEqual(current_trail[current_trail.length - 1], config)){
	current_trail.push(config)
	show_current_trail_stats()
	highlight_trail_history(current_trail)
    }
}
function reset_trail_tracking(){
    current_trail = []
    show_current_trail_stats()

    remove_current_trail_history_highlighting()
}
var stats_div = d3.select("#lattice").select("#trail-stats")
function show_current_trail_stats(){
    stats_div.html("")
    const is_valid = is_valid_trail(current_trail)
    const current_config = get_current_config()
    const blamed = config_blames.ref(current_config)
    const satisfies_blame_trail = ((blamed.id === blame_sift.id)
				 && current_config.ref("sift") === "sift-max")
    var c = container(stats_div, 250, 70)
    var l1 = label(c, `Trail length: ${current_trail.length}`)
    var l2 = label(c, `Valid trail: ${is_valid}`)
    l2.raw.attr("style", `fill:${is_valid ? "green" : "red"}`)
    var l3 = label(c, `Satisfies Blame Trail: ${satisfies_blame_trail}`)
    l3.raw.attr("style", `fill:${satisfies_blame_trail ? "green" : "red"}`)
    vl_append(l1, l2, l3)
}

function is_valid_trail(config_list){
    if (config_list.length < 2){
	return true
    } else {
	const current_config = config_list[0]
	const next_config = config_list[1]

	function ctc_level_changed(id){
	    return (current_config.ref(id) !== next_config.ref(id))
	}

	function ctc_level_incremented(id){
	    const current_level = current_config.ref(id)
	    const next_level = next_config.ref(id)
	    if (current_level.endsWith("none")){
		return next_level.endsWith("types")
	    } else if (current_level.endsWith("types")){
		return next_level.endsWith("max")
	    } else {
		return false
	    }
	}

	const blamed_id = config_blames.ref(current_config).id
	const not_blamed_ids = _.filter(["primes", "sift", "sieve"],
					(id) => (id !== blamed_id))

	if (!ctc_level_changed(blamed_id) || !ctc_level_incremented(blamed_id)){
	    console.log(`blamed_id ${blamed_id} didn't change (to the right) level!`)
	    return false
	}
	for(const other_id of not_blamed_ids){
	    if (ctc_level_changed(other_id)){
		console.log(`other_id ${other_id} changed level!`)
		return false
	    }
	}
	const remaining_configs = config_list.slice(1)
	return is_valid_trail(remaining_configs)
    }
}


var current_trail_highlights = []
function highlight_trail_history(trail){
    if (trail.length < 2) {
	return
    }

    remove_current_trail_history_highlighting()
    for(const config of trail.slice(0, -1)){
	const highlight = highlight_config_in_lattice(lattice_svg,
						      config,
						      false,
						      "orange")
	current_trail_highlights.push(highlight)
    }
}

function remove_current_trail_history_highlighting(){
    for(let highlight of current_trail_highlights){
	remove_config_highlight(highlight)
    }
    current_trail_highlights = []
}

// var h1 = highlight_config_in_lattice(lattice_svg, config("primes-max", "sift-max", "sieve-max"))
// remove_config_highlight(h1)
// var h2 = highlight_config_in_lattice(lattice_svg, config("none", "sift-max", "sieve-max"))

// var s = d3.select("#sift").select("#none").select("circle")
// console.log(s)
// s.attr("fill", "red")


reset_trail_tracking()
select_config(current_config)



// select_config(config("none", "sift-max", "sieve-types"))


// const scale = 22
// var hello_svg = d3.select("#hello-world svg")
// hello_svg.append("circle")
//     .attr("cx", 20)
//     .attr("cy", 50)
//     .attr("r", 10)
//     .attr("fill", "black")
// hello_svg.append("circle")
//     .attr("cx", 50)
//     .attr("cy", 20)
//     .attr("r", 10)
//     .attr("fill", "black")
// hello_svg.append("line")
//     .attr("x1", function(d){return 20})
//     .attr("y1", function(d){return 50})
//     .attr("x2", function(d){return 50})
//     .attr("y2", function(d){return 20})
//     // .attr("style", "stroke:rgb(255,0,0);stroke-width:2");
//     .style("stroke", "rgb(255,0,0)")
//     .style("stroke-width", 2)
// var text = hello_svg.append("text")
//     .text("Hello world!")
//     .attr("x", 100)
//     .attr("y", 100)
//     .on("click", onClick)
//     // .call(d3.click().on('click', onClick))

// function onClick(){
//     console.log("Clicked!")
//     text.attr("x", +text.attr("x") + 20)
// }

// var lattice_svg = d3.select("#lattice svg")
// lattice_svg.append("image")
//     .attr("href", "./lattice.svg")
//     .attr("x", 0)
//     .attr("y", 0)
//     .attr("width", "100%")
//     .attr("height", "100%")


// var l1 = label_maker("foo")(hello_svg)
// console.log(l1.current_bounds)
// console.log("---")
// l1.translate(100, 0)
// console.log(l1.current_bounds)
// var l2 = label_maker("bar")(hello_svg)
// l2.translate(0, 20)
// var l3 = label_maker("bamboozle!")(hello_svg)
// l3.translate(0, 40)
// l3.translate(200, 0)
// console.log(l1.current_bounds)
// console.log(l2.current_bounds)
// console.log(l3.current_bounds)
// vc_align(l1, l2, l3)
// console.log(l1.current_bounds)
// console.log(l2.current_bounds)
// console.log(l3.current_bounds)
// var texts = vc_append(hello_svg, [label_maker("foo"),
// 				  label_maker("bar"),
// 				  label_maker("bamboozle!")])


// var some_g = hello_svg.append("g")

// var config_1 = configuration_svg(hello_svg, {"a": "max", "b": "types", "c": "none"})
// config_1.translate(100, 20)
// var config_2 = configuration_svg(hello_svg, {"a": "max", "b": "max", "c": "none"})
// var config_3 = configuration_svg(hello_svg, {"a": "max", "b": "max", "c": "none"})

// // config_2.translate(300, 20)
// // config_3.translate(200, 200)
// var bounds = hc_append(config_1, blank(hello_svg, -150, 1), config_2)
// vc_append(ghost(hello_svg, bounds), blank(hello_svg, 1, 50), config_3)


// // lltodo: have an hc_align, and an hc_append
// // hc_align does what append does now: just translates the images
// // hc_append translates the images then moves them onto a new sub-svg

// configuration_link_svg(hello_svg, config_3.current_bounds, config_2.current_bounds)
// configuration_link_svg(hello_svg, config_3.current_bounds, config_1.current_bounds)


// move_to(some_g, [config_1])
// some_g.attr("transform", "translate(0, 200)")

// var v1 = hello_svg.append("circle").attr("r", 5).attr("fill", "red").attr("cx", 5).attr("cy", 5)
// var make_v2 = function(base) {return base.append("circle").attr("r", 2.5).attr("fill", "green").attr("cx", 0).attr("cy", 0)}

// cc_superimpose(hello_svg, v1, make_v2)


/*
var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = +400- margin.left - margin.right,
    height = +400 - margin.top - margin.bottom

var svg = d3.select("svg")
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add your code here
var dataset = [[5, 20], [480, 90], [250, 50], [100, 33], [330, 95], [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]];


var scale = d3.scaleLinear()
    .domain([100, 500])
    .range([10, 350]);

function make_accessor(index){
    return function(pair){return pair[index];}
}
var first = make_accessor(0);
var second = make_accessor(1);

var x_max = d3.max(dataset, first);
var y_max = d3.max(dataset, second);
var x_min = d3.min(dataset, first);
var y_min = d3.min(dataset, second);

var scale_offset = 5;

// Determine the ratio of each dimension (x and y) against the larger of the two
var scales_multiplier = (x_max > y_max) ? [1, y_max/x_max] : [x_max/y_max, 1];
var x_ratio = scales_multiplier[0]
var y_ratio = scales_multiplier[1]

var xScale = d3.scaleLinear()
    .domain([0, x_max])
    .range([0, 400*x_ratio]); // Use the ratio of x to the larger dimension to scale x within 400

var yScale = d3.scaleLinear()
    .domain([0, y_max])
    .range([400*y_ratio, 0]); // Use the ratio of y to the larger dimension to scale y within 400

var position_x = function(d) { return xScale(d[0]); }
var position_y = function(d) { return yScale(d[1]); }

svg.selectAll("circle")
    .data(dataset)
    .enter().append("circle")
    .attr("cx", position_x)
    .attr("cy", position_y)
    .attr("r", 5);

var xAxis = d3.axisBottom().scale(xScale);
svg.append("g").call(xAxis)
    .attr("transform", "translate(0," + (y_max) + ")");
var yAxis = d3.axisLeft().scale(yScale);
svg.append("g").call(yAxis)
    .attr("transform", "translate(0,"+ scale_offset + ")");

// reset everything to color=black, radius=3
circles = svg.selectAll("circle")
    .data(dataset)
    .attr("fill","black")
    .attr("r",3);

// transition to magenta with a radius of 6 over 1 seconds
transition1 = circles.transition()
    .duration(1000)
    .attr("fill","magenta")
    .attr("r", 6)
    .attr("cx", function(){return position_x([Math.random()*x_max, 0])})
    .attr("cy", function(){return position_y([0, Math.random()*y_max])});
// transition to black with a radius of 3 after a delay of 1 seconds
transition2 = transition1.transition()
    .delay(1000)
    .duration(3000) // last step takes 3s
    .attr("fill", "black")
    .attr("r", 3);
*/
