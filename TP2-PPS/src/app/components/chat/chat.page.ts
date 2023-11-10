import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  mensaje : string = '';
  mensajes : any[] = [];
  observable : any;
  observableClientes : any;
  observableMozos : any;

  usuarioAuth = this.authService.get_user();
  usuario : any;

  /////////////////get user? para los clientes, entonces valido que el numero de mesa del msj coincida con el numero de mesa del cliente
  ////////////el mozo podria tener una lista de mesas que esta atendiendo? y que en base a eso se generen los chats

  constructor(private firestore : Firestore, private authService : AuthService) { }

  ngOnInit() 
  {
    this.observableClientes = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      data.forEach(cliente => {
        if(cliente.email === this.usuarioAuth?.email)
        {
          this.usuario = cliente;// CORREGIR, SE EVALUA TODO EL TIEMPO CON EL SUBSCRIBE Y FRIZZEA EL PROGRAMA(YA ME PASÓ)
        }
      });
    });

    this.observableClientes = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      data.forEach(empleado => {
        if(empleado.tipoEmpleado === 'mozo' && empleado.correo === this.usuarioAuth?.email)
        {
          this.usuario = empleado;//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      });
    });

    this.traerMensajes();
  }

  enviarMensaje() 
  {
    if(this.mensaje != '')
    {
      let options : any = { timeZone: 'America/Argentina/Buenos_Aires'};
      let fechaHora = new Date().toLocaleString('es-AR', options);
      let mensajeEnviar = {'numeroMesa':1, 'hora':fechaHora, 'mensaje':this.mensaje};

      this.mensajes.push(FirestoreService.guardarFs('mensaje', mensajeEnviar, this.firestore));
      this.mensaje = '';
    }
  }

  traerMensajes()
  {
    this.observable = FirestoreService.traerFs('mensajes', this.firestore).subscribe((data)=>{
      data.forEach(mensaje => {
        if(mensaje.numeroMesa === this.usuario.mesa)
        {
          this.mensajes.push(mensaje);//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      });
    });
  }
}
