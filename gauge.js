class Gauge {
    constructor(element, min=900, max=1100) {
        this.min = min;
        this.max = max;
        this.svg = d3.select(element).append('svg').attr('viewBox', '0 0 60 130');
        this.scale = d3.scaleLinear().domain([min, max]).range([100, 0]);

        this.gauge = this.svg.append('path')
            .attr('d', this.getPath(this.scale(min)))
            .attr('transform', 'translate(35, 15)')
            .style('fill', 'steelblue');

        // Left Axis
        this.svg.append('g')
            .attr('transform', 'translate(34, 15)')
            .call(d3.axisLeft(this.scale).ticks(3))
            .select('.domain').remove();

        // Add gauge outline
        this.svg.append('rect')
            .attr('x', 35)
            .attr('y', 5)
            .attr('rx', 10)
            .attr('width', 20)
            .attr('height', 120)
            .attr('stroke-width', 1)
            .style('stroke', 'black')
            .style('fill', 'transparent');

        this.test();
    }

    getPath(value) {
        return `M 0 ${value} L 20 ${value} L 20 100 a 10 10 0 0 1 -20 0`;
    }

    update(v) {
        this.gauge.transition().duration(500).attr('d', this.getPath(this.scale(v)));
    }

    test() {
        const blapp = [0, 0.1, 0.3, 0.5, 0.8, 1];
        const interpolate = d3.interpolate(this.min, this.max);
        const id = setInterval(() => {
            const v = blapp.shift();
            if (typeof v !== 'undefined') {
                console.log(v);
                this.update(interpolate(v));
            } else {
                clearInterval(id);
            }
        }, 700);
    }
}