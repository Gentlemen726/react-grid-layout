'use strict';

module.exports = [
  {
    title: 'Showcase',
    source: 'showcase',
    paragraphs: [
      'Try dragging the elements around.',
      'React-Grid-Layout is the only grid layout system for React. It features auto-packing, resizable widgets, ' +
        'a fluid layout, and separate layouts per responsive breakpoint.',
      'Resize the window to try it out!'
    ]
  },
  {
    title: 'Basic',
    source: 'basic',
    paragraphs: [
      'Try dragging the elements around.',
      'This is a basic, non-responsive layout with dragging and resizing. Usage is very simple.'
    ]
  },
  {
    title: 'No Dragging',
    source: 'no-dragging',
    paragraphs: [
      'This particular example has dragging and resizing turned off.'
    ]
  },
  {
    title: 'Messy',
    source: 'messy',
    paragraphs: [
      'This demo shows what happens when elements are placed randomly all over the layout.',
      'RGL does not auto-pack in the same fashion as other projects, such as jQuery Masonry. Packing is only done ' + 
        'in the vertical dimension. If objects all have the same width, they will be packed efficiently.',
      'If a layout is fed to RGL that has items with incorrect dimensions (width too big, overlapping other elements, ' +
        'out of bounds, etc), they will be automatically corrected on startup. See the ' + 
        'source of this demo, where elements are placed randomly in the layout.'
    ]
  },
  {
    title: 'Grid Item Properties',
    source: 'grid-property',
    paragraphs: [
      'This demo uses a layout assigned on the grid items themselves as the <code>_grid</code> property.',
    ]
  },
  {
    title: 'Static Elements',
    source: 'static-elements',
    paragraphs: [
      'This demo sets an item to <code>static</code>. Static elements cannot be moved or resized. Other elements ' +
        'move themselves around a static element.'
    ]
  },
  {
    title: 'Dynamic Add/Remove',
    source: 'dynamic-add-remove',
    paragraphs: [
      'This demo shows what happens when items are dynamically added and removed.',
      'You can remove an item by clicking its "x", and add a new one with the button.'
    ]
  },
  {
    title: 'LocalStorage',
    source: 'localstorage',
    paragraphs: [
      'This simple demo synchronizes to localStorage.',
      'Try moving and resizing elements, then reloading.'
    ]
  },
  {
    title: 'Responsive with LocalStorage',
    source: 'localstorage-responsive',
    paragraphs: [
      'This simple demo synchronizes to localStorage for each responsive breakpoint.',
      'Try moving and resizing elements, changing window width, moving some more, and refreshing.',
      'Each breakpoint has a separate layout. The <code>onLayoutChange</code> callback calls back with ' +
        'a hash of breakpoints to layouts, which is then synchronized to localStorage.'
    ]
  },
];
