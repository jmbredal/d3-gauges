import * as d3 from 'd3';
import RoundGauge, { createBigHand, createCenterButton, rotateTween } from './round-gauge';

export default class TemperatureRoundGauge extends RoundGauge {
  getDefaultConfig() {
    return {
      minValue: -30,
      maxValue: 50,
      startValue: 0,
      valueSpacing: 10,
      tickStep: 2,
      unit: '°C',
      scaleType: 'Temperature',
      data: [{
        unit: '°C­',
        type: 'Temp',
        value: 10,
        xPosition: 65,
      }, {
        unit: '°C­',
        type: 'Dew',
        value: 10,
        xPosition: 105,
      }]
    };
  }

  createColdArc() {
    this.svg.append('g').attr('class', 'cold-marker')
    .attr('transform', 'translate(100, 100)')
    .append('path')
    .attr('fill', '#03A9F4')
    .attr('d', () => {
      var arc = d3.arc();
      return arc({
        innerRadius: 73,
        outerRadius: 79,
        startAngle: (this.scale(-30) / 360) * Math.PI * 2,
        endAngle: (this.scale(0) / 360) * Math.PI * 2
      }); // "M0,
    });
  }

  createBasicLayout() {
    this.createColdArc();
    this.createTextDisplays();
    this.config.startValue = this.config.data[0].value;
    this.dewHand = this.createHand();
    this.hand = createBigHand(this.svg, this.config, this.scale);
    createCenterButton(this.svg, this.config);
  }

  createHand() {
    const { data, centerX, centerY } = this.config;
    const dewTemp = data[1].value;
    return this.svg.append('line')
      .datum({ angle: this.scale(dewTemp) })
      .attr('x1', centerX)
      .attr('y1', centerY)
      .attr('x2', 100)
      .attr('y2', 10)
      .attr('stroke', 'rgba(255, 255, 255, .87)')
      .attr('transform', `rotate(${this.scale(dewTemp)}, ${centerX}, ${centerY})`);
  }

  update(airTemp, dewTemp) {
    this.hand.transition()
      .duration(this.config.transitionDuration)
      .attrTween('transform', rotateTween(this.scale(airTemp)));
    this.dewHand.transition()
      .duration(this.config.transitionDuration)
      .attrTween('transform', rotateTween(this.scale(dewTemp)));

    // Update text displays
    const values = [airTemp, dewTemp];
    const data = this.config.data.map((d, i) => {
      return { ...d, newValue: values[i] };
    });

    this.svg.selectAll('.display').data(data).select('.displayValue')
      .transition().duration(this.config.transitionDuration)
      .textTween(textTweenValues());
  }

  test() {
    const tempRandomValue = this.getRandomValue();
    const dewRandomValue = tempRandomValue - Math.round(Math.random() * 10);
    this.update(tempRandomValue, dewRandomValue);
  }

  createTextDisplays() {
    // Background for valuetext
    const width = 35;
    const displayContainers = this.svg.append('g').attr('class', 'displays')
      .selectAll('.display').data(this.config.data).enter()
      .append('g').attr('class', 'display');

    displayContainers.append('rect')
      .attr('x', (d) => d.xPosition)
      .attr('y', 145)
      .attr('width', width)
      .attr('height', 23)
      .attr('rx', 3);

    // Type of scale (e.g. temperature, pressure)
    displayContainers.append('text')
      .attr('x', (d) => d.xPosition + width / 2)
      .attr('y', 140)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .text((d) => d.type);

    // Unit
    displayContainers.append('text')
      .attr('x', (d) => d.xPosition + width / 2)
      .attr('y', 181)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .text(d => d.unit);

    // Value text
    displayContainers.append('text')
      .attr('class', 'displayValue')
      .attr('x', d => d.xPosition + width / 2)
      .attr('y', 162)
      .attr('font-size', 16)
      .attr('text-anchor', 'middle')
      .text(d => d.value);
  }

}

// Animates value text
function textTweenValues() {
  return function (d) {
    const interpolate = d3.interpolateRound(d.value, d.newValue);
    d.value = d.newValue;
    return interpolate;
  }
}
