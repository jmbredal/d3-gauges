import axios from 'axios';
import WindRoundGauge from './wind-round-gauge';
// import TempRoundGauge from './temperature-round-gauge';
import TempDewRoundGauge from './tempdew-round-gauge';
import PressureRoundGauge from './pressure-round-gauge';

import sunny from '../assets/icons/weather/28m.svg';

import { formatDate } from './formatters.mjs';

const windGauge = new WindRoundGauge('#wind');
const tempGauge = new TempDewRoundGauge('#temperature');
const pressureGauge = new PressureRoundGauge('#pressure');

const apiKey = '7ea07a15ec5c5ab9553d15039a';
const config = {
  headers: {
    'X-API-Key': apiKey
  }
};

document.getElementById('weather-icon').src = sunny;

tempGauge.test();
windGauge.test();
pressureGauge.test();
// start();

function start() {
  const minute = 1000 * 60;
  fetchData();
  let intervalId = setInterval(() => {
    fetchData();
  }, 30 * minute);

  const form = document.getElementById('icao-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('error').style.display = 'none';
    const icao = form.querySelector('input').value;

    clearInterval(intervalId);
    fetchData(icao);
    intervalId = setInterval(() => {
      fetchData(icao);
    }, 30 * minute);
  });
}


function fetchData(icao = 'enva') {
  const url = `https://api.checkwx.com/metar/${icao}/decoded`;
  axios.get(url, config).then((response) => {
    if (response.data.results === 0) {
      console.log('No results');
      document.getElementById('error').style.display = 'block';
      return;
    }
    const data = response.data.data[0];
    document.title = `Weather for ${data.station.name} - ${icao.toUpperCase()}`;
    document.getElementById('observed').innerHTML = formatDate(new Date(data.observed));
    document.getElementById('fetched').innerHTML = formatDate(new Date());

    windGauge.updateDirection(data.wind.degrees);
    windGauge.updateWindSpeed(data.wind.speed_kts);
    pressureGauge.update(data.barometer.hpa);
    tempGauge.update(data.temperature.celsius, data.dewpoint.celsius);
  });
}
