import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private baseUrl = 'https://api.mercadopago.com/checkout/preferences';
  private accessToken = 'TEST-1249301994362591-111113-cff2f1acbb2b52546ca0b292da4ab9bb-404691086';

  constructor(private http: HttpClient, private router: Router) {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (event.url.includes('/success') || event.url.includes('/failure') || event.url.includes('/pending')) {
        this.manipularHistorial();
      }
    });
  }

  obtenerURLPago(producto: any, returnUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`
    });

    const productoConAtributos = {
      ...producto,
      purpose: 'wallet_purchase',
      back_urls: {
        success: returnUrl,
        failure: returnUrl,
        pending: returnUrl
      }
    };

    return this.http.post<any>(this.baseUrl, productoConAtributos, { headers })
      .pipe(
        map((respuesta) => {
          console.log('URL de pago:', respuesta);

          // Guardar la URL actual antes de redirigir
          const currentUrl = this.router.url;

          // Abrir la URL en una nueva ventana o en un WebView
          window.open(respuesta.init_point, '_blank');

          // Manipular el historial del navegador para volver al HomeClientesPage
          this.manipularHistorial();

          return respuesta;
        }),
        catchError((error) => {
          console.error('Error al obtener la URL de pago:', error);
          return throwError(error);
        })
      );
  }

  private manipularHistorial() {
    // Manipular el historial del navegador para volver al HomeClientesPage
    const currentUrl = this.router.url;
    window.history.pushState(null, '', currentUrl);
  }
}
