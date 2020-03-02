import axios from 'axios';
import WindRoundGauge from './wind-round-gauge';
import TempRoundGauge from './temperature-round-gauge';
import PressureRoundGauge from './pressure-round-gauge';

const windGauge = new WindRoundGauge('#wind');
const tempGauge = new TempRoundGauge('#temperature');
const pressureGauge = new PressureRoundGauge('#pressure');

const url = 'https://api.checkwx.com/metar/enva/decoded';
const apiKey = '7ea07a15ec5c5ab9553d15039a';
const config = {
    headers: {
        'X-API-Key': apiKey
    }
};

const minute = 1000 * 60;
fetchData();
setInterval(() => {
    fetchData();
}, 15 * minute);

function fetchData() {
    axios.get(url, config).then((response) => {
        const data = response.data.data[0];

        console.log(data);

        const today = new Date();


        document.title = data.station.name;
        document.getElementById('observed').innerHTML = formatDate(new Date(data.observed));
        document.getElementById('fetched').innerHTML = formatDate(new Date());

        windGauge.updateDirection(data.wind.degrees);
        windGauge.updateWindSpeed(data.wind.speed_kts);
        pressureGauge.update(data.barometer.hpa);
        tempGauge.update(data.temperature.celsius);
    });
}

function formatDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
}