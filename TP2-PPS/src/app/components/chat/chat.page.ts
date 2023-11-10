import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @Input() usuario: any;

  mensaje: string = '';
  mensajes : any[] = [];
  mozos: any[] = [];
  observable : any;
  observableClientes : any;
  observableMozos : any;

/*   usuarioAuth = this.authService.get_user();
  usuario : any; */

  /////////////////get user? para los clientes, entonces valido que el numero de mesa del msj coincida con el numero de mesa del cliente
  ////////////el mozo podria tener una lista de mesas que esta atendiendo? y que en base a eso se generen los chats

  constructor(private firestore : Firestore, /* private push : PushService */) { }

  ngOnInit() 
  {
/*     this.observableClientes = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      data.forEach(cliente => {
        if(cliente.email === this.usuarioAuth?.email)
        {
          this.usuario = cliente;// CORREGIR, SE EVALUA TODO EL TIEMPO CON EL SUBSCRIBE Y FRIZZEA EL PROGRAMA(YA ME PASÓ)
        }
      });
    }); */

    this.observableClientes = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      data.forEach(empleado => {
        if(empleado.tipoEmpleado === 'mozo')
        {
          this.mozos.push(empleado);
        }
      });
    });

    this.observable = FirestoreService.traerFs('mensajes', this.firestore).subscribe(data =>{
      this.mensajes = [];
      data.forEach((m)=>{
        if(this.usuario.mesa === m.mesa)
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
      let mensajeEnviar = {hora:fechaHora, mensaje: this.mensaje, usuario: 'mozo', nombre: this.usuario.nombre};

      if(this.esCliente(this.usuario))
      {
        let obj = {...mensajeEnviar, mesa: this.usuario.mesa};
        obj.usuario = 'cliente';
        mensajeEnviar = obj;
      }

      FirestoreService.guardarFs('mensajes', mensajeEnviar, this.firestore);
/*       this.mozos.forEach(m => {
        this.push.sendPush('Consulta - ' + this.usuario.nombre, this.mensaje, m);
      }); */
      this.mensaje = '';
    }
  }

  esCliente(user:any)
  {
    let ret = true;

    this.mozos.forEach((m)=>{
      if(user.email === m.email)
      {
        ret = false;
      }
    });

    return ret;
  }
}
