class WindRoundGauge extends RoundGauge {
    createLayout() {
        this.svg = d3.select(this.elementId).append('svg')
            .attr('viewBox', '0 0 200 200')
            .attr('font-family', 'sans-serif');
        this.outline = createOutline(this.svg, this.config);

        this.svg.append('text')
            .attr('x', 100)
            .attr('y', 65)
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .text('Wind');

        const arf = [
            {
                x: 50,
                unit: 'm/s'
            },
            {
                x: 85,
                unit: 'kt'
            },
            {
                x: 120,
                unit: 'km/h'
            },
        ];

        const y = 90;
        const enter = this.svg.append('g').selectAll('g.windspeed')
            .data(arf).enter()
            .append('g')
            .attr('class', 'windspeed');

        // Background
        enter.append('rect')
            .attr('x', d => d.x)
            .attr('y', 90)
            .attr('width', 30)
            .attr('height', 20)
            .attr('rx', 3)
            .attr('stroke', 'grey')
            .attr('fill', 'gainsboro');

        // Unit
        enter.append('text')
            .attr('x', d => d.x + 15)
            .attr('y', y - 5)
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
            .text('12.3');

        // Direction label
        this.svg.append('text')
            .attr('x', 100)
            .attr('y', 125)
            .attr('font-size', 10)
            .attr('text-anchor', 'middle')
            .text('Direction');

        // Direction background
        this.svg.append('rect')
            .attr('x', 80)
            .attr('y', 130)
            .attr('width', 40)
            .attr('height', 20)
            .attr('rx', 3)
            .attr('stroke', 'grey')
            .attr('fill', 'gainsboro');

        // Initial direction value
        this.directionValue = this.svg.append('text')
            .attr('x', 100)
            .attr('y', 144)
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .text('350');

        // The headings
        const myAngleScale = d3.scaleOrdinal()
            .domain(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])
            .range(d3.range(0, Math.PI * 2, Math.PI * 2 * (45 / 360)));
        const myRadius = 85;
        const myRadialAxis = d3.axisRadialInner(myAngleScale, myRadius).tickSizeInner(12);
        this.svg.append('g')
            .attr('transform', `translate(${this.config.centerX}, ${this.config.centerY})`)
            .call(myRadialAxis)
            .select('.domain').remove();

        // All the small ticks
        const myAngleScale2 = d3.scaleLinear()
            .domain([0, 360])
            .range([0, 2 * Math.PI]);
        const myRadialAxis2 = d3.axisRadialInner(myAngleScale2, myRadius)
            .ticks(60)
            .tickFormat(() => {return})
        this.svg.append('g')
            .attr('transform', `translate(${this.config.centerX}, ${this.config.centerY})`)
            .call(myRadialAxis2)

        // The arrow
        this.arrow = this.svg.append('polygon')
            .attr('points', '100,15 110,30 90,30')
            .attr('transform', 'rotate(90, 100, 100)')
            .attr('stroke', 'black')
            .attr('fill', 'red')
    }

    update(direction, windSpeed) {
        this.updateDirection(direction);
        this.updateWindSpeed(windSpeed);
    }

    updateDirection(v) {
        this.directionValue.text(v);
        this.arrow.attr('transform', `rotate(${v}, 100, 100)`)
    }

    updateWindSpeed(v) {
        const ms = Number(v).toFixed(1);
        const kt = Number(ms * 3600 / 1852).toFixed(1);
        const kmh = Number(ms * 3600 / 1000).toFixed(0);
        const values = [ms, kt, kmh];
        this.svg.selectAll('g.windspeed').data(values).select('text.value').text(d => d);
    }

    test() {
        const direction = parseInt(Math.random() * 360);
        const windSpeed = parseInt(Math.random() * 33);
        this.update(direction, windSpeed);
    }

}
