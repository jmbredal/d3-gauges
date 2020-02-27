class RoundGauge {
    constructor(elementId, minValue = 900, maxValue = 1100, startValue = 1000, valueSpacing = 20, tickStep = 5) {
        this.defaults = {
            centerX: 100,
            centerY: 100,
            minValue: minValue,
            maxValue: maxValue,
            startValue: startValue,
            valueSpacing: valueSpacing,
            tickStep: tickStep,
            startAngle: -(Math.PI * 2 * (120 / 360)),
            endAngle: Math.PI * 2 * (120 / 360),
            transitionDuration: 1500,
        }

        // Create the various elements
        this.svg = d3.select(elementId).append('svg')
            .attr('viewBox', '0 0 200 200')
            .attr('font-family', 'sans-serif');
        this.outline = createOutline(this.svg, this.defaults);
        this.scale = d3.scaleLinear()
            .range([-120, 120])
            .domain([this.defaults.minValue, this.defaults.maxValue]);
        createRadialAxis(this.svg, this.defaults);
        this.svg.append('rect')
            .attr('x', 70)
            .attr('y', 150)
            .attr('width', 60)
            .attr('height', 25)
            .attr('rx', 3)
            .attr('stroke', 'grey')
            .attr('fill', 'gainsboro');
        this.hand = createBigHand(this.svg, this.defaults, this.scale);
        createCenterButton(this.svg, this.defaults);
        this.valueText = createValueText(this.svg, this.defaults);
    }

    // Animate the gauge with new value
    update(v) {
        this.hand.transition()
            .duration(this.defaults.transitionDuration)
            .attrTween('transform', rotateTween(this.scale(v)));
        this.valueText.transition()
            .duration(this.defaults.transitionDuration)
            .textTween(customTextTween(v));
    }

    getRandomValue() {
        const diff = this.defaults.maxValue - this.defaults.minValue;
        return parseInt((Math.random() * diff) + this.defaults.minValue);
    }

    test() {
        this.update(this.getRandomValue());
    }

    demo() {
        this.test();
        setInterval(this.test.bind(this), 2500);
    }
}

function customTextTween(newValue) {
    return function (d) {
        const interpolate = d3.interpolateRound(d.value, newValue);
        d.value = newValue;
        return interpolate;
    }
}

function rotateTween(v) {
    return function (d) {
        const interpolate = d3.interpolate(d.angle, v);
        return function (t) {
            d.angle = interpolate(t);
            return `rotate(${interpolate(t)}, 100, 100)`;
        }
    }
}

function createRadialAxis(svg, defaults) {
    const myAngleScale = d3.scaleLinear()
        .domain([defaults.minValue, defaults.maxValue])
        .range([defaults.startAngle, defaults.endAngle]);
    const myRadius = 85;
    const myRadialAxis = d3.axisRadialInner(myAngleScale, myRadius)
        .tickPadding(18)
        // .ticks(40)
        .tickValues(d3.range(defaults.minValue, defaults.maxValue + defaults.tickStep, defaults.tickStep))
        .tickFormat((x) => {
            // Display only certain tick values
            if (x % defaults.valueSpacing == 0) {
                return x;
            }
        })

    // Create a second radial axis for displaying the larger ticks
    const tickValues = d3.range(defaults.minValue, defaults.maxValue, defaults.valueSpacing);
    const mySecondRadialAxis = d3.axisRadialInner(myAngleScale, myRadius)
        .tickSize(12)
        .tickValues(tickValues)
        .tickFormat(() => {
            return
        });

    svg.append('g')
        .attr('transform', `translate(${defaults.centerX}, ${defaults.centerY})`)
        .call(myRadialAxis);
    svg.append('g')
        .attr('transform', `translate(${defaults.centerX}, ${defaults.centerY})`)
        .call(mySecondRadialAxis);
}

function createHand(svg, defaults, scale) {
    return hand = svg.append('line')
        .datum({ angle: scale(defaults.startValue) })
        .attr('x1', defaults.centerX)
        .attr('y1', defaults.centerY)
        .attr('x2', 100)
        .attr('y2', 10)
        .attr('stroke', 'red')
        .attr('transform', `rotate(${scale(defaults.startValue)}, ${defaults.centerX}, ${defaults.centerY})`);
}

function createBigHand(svg, defaults, scale) {
    return svg.append('polygon')
        .datum({ angle: scale(defaults.startValue) })
        .attr('points', '96,120 104,120 100,10')
        .attr('stroke', 'black')
        .attr('fill', 'red')
        .attr('transform', `rotate(${scale(defaults.startValue)}, ${defaults.centerX}, ${defaults.centerY})`);
}

function createCenterButton(svg, defaults) {
    // Add a little button for prettyness
    svg.append('circle')
        .attr('cx', defaults.centerX)
        .attr('cy', defaults.centerY)
        .attr('r', 5);
}

function createOutline(svg, defaults) {
    return svg.append('circle')
        .attr('cx', defaults.centerX)
        .attr('cy', defaults.centerY)
        .attr('r', 95)
        .attr('stroke', 'rgba(0, 0, 0, .6)')
        .attr('stroke-width', 3)
        .attr('fill', 'white');
}

function createValueText(svg, defaults) {
    return svg.append('text')
        .datum({ value: defaults.startValue })
        .attr('x', defaults.centerX)
        .attr('y', 170)
        .attr('font-size', 20)
        .attr('text-anchor', 'middle')
        .text(defaults.startValue);
}

function coldMarker() {
    const start = this.scale(-30);
    const end = this.scale(0);
    this.svg.append('path').attr('d', function () {
        const arc = d3.arc();
        return arc({
            innerRadius: 25,
            outerRadius: 50,
            startAngle: 2 * Math.PI * (start / 360),
            endAngle: 2 * Math.PI * (end / 360)
        });
    })
        .attr('transform', 'translate(100, 100)')
        .attr('fill', 'blue');
}