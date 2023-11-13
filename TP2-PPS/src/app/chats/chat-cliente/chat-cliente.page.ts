import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-chat-cliente',
  templateUrl: './chat-cliente.page.html',
  styleUrls: ['./chat-cliente.page.scss'],
})
export class ChatClientePage implements OnInit {
  mensaje: string = '';
  mensajes : any[] = [];
  mozos: any[] = [];
  observable : any;
  observableClientes : any;
  observableMozos : any;

  usuario = this.auth.get_user();
  cliente : any;

  constructor(private firestore : Firestore, private push : PushService, private auth: AuthService) { }

  ngOnInit() 
  {
    this.observableClientes = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      data.forEach(c => {
        if(c.email === this.usuario?.email)
        {
          this.cliente = c;
        }
      });
    });

    this.observableMozos = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      data.forEach(empleado => {
        if(empleado.tipoEmpleado === 'mozo')
        {
          this.mozos.push(empleado);
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
      let mensajeEnviar = {hora:fechaHora, mensaje: this.mensaje, usuario: 'cliente', nombre: this.cliente.nombre};

      FirestoreService.guardarFs('mensajes', mensajeEnviar, this.firestore);
      this.mozos.forEach(m => {
        this.push.sendPush('Consulta - ' + this.cliente.nombre, this.mensaje, m);
      });
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
