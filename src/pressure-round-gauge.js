import RoundGauge from './round-gauge';

export default class PressureRoundGauge extends RoundGauge {
    getDefaultConfig() {
        return {
            unit: 'hPa',
            scaleType: 'Pressure',
        }
    }
}
