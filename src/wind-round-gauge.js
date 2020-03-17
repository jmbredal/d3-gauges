import * as d3 from 'd3';
import { axisRadialInner } from 'd3-radial-axis';

import RoundGauge, { rotateTween, customTextTween } from './round-gauge';
import { padLeft } from './formatters';

Number.prototype.between = function (a, b, inclusive) {
    var min = Math.min(a, b),
        max = Math.max(a, b);
    return inclusive ? this >= min && this <= max : this > min && this < max;
}

export default class WindRoundGauge extends RoundGauge {
    createLayout() {
        this.svg = d3.select(this.elementId).append('svg')
            .attr('viewBox', '0 0 200 200');

        this.outline = this.createOutline(this.svg, this.config);

        const bgWidth = 56

        const g = this.svg.append('g').attr('class', 'display');

        this.windDescriptionBackground = g.append('rect')
            .attr('x', 100 - (bgWidth / 2))
            .attr('y', 50)
            .attr('width', bgWidth)
            .attr('height', 20)
            .attr('rx', 2);

        this.windDescription = g.append('text')
            .attr('x', 100)
            .attr('y', 63)
            .attr('font-size', 9)
            .attr('text-anchor', 'middle')
            .text('');

        const windspeeds = [
            {
                x: 50,
                unit: 'm/s',
                value: 0
            },
            {
                x: 85,
                unit: 'knots',
                value: 0
            },
            {
                x: 120,
                unit: 'km/h',
                value: 0
            },
        ];

        const y = 90;
        const enter = g.append('g').selectAll('g.windspeed')
            .data(windspeeds).enter()
            .append('g')
            .attr('class', 'windspeed');

        // Background
        enter.append('rect')
            .attr('x', d => d.x)
            .attr('y', 90)
            .attr('width', 30)
            .attr('height', 20)
            .attr('rx', 3);

        // Unit
        enter.append('text')
            .attr('x', d => d.x + 15)
            .attr('y', y - 4)
            .attr('font-size', 10)
            .attr('text-anchor', 'middle')
            .text(d => d.unit);

        // Initial values
        enter.append('text')
            .attr('class', 'value')
            .attr('x', d => d.x + 15)
            .attr('y', y + 14)
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .text(d => '');

        // Direction label
        g.append('text')
            .attr('x', 100)
            .attr('y', 126)
            .attr('font-size', 10)
            .attr('text-anchor', 'middle')
            .text('Direction');

        // Direction background
        g.append('rect')
            .attr('x', 80)
            .attr('y', 130)
            .attr('width', 40)
            .attr('height', 20)
            .attr('rx', 3);

        // Initial direction value
        this.directionValue = g.append('text')
            .datum({ value: 0 })
            .attr('x', 100)
            .attr('y', 144)
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .text(d => d.value);

        // The headings
        const myAngleScale = d3.scaleOrdinal()
            .domain(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])
            .range(d3.range(0, Math.PI * 2, Math.PI * 2 * (45 / 360)));
        const myRadius = 85;
        const myRadialAxis = axisRadialInner(myAngleScale, myRadius).tickSizeInner(12);
        this.svg.append('g')
            .attr('class', 'radial-axis')
            .attr('transform', `translate(${this.config.centerX}, ${this.config.centerY})`)
            .call(myRadialAxis)
            .select('.domain').remove();

        // All the small ticks
        const myAngleScale2 = d3.scaleLinear()
            .domain([0, 360])
            .range([0, 2 * Math.PI]);
        const myRadialAxis2 = axisRadialInner(myAngleScale2, myRadius)
            .ticks(60)
            .tickFormat(() => { return })
        this.svg.append('g')
            .attr('class', 'radial-axis')
            .attr('transform', `translate(${this.config.centerX}, ${this.config.centerY})`)
            .call(myRadialAxis2)

        // The arrow
        this.fromArrow = this.svg.append('polygon')
            .datum({ angle: 0 })
            .attr('points', '100,30 110,15 90,15')
            .attr('stroke', 'black')
            .attr('fill', 'red')

        this.toArrow = this.svg.append('polygon')
            .datum({ angle: 180 })
            .attr('points', '100,15 110,30 90,30')
            .attr('stroke', 'black')
            .attr('fill', 'red')

        // Wind barb
        this.windBarb = this.svg.append('image')
          .datum({angle: -90})
          .attr('x', 130)
          .attr('y', 115)
          .attr('width', 20)
          .attr('height', 20)
          .attr('transform', 'rotate(-90, 140, 125)')
          .attr('href', require('../assets/icons/windspeed/Symbol_wind_speed_03.svg'));
    }

    update(direction, windSpeed) {
        this.updateDirection(direction);
        this.updateWindSpeed(windSpeed);
    }

    updateDirection(from) {
        const to = from + 180;
        this.directionValue.transition().duration(1500).textTween(customTextTween(from));
        this.windBarb.transition().duration(1500).attrTween('transform', rotateTween(to - 90, 140, 125));
        this.fromArrow.transition().duration(1500).attrTween('transform', rotateTween(from));
        this.toArrow.transition().duration(1500).attrTween('transform', rotateTween(to));
    }

    updateWindSpeed(knots) {
        // 1 knot = .51444 m/s = 1.852 km/h
        const ms = Number(knots * 1852 / 3600).toFixed(1);
        const kt = Number(knots).toFixed(0);
        const kmh = Number(knots * 1.852).toFixed(0);
        const values = [ms, kt, kmh];

        // Add new values to the data
        const data = this.svg.selectAll('g.windspeed').data().map((d, i) => {
            return { ...d, newValue: values[i] };
        });

        this.svg.selectAll('g.windspeed').data(data)
            .select('text.value')
            .transition()
            .duration(1500)
            .textTween(textTweenWindSpeed());
        this.windDescription.text(this.getWindDescription(knots));
        this.windBarb.attr('href', this.getWindSpeedSymbol(knots));
    }

    test() {
        const direction = parseInt(Math.random() * 360);
        const windSpeed = parseInt(Math.random() * 70);
        // this.update(direction, windSpeed);
        this.update(direction, 34);
    }

    getWindDescription(knots) {
        if (knots === 0) return 'Stille vind';
        if (Number(knots).between(1, 3, true)) return 'Flau vind';
        if (Number(knots).between(4, 6, true)) return 'Svak vind';
        if (Number(knots).between(7, 10, true)) return 'Lett bris';
        if (Number(knots).between(11, 15, true)) return 'Laber bris';
        if (Number(knots).between(16, 21, true)) return 'Frisk bris';
        if (Number(knots).between(22, 27, true)) return 'Liten kuling';
        if (Number(knots).between(28, 33, true)) return 'Stiv kuling';
        if (Number(knots).between(34, 40, true)) return 'Sterk kuling';
        if (Number(knots).between(41, 47, true)) return 'Liten storm';
        if (Number(knots).between(48, 55, true)) return 'Full storm';
        if (Number(knots).between(56, 63, true)) return 'Sterk storm';
        if (knots > 63) return 'Orkan';
    }

    getWindSpeedSymbol(knots) {
      const postfix = padLeft(Math.ceil(knots / 5));
      return require(`../assets/icons/windspeed/Symbol_wind_speed_${postfix}.svg`);
    }
}

function textTweenWindSpeed() {
    return function (d) {
        const interpolate = d3.interpolate(d.value, d.newValue);
        d.value = d.newValue;
        return function (t) {
            if (d.unit === 'm/s') {
                return Number(interpolate(t)).toFixed(1);
            } else {
                return Number(interpolate(t)).toFixed(0)
            }
        }
    }
}
