import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { PushService } from 'src/app/services/push.service';
import { Router } from '@angular/router';

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
  chatElegido:any = null;
  mensajesAgrupados: any;

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

      this.mozos.forEach((m)=>{
        if(m.email === this.usuario?.email)
        {
          this.mozo = m;
        } 
      })
    });

    this.observable = FirestoreService.traerFs('mensajes', this.firestore, 'hora').subscribe(data =>{
      this.mensajes = data;
      this.mensajesAgrupados = this.agruparMensajes(this.mensajes);
      this.actualizarMensajesNoLeidosPorGrupo(this.mensajesAgrupados);
    });
  }

  enviarMensaje() 
  {
    if(this.mensaje != '')
    {
      let options : any = { timeZone: 'America/Argentina/Buenos_Aires'};
      let fechaHora = new Date().toLocaleString('es-AR', options);
      let mensajeEnviar = { hora: fechaHora, mensaje: this.mensaje, usuario: this.mozo, mesa: this.chatElegido[0].usuario.mesa };

      FirestoreService.guardarFs('mensajes', mensajeEnviar, this.firestore);
      this.mensaje = '';
      this.push.sendPush('Consulta - ' + this.mozo, this.mensaje, this.cliente);
    }
  }

  calcularMensajesNoLeidos(array: any) : number
  {
    console.log(array);
    let cant = 0;

    array.forEach((m:any) => {
      if(m.leido != undefined)
      {
        if(!m.leido)
        {
          cant++;
        }  
      }
    });

    return cant;
  }

  private actualizarMensajesNoLeidosPorGrupo(array: []) {
    console.log(array);
    array.forEach((grupo: any) => {
      grupo.unreadCount = this.calcularMensajesNoLeidos(grupo);
    });
  }

  private agruparMensajes(mensajes: any[]): any[] {
    return mensajes.reduce((acc, mensaje) => {
      const mesa = mensaje.usuario.perfil === 'mozo'
        ? mensaje.mesa
        : mensaje.usuario.mesa;
  
      const existingGroupIndex = acc.findIndex((grupo: any[]) => grupo[0]?.mesa === mesa);
  
      if (existingGroupIndex !== -1) {
        acc[existingGroupIndex].push(mensaje);
      } else {
        acc.push([mensaje]);
      }
  
      return acc;
    }, []);
  }

  salir()
  {
    if(this.chatElegido)
    {
      this.chatElegido = null;
    }
    else
    {
      this.router.navigateByUrl('/home-mozo');
      this.observable.unsubscribe();
    }
  }

  elegirChat(chat: any)
  {
    chat.forEach((m:any) => {
      m.leido = true;
      FirestoreService.actualizarFs('mensajes', m, this.firestore);
    });

    this.chatElegido = chat;
  }
}
