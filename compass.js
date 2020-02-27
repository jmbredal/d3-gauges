const arcSpacing = 15; // determines the width of the arc in radians (times two)
const arc = d3.arc();
const tau = 2 * Math.PI;
const centerX = 20;
const centerY = 20;
const innerRadius = 0;
const outerRadius = 20;
const startAngle = 0;
const startArc = arc({
    innerRadius,
    outerRadius,
    startAngle: Math.PI * 2 * ((startAngle - arcSpacing) / 360),
    endAngle: Math.PI * 2 * ((startAngle + arcSpacing) / 360),
});

class Compass {
    constructor(element) {
        this.svg = d3.select(element).append('svg').attr('viewBox', '0 0 40 40');
        this.svg.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', 15) // radius
            .style('stroke', 'grey')
            .style('stroke-width', '2')
            .style('fill', 'none');

        this.marker = this.svg.append('path')
            .datum({angle: startAngle})
            .attr('transform', `translate(${centerX}, ${centerY})`)
            .attr('d', startArc)
            .style('fill', 'red');
    }

    update(v) {
        const angle = tau * v / 360;
        this.marker.transition().duration(500).attrTween('d', arcTween(angle));
    }

    test() {
        const blapp = [45, 90, 270, 50, 359, 270, 0];
        const intervalId = setInterval(() => {
            const angle = blapp.shift();
            if (Number.isInteger(angle)) {
                this.update(angle);
            } else {
                clearInterval(intervalId);
            }
        }, 700)
    }
}

function arcTween(newAngle) {
    // d refers to datum
    return function(d) {
        var interpolate = d3.interpolate(d.angle, newAngle);
        // Called each tick
        return function(t) {
            const spacing = tau * (arcSpacing / 360);
            d.angle = interpolate(t);
            return arc({
                innerRadius,
                outerRadius,
                startAngle: interpolate(t) - spacing,
                endAngle: interpolate(t) + spacing,
            });
        }
    }
}
