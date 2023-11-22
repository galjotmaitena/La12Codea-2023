import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { PushService } from 'src/app/services/push.service';
import { Router } from '@angular/router';

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

  constructor(private firestore : Firestore, private push : PushService, private auth: AuthService, private router: Router) { }

  ngOnInit() 
  {
    this.observableClientes = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      data.forEach(c => {
        switch(this.usuario?.email){
          case null:
            data.forEach(c => {
              if(c.uid === this.usuario?.uid)
              {
                this.cliente = c;
              }
            });
            break;
          default:
            data.forEach(c => {
              if(c.email === this.usuario?.email)
              {
                this.cliente = c;
              }
            });
            break;
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
        //alert(this.cliente.mesa);

        if(m.usuario.perfil === 'regular' || m.usuario.perfil === 'anonimo')
        {
          if(this.cliente.mesa != null)
          {
            if(this.cliente.mesa ===  m.usuario.mesa)
            {
              this.mensajes.push(m);
              //alert(JSON.stringify(m));
            }
          }
        }
        else
        {
          if(m.usuario.tipoEmpleado === 'mozo')
          {
            if(m.mesa !=  null)
            {
              if(this.cliente.mesa === m.mesa)
              {
                this.mensajes.push(m);
              }
            }
          }
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
      let mensajeEnviar = { hora: fechaHora, mensaje: this.mensaje, usuario: this.cliente, leido: false };

      FirestoreService.guardarFs('mensajes', mensajeEnviar, this.firestore);
      this.mozos.forEach(m => {
        this.push.sendPush('Consulta - ' + this.cliente.nombre, this.mensaje, m);
      });
      this.mensaje = '';
    }
  }

  salir()
  {
    this.router.navigateByUrl('homeClientes');
    this.observable.unsubscribe();
  }
}
