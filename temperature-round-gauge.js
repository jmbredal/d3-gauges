class TemperatureRoundGauge extends RoundGauge {
    getDefaultConfig() {
        return {
            minValue: -30,
            maxValue: 50,
            startValue: 0,
            valueSpacing: 10,
            tickStep: 2,
            unit: '°C',
            scaleType: 'Temperature',
        };
    }
}
