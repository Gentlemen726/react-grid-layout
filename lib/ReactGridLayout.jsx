'use strict';
var React = require('react/addons');
var GridItem = require('./GridItem');
var utils = require('./utils');
var PureDeepRenderMixin = require('./PureDeepRenderMixin');

/**
 * A reactive, fluid, responsive grid layout with draggable, resizable components.
 */
var ReactGridLayout = module.exports = React.createClass({
  displayName: 'ReactGridLayout',
  mixins: [PureDeepRenderMixin],

  propTypes: {
    // If true, the container height swells and contracts to fit contents
    autoSize: React.PropTypes.bool,
    // {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
    breakpoints: React.PropTypes.object,
    // # of cols. Can be specified as a single number, or a breakpoint -> cols map
    cols: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.number
    ]),
    // A selector for the draggable handler
    handle: React.PropTypes.string,
    // Layout is an array of object with the format:
    // {x: Number, y: Number, w: Number, h: Number}
    initialLayout: function(props, propName, componentName) {
      var layout = props.initialLayout;
      var subProps = ['x', 'y', 'w', 'h'];
      if (!Array.isArray(layout)) throw new Error("InitialLayout must be an array!");
      for (var i = 0, len = layout.length; i < len; i++) {
        for (var j = 0; j < subProps.length; j++) {
          if (typeof layout[i][subProps[j]] !== 'number') {
            throw new Error('ReactGridLayout: initialLayout[' + i + '].' + subProps[j] + ' must be a Number!');
          }
        }
      }
    },
    // This allows setting this on the server side
    initialWidth: React.PropTypes.number,
    // margin between items [x, y] in px
    margin: React.PropTypes.array,
    // Rows have a static height, but you can change this based on breakpoints if you like
    rowHeight: React.PropTypes.number,

    // Flags
    isDraggable: React.PropTypes.bool,
    isResizable: React.PropTypes.bool,

    // Callback so you can save the layout
    onLayoutChange: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      autoSize: true,
      breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
      cols: 10, 
      rowHeight: 150,
      initialWidth: 1280,
      margin: [10, 10],
      isDraggable: true,
      isResizable: true,
      onLayoutChange: function(){}
    };
  },

  getInitialState() {
    var breakpoint = this.getBreakpointFromWidth(this.props.initialWidth);
    return {
      layout: this.generateLayout(this.props.initialLayout, breakpoint),
      // storage for layouts obsoleted by breakpoints
      layouts: {},
      breakpoint: breakpoint,
      cols: this.getColsFromBreakpoint(breakpoint),
      width: this.props.initialWidth,
      activeDrag: null
    };
  },

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  },

  componentDidUpdate(prevProps, prevState) {
    // Call back so we can store the layout
    if (this.state.layout !== prevState.layout) {
      this.props.onLayoutChange(this.state.layout);
    }
  },

  /**
   * Calculates a pixel value for the container.
   * @return {String} Container height in pixels.
   */
  containerHeight() {
    if (!this.props.autoSize) return;
    var layout = this.state.layout;
    // Calculate container height by finding bottom-most element
    var max = 0, bottom;
    for (var i = 0, len = layout.length; i < len; i++) {
      bottom = layout[i].y + layout[i].h;
      if (bottom > max) max = bottom;
    }
    return max * this.props.rowHeight + this.props.margin[1] + 'px';
  },


  /**
   * Generate a layout using the initialLayout as a template.
   * Missing entries will be added, extraneous ones will be truncated.
   * @param  {Array} initialLayout Layout passed in through props.
   * @param  {String} breakpoint   Current responsive breakpoint.
   * @return {Array}               Working layout.
   */
  generateLayout(initialLayout, breakpoint) {
    var layout = [].concat(initialLayout || []);
    layout = layout.map(function(l, i) {
      l.i = i;
      return l;
    });
    if (layout.length !== this.props.children.length) {
      // Fill in the blanks
    }
    
    layout = utils.correctBounds(layout, {cols: this.getColsFromBreakpoint(breakpoint)});
    return utils.compact(layout);
  },

  /**
   * Given a width, find the highest breakpoint that matches is valid for it (width > breakpoint).
   * @param  {Number} width Screen width.
   * @return {String}       Highest breakpoint that is less than width.
   */
  getBreakpointFromWidth(width) {
    var breakpoints = this.props.breakpoints;
    var keys = Object.keys(breakpoints);
    var values = keys.map(function(k) { return breakpoints[k]; });

    var match = []; // key, width
    for (var i = 0; i < values.length; i++) {
      if (width > values[i] && (!match[1] || values[i] > match[1])) {
        match = [keys[i], values[i]];
      }
    }
    return match[0];
  },

  getColsFromBreakpoint(breakpoint) {
    var cols = this.props.cols;
    if (typeof cols === "number") return cols;
    if (!cols[breakpoint]) {
      throw new Error("ReactGridLayout: `cols` entry for breakpoint " + breakpoint + " is missing!");
    }
    return cols[breakpoint];
  },

  /**
   * On window resize, work through breakpoints and reset state with the new width & breakpoint.
   */
  onWindowResize() {
    // Set breakpoint
    var newState = {
      width: this.getDOMNode().offsetWidth
    };
    newState.breakpoint = this.getBreakpointFromWidth(newState.width);
    newState.cols = this.getColsFromBreakpoint(newState.breakpoint);
    
    if (newState.cols !== this.state.cols) {
      // Store the current layout
      newState.layouts = this.state.layouts;
      newState.layouts[this.state.breakpoint] = JSON.parse(JSON.stringify(this.state.layout));

      // Find or generate the next layout
      newState.layout = this.state.layouts[newState.breakpoint];
      if (!newState.layout) {
        newState.layout = utils.compact(utils.correctBounds(this.state.layout, {cols: newState.cols}));
      }
    }
    this.setState(newState);
  },

  onDragStart(i, e, {element, position}) {
    // nothing
  },

  onDrag(i, x, y) {
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Create drag element (display only)
    var activeDrag = {
      w: l.w, h: l.h, x: l.x, y: l.y, placeholder: true, i: i
    };
    
    // Move the element to the dragged location.
    layout = utils.moveElement(layout, l, x, y);

    this.setState({
      layout: utils.compact(layout),
      activeDrag: activeDrag
    });
  },

  /**
   * When dragging stops, figure out which position the element is closest to and update its x and y.
   * @param  {Number} i Index of the child.
   * @param  {Event}  e DOM Event.
   */
  onDragStop(i, x, y) {
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Move the element here
    layout = utils.moveElement(layout, l, x, y);
    // Set state
    this.setState({layout: utils.compact(layout), activeDrag: null});
  },

  onResize(i, w, h) {
    var layout = this.state.layout;
    var l = utils.getLayoutItem(layout, i);

    // Create drag element (display only)
    var activeDrag = {
      w: w, h: h, x: l.x, y: l.y, placeholder: true, i: i
    };
    l.w = w;
    l.h = h;
    
    // Move the element to the dragged location.
    // layout = utils.moveElement(layout, l, x, y);
    this.setState({layout: utils.compact(layout), activeDrag: activeDrag});
  },

  onResizeStop(e, {element, position}) {
    this.setState({activeDrag: null});
  },

  /**
   * Create a placeholder object.
   * @return {Element} Placeholder div.
   */
  placeholder() {
    if (!this.state.activeDrag) return '';

    // {...this.state.activeDrag} is pretty slow, actually
    return (
      <GridItem
        w={this.state.activeDrag.w}
        h={this.state.activeDrag.h}
        x={this.state.activeDrag.x}
        y={this.state.activeDrag.y}
        i={this.state.activeDrag.i}
        placeholder={true}
        className="react-grid-placeholder"
        containerWidth={this.state.width}
        cols={this.state.cols}
        margin={this.props.margin}
        rowHeight={this.props.rowHeight}
        isDraggable={false}
        isResizable={false}
        >
        <div />
      </GridItem>
    );
  },

  /**
   * Given a grid item, set its style attributes & surround in a <Draggable>.
   * @param  {Element} child React element.
   * @param  {Number}  i     Index of element.
   * @return {Element}       Element wrapped in draggable and properly placed.
   */
  processGridItem(child, i) {
    var l = utils.getLayoutItem(this.state.layout, i);

    // watchStart property tells Draggable to react to changes in the start param
    // Must be turned off on the item we're dragging as the changes in `activeDrag` cause rerenders
    var drag = this.state.activeDrag;
    var moveOnStartChange = drag && drag.i === i ? false : true;
    return (
      <GridItem 
        w={l.w}
        h={l.h}
        x={l.x}
        y={l.y}
        i={l.i}
        containerWidth={this.state.width}
        cols={this.state.cols}
        margin={this.props.margin}
        rowHeight={this.props.rowHeight}
        moveOnStartChange={moveOnStartChange}
        handle={this.props.handle}
        onDragStop={this.onDragStop}
        onDragStart={this.onDragStart}
        onDrag={this.onDrag}
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        isDraggable={this.props.isDraggable}
        isResizable={this.props.isResizable}
        >
        {child}
      </GridItem>
    );
  },

  render() {
    // Calculate classname
    var {className, initialLayout, ...props} = this.props;
    className = 'react-grid-layout ' + (className || '') + ' ' + this.state.className;

    return (
      <div {...props} className={className} style={{height: this.containerHeight()}}>
        {React.Children.map(this.props.children, this.processGridItem)}
        {this.placeholder()}
      </div>
    );
  }
});

