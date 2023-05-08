const fs = require('fs');

const axios = require('axios');

class Busquedas {
    historia = [];
    dbPath = './db/database.json'

    constructor () {
        // TODO: leer si existe
        this.leerDB();
    }

    get historiaCapitalizado() {
        // Capitalizar cada palabra
        return this.historia.map( lugar => {

            let palabras = lugar.split('  ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join(' ')

        })
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async ciudad ( lugar = '' ) {

        try {
            // peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

        } catch (error) {
            return [];
        }

    }

    async climaLugar( lat, lon ) {

        try {
            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon }
            })

            const resp = await instance.get();
            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial( lugar = '' ) {

        if ( this.historia.includes( lugar.toLocaleLowerCase ) ) {
            return;
        }
        this.historia = this.historia.splice(0,5);

        this.historia.unshift( lugar.toLocaleLowerCase() );

        // Grabar DB
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historia: this.historia
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ));

    }

    leerDB() {

        if ( !fs.existsSync( this.dbPath ) ) return;

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' });
        
        const data = JSON.parse( info );

        this.historia = data.historia;

    }

}

module.exports = Busquedas  