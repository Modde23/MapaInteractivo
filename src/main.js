//Este archivo contiene el codigo en JavaScript que inicia el mapa, permite marcar múltiples posiciones y calcular la distancia total de la ruta seleccionada, además de cambiar el estilo del mapa.

const map = L.map('map').setView([0, 0], 2); // Inicia el mapa con una vista global

// Capas base para cambiar el estilo del mapa
const baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }),
    "Satélite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 })
};
baseLayers["OpenStreetMap"].addTo(map);
L.control.layers(baseLayers).addTo(map);

let markers = []; // arreglo para almacenar los marcadores
let distanceLine = null; // referencia a la línea de distancia

// Función que calcula la distancia total de la ruta
function calculateDistance() {
    if (markers.length >= 2) {
        let totalDistance = 0;
        let latlngs = markers.map(m => m.getLatLng());
        for (let i = 0; i < latlngs.length - 1; i++) {
            totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        document.getElementById('result').innerText = `Distancia total: ${(totalDistance / 1000).toFixed(2)} km`;

        // Si ya existe una línea de distancia, la eliminamos
        if (distanceLine) {
            map.removeLayer(distanceLine);
        }
        // Dibujar la polilínea de la ruta
        distanceLine = L.polyline(latlngs, { color: 'red', weight: 3 }).addTo(map);
    } else {
        document.getElementById('result').innerText = 'Distancia: -- km';
        if (distanceLine) {
            map.removeLayer(distanceLine);
            distanceLine = null;
        }
    }
}

// Permitir agregar varios puntos
map.on('click', function(e) {
    const marker = L.marker(e.latlng).addTo(map);
    marker.bindPopup(
        `Lat: ${e.latlng.lat.toFixed(5)}<br>Lng: ${e.latlng.lng.toFixed(5)}`,
        { autoClose: false, closeOnClick: false }
    ).openPopup();
    markers.push(marker);
    calculateDistance();
});

// Escuchador de eventos para el botón de reinicio
document.getElementById('resetBtn').onclick = function() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    if (distanceLine) {
        map.removeLayer(distanceLine);
        distanceLine = null;
    }
    document.getElementById('result').innerText = 'Distancia: -- km';
};


// Escuchador de eventos para el botón "Añadir coordenadas"
document.getElementById('addCoordBtn').onclick = function() {
    const input = document.getElementById('coordInput').value.trim();
    const parts = input.split(',');
    if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(
                `Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`,
                { autoClose: false, closeOnClick: false }
            ).openPopup();
            markers.push(marker);
            calculateDistance();
            map.setView([lat, lng], 8); // Opcional: centrar el mapa en el nuevo punto
            document.getElementById('coordInput').value = '';
            return;
        }
    }
    alert('Por favor ingresa las coordenadas en el formato: latitud, longitud');
};



//Opcion de poligono para calculo de area
let areaPolygon = null; // referencia al polígono de área

function calculateArea() {
    if (markers.length >= 3) {
        let latlngs = markers.map(m => m.getLatLng());
        // Cierra el polígono si no está cerrado
        if (!latlngs[0].equals(latlngs[latlngs.length - 1])) {
            latlngs.push(latlngs[0]);
        }
        // Elimina el polígono anterior si existe
        if (areaPolygon) {
            map.removeLayer(areaPolygon);
        }
        // Dibuja el polígono
        areaPolygon = L.polygon(latlngs, {color: 'blue', fillOpacity: 0.2}).addTo(map);
        // Calcula el área
        let area = L.GeometryUtil.geodesicArea(latlngs);
        document.getElementById('areaResult').innerText = `Área: ${(area / 1000000).toFixed(2)} km²`;
    } else {
        document.getElementById('areaResult').innerText = 'Área: -- km²';
        if (areaPolygon) {
            map.removeLayer(areaPolygon);
            areaPolygon = null;
        }
    }
}
// Boton de calcular Area
document.getElementById('calculateAreaBtn').onclick = function() {
    calculateArea();
    if (distanceLine) {
        map.removeLayer(distanceLine);
        distanceLine = null;
    }
};  

// Botón de reinicio para el área
document.getElementById('resetAreaBtn').onclick = function() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    if (distanceLine) {
        map.removeLayer(distanceLine);
        distanceLine = null;
    }
    document.getElementById('areaResult').innerText = 'Área: -- km²';
    document.getElementById('coordInput').value = '';
    document.getElementById('resetBtn').disabled = false;
    document.getElementById('addCoordBtn').disabled = false;
    document.getElementById('calculateAreaBtn').disabled = false;
}
