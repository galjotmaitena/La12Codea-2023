import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-chat-mozo',
  templateUrl: './chat-mozo.page.html',
  styleUrls: ['./chat-mozo.page.scss'],
})
export class ChatMozoPage implements OnInit {

  mensaje: string = '';
  mensajes : any[] = [];
  mozos: any[] = [];
  observable : any;
  observableClientes : any;
  observableMozos : any;

  usuario = this.auth.get_user();
  cliente : any;
  mozo: any;

  constructor(private firestore : Firestore, private push : PushService, private auth: AuthService) { }

  ngOnInit() 
  {
/*     this.observableClientes = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      data.forEach(c => {
        if(c.email === this.usuario?.email)
        {                                   NECESITAMOS SABER: SI SE RESPONDIO, QUE MESA ES Y CUANTOS MENSAJES
                                            SIN LEER HAY DE ESE MISMO CHAT. URGENTE. POR FAVOR. MAITENA MI AMOR
          this.cliente = c;
        }
      });
    });
 */
    this.observableMozos = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      data.forEach(empleado => {
        if(empleado.tipoEmpleado === 'mozo')
        {
          this.mozos.push(empleado);

          if(this.usuario?.email === empleado.email)
          {
            this.mozo = empleado;
          }
        }
      });
    });

    this.observable = FirestoreService.traerFs('mensajes', this.firestore, 'hora').subscribe(data =>{
      this.mensajes = [];
      data.forEach((m)=>{
        if(this.cliente.mesa === m.mesa)
        {
          this.mensajes.push(m);
        }
      });
    });
  }

  enviarMensaje() 
  {
    if(this.mensaje != '')
    {
      let options : any = { timeZone: 'America/Argentina/Buenos_Aires'};
      let fechaHora = new Date().toLocaleString('es-AR', options);
      let mensajeEnviar = {hora:fechaHora, mensaje: this.mensaje, usuario: 'usuario', nombre: this.cliente.nombre};

      FirestoreService.guardarFs('mensajes', mensajeEnviar, this.firestore);
      this.push.sendPush('Consulta - Mozo', this.mensaje, this.cliente);
      this.mensaje = '';
    }
  }

  ngOnDestroy()
  {
    this.mensajes.forEach(m => {
      FirestoreService.eliminarFs('mensajes', m, this.firestore);
    });
    this.observable.unsubscribe();
  }
}
