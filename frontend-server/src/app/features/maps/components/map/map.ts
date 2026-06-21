import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  NgZone,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Map as MapService } from '../../services/map';
import { GoogleMap, MapMarker } from '@angular/google-maps';

interface CustomMarker {
  id: number;
  position: google.maps.LatLngLiteral;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMap, MapMarker],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements OnInit {
  private mapService = inject(MapService);
  private zone = inject(NgZone);

  // Guardaremos los servicios nativos de Google aquí una vez importados
  private geocoderService!: google.maps.GeocodingLibrary;

  @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;

  isMapLoaded = signal(false);
  latitud = signal(-36.6066);
  longitud = signal(-72.1034);
  direccion = signal('Chillán, Chile');
  zoom = 14;

  center = computed<google.maps.LatLngLiteral>(() => ({
    lat: this.latitud(),
    lng: this.longitud(),
  }));

  markers = signal<CustomMarker[]>([]);
  markerOptions!: google.maps.MarkerOptions;

  ngOnInit() {
    this.mapService
      .loadApi()
      .then(async () => {
        // IMPORTACIÓN DINÁMICA DE GOOGLE (Evita el bloqueo de facturación en entornos Demo)
        this.geocoderService = (await google.maps.importLibrary(
          'geocoding'
        )) as google.maps.GeocodingLibrary;

        this.markerOptions = {
          draggable: true,
          animation: google.maps.Animation.DROP,
          title: '¡Arrástrame!',
        };

        this.markers.set([
          { id: 1, position: { lat: this.latitud(), lng: this.longitud() } },
        ]);

        this.isMapLoaded.set(true);

        // Activamos el buscador predictivo
        setTimeout(() => this.inicializarAutocompletado(), 150);
      })
      .catch((error) => console.error('Error crítico cargando Google Maps', error));
  }

  // ACCIÓN 1: EL USUARIO ARRASTRA EL PIN EN EL MAPA (TRADUCCIÓN MEDIANTE GOOGLE GEOCÓDIGO)
  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const coordenadas = event.latLng.toJSON();

      this.zone.run(() => {
        // Actualizamos los números en tu footer de inmediato
        this.latitud.set(+coordenadas.lat.toFixed(4));
        this.longitud.set(+coordenadas.lng.toFixed(4));

        this.markers.update((lista) =>
          lista.map((m) =>
            m.id === 1
              ? { ...m, position: { lat: this.latitud(), lng: this.longitud() } }
              : m
          )
        );

        // Usamos la nueva instancia de geocodificación asíncrona de Google
        const geocoder = new this.geocoderService.Geocoder();
        geocoder.geocode({ location: coordenadas }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            this.zone.run(() => {
              this.direccion.set(results[0].formatted_address);
            });
          }
        });
      });
    }
  }

  // ACCIÓN 2: EL USUARIO ESCRIBE MANUALMENTE Y PRESIONA ENTER
  buscarDireccion(textoDireccion: string) {
    if (!textoDireccion.trim()) return;

    const geocoder = new this.geocoderService.Geocoder();
    geocoder.geocode({ address: textoDireccion }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const coords = results[0].geometry.location.toJSON();

        this.zone.run(() => {
          this.latitud.set(+coords.lat.toFixed(4));
          this.longitud.set(+coords.lng.toFixed(4));
          this.direccion.set(results[0].formatted_address);

          this.markers.update((lista) =>
            lista.map((m) =>
              m.id === 1
                ? { ...m, position: { lat: this.latitud(), lng: this.longitud() } }
                : m
            )
          );
        });
      }
    });
  }

  async inicializarAutocompletado() {
    if (!this.addressInput) return;

    try {
      const { Autocomplete } = (await google.maps.importLibrary(
        'places'
      )) as google.maps.PlacesLibrary;
      const autocomplete = new Autocomplete(this.addressInput.nativeElement, {
        fields: ['geometry', 'formatted_address'],
        types: ['address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const coords = place.geometry.location.toJSON();

        this.zone.run(() => {
          const latTruncada = +coords.lat.toFixed(4);
          const lngTruncada = +coords.lng.toFixed(4);

          this.latitud.set(latTruncada);
          this.longitud.set(lngTruncada);
          this.direccion.set(place.formatted_address || 'Dirección seleccionada');

          this.markers.update((lista) =>
            lista.map((m) =>
              m.id === 1 ? { ...m, position: { lat: latTruncada, lng: lngTruncada } } : m
            )
          );
          this.zoom = 16;
        });
      });
    } catch (error) {
      console.error('Error en autocompletado:', error);
    }
  }
}