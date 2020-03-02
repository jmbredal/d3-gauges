import * as d3 from 'd3';
import { axisRadialInner } from 'd3-radial-axis';

export default class RoundGauge {
  constructor(elementId, config = {}) {
    this.defaultConfig = {
      minValue: 900,
      maxValue: 1100,
      startValue: 1000,
      valueSpacing: 20,
      tickStep: 5,
      unit: '',
      scaleType: '',
      centerX: 100,
      centerY: 100,
      startAngle: -(Math.PI * 2 * (120 / 360)),
      endAngle: Math.PI * 2 * (120 / 360),
      transitionDuration: 1500,
    };

    this.config = {
      ...this.defaultConfig,
      ...this.getDefaultConfig(),
      ...config
    };

    this.elementId = elementId;
    this.createLayout();
  }

  getDefaultConfig() {
    return this.defaultConfig;
  }

  createLayout() {
    this.createBaseLayout();
    this.createBasicLayout();
  }

  createBaseLayout() {
    this.svg = d3.select(this.elementId).append('svg')
      .attr('viewBox', '0 0 200 200')
      .attr('font-family', 'sans-serif');
    this.outline = this.createOutline(this.svg, this.config);
    this.scale = d3.scaleLinear()
      .range([-120, 120])
      .domain([this.config.minValue, this.config.maxValue]);
    createRadialAxis(this.svg, this.config);
  }

  // Create basic layout with a hand and numbers
  createBasicLayout() {
    this.valueText = createValueTexts(this.svg, this.config, this.scale);
    this.hand = createBigHand(this.svg, this.config, this.scale);
    createCenterButton(this.svg, this.config);
  }

  // Animate the gauge with new value
  update(v) {
    this.hand.transition()
      .duration(this.config.transitionDuration)
      .attrTween('transform', rotateTween(this.scale(v)));
    this.valueText.transition()
      .duration(this.config.transitionDuration)
      .textTween(customTextTween(v));
  }

  getRandomValue() {
    const diff = this.config.maxValue - this.config.minValue;
    return parseInt((Math.random() * diff) + this.config.minValue);
  }

  test() {
    this.update(this.getRandomValue());
  }

  demo() {
    this.test();
    setInterval(this.test.bind(this), 2500);
  }

  // Creates main background
  createOutline() {
    return this.svg.append('circle')
      .attr('cx', this.config.centerX)
      .attr('cy', this.config.centerY)
      .attr('r', 95)
      .attr('stroke', 'rgba(0, 0, 0, .6)')
      .attr('stroke-width', 3)
      .attr('fill', 'white');
  }
}

// Animates value text
function customTextTween(newValue) {
  return function (d) {
    const interpolate = d3.interpolateRound(d.value, newValue);
    d.value = newValue;
    return interpolate;
  }
}

// Animates hand rotation
function rotateTween(v) {
  return function (d) {
    const interpolate = d3.interpolate(d.angle, v);
    return function (t) {
      d.angle = interpolate(t);
      return `rotate(${interpolate(t)}, 100, 100)`;
    }
  }
}

// Creates all ticks and indicators
function createRadialAxis(svg, config) {
  const myAngleScale = d3.scaleLinear()
    .domain([config.minValue, config.maxValue])
    .range([config.startAngle, config.endAngle]);
  const myRadius = 85;
  const myRadialAxis = axisRadialInner(myAngleScale, myRadius)
    .tickPadding(18)
    // .ticks(40)
    .tickValues(d3.range(config.minValue, config.maxValue + config.tickStep, config.tickStep))
    .tickFormat((x) => {
      // Display only certain tick values
      if (x % config.valueSpacing == 0) {
        return x;
      }
    })

  // Create a second radial axis for displaying the larger ticks
  const tickValues = d3.range(config.minValue, config.maxValue, config.valueSpacing);
  const mySecondRadialAxis = axisRadialInner(myAngleScale, myRadius)
    .tickSize(12)
    .tickValues(tickValues)
    .tickFormat(() => {
      return
    });

  svg.append('g')
    .attr('transform', `translate(${config.centerX}, ${config.centerY})`)
    .call(myRadialAxis);
  svg.append('g')
    .attr('transform', `translate(${config.centerX}, ${config.centerY})`)
    .call(mySecondRadialAxis);
}

function createHand(svg, config, scale) {
  return hand = svg.append('line')
    .datum({ angle: scale(config.startValue) })
    .attr('x1', config.centerX)
    .attr('y1', config.centerY)
    .attr('x2', 100)
    .attr('y2', 10)
    .attr('stroke', 'black')
    .attr('transform', `rotate(${scale(config.startValue)}, ${config.centerX}, ${config.centerY})`);
}

function createBigHand(svg, config, scale) {
  return svg.append('polygon')
    .datum({ angle: scale(config.startValue) })
    .attr('points', '96,120 104,120 100,10')
    .attr('stroke', 'black')
    .attr('fill', 'red')
    .attr('transform', `rotate(${scale(config.startValue)}, ${config.centerX}, ${config.centerY})`);
}

// Add a little button for prettyness
function createCenterButton(svg, config) {
  svg.append('circle')
    .attr('cx', config.centerX)
    .attr('cy', config.centerY)
    .attr('r', 5);
}

function createValueTexts(svg, config) {
  // Background for valuetext
  const width = 65;
  svg.append('rect')
    .attr('x', 100 - width / 2)
    .attr('y', 145)
    .attr('width', width)
    .attr('height', 25)
    .attr('rx', 3)
    .attr('stroke', 'grey')
    .attr('fill', 'gainsboro');

  // Type of scale (e.g. temperature, pressure)
  svg.append('text')
    .attr('x', config.centerX)
    .attr('y', 140)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .text(config.scaleType);

  // Unit
  svg.append('text')
    .attr('x', config.centerX)
    .attr('y', 183)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .text(config.unit);

  // Value text
  return svg.append('text')
    .datum({ value: config.startValue })
    .attr('x', config.centerX)
    .attr('y', 165)
    .attr('font-size', 20)
    .attr('text-anchor', 'middle')
    .text(config.startValue);
}
