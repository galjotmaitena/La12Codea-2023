import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-home-mozo',
  templateUrl: './home-mozo.page.html',
  styleUrls: ['./home-mozo.page.scss'],
})
export class HomeMozoPage implements OnInit {

    /////////////////MOZOS
    listaPedidosPendientes : any[] = [];
    listaPedidosListos : any[] = [];
    listaEmpleados : any[] = [];
    observablePedidos : any;
    observableEmpleados : any;
    pedido : any = '';

  constructor(private firestore : Firestore, private authService : AuthService, private actionSheetCtrl: ActionSheetController, private push: PushService) { }

  ngOnInit() 
  {
    this.observablePedidos = FirestoreService.traerFs('pedidos', this.firestore).subscribe((data)=>{
      this.listaPedidosPendientes = [];
      data.forEach(pedido => {
        if(pedido.estado === 'pendiente')
        {
          this.listaPedidosPendientes.push(pedido);
        }
        else
        {
          if(pedido.cocina && pedido.bar)
          {
            pedido.estado = 'listo';
            let index = this.listaPedidosPendientes.indexOf(pedido);
            if(index != -1)
            {
              this.listaPedidosPendientes.splice(index, 1);
              this.listaPedidosListos.push(pedido);
            }
          }
        }
      });
    });

    this.observableEmpleados = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      this.listaEmpleados = [];
      data.forEach(empleado => {
        if(empleado.tipoEmpleado === 'cocinero' || empleado.tipoEmpleado === 'bartender')
        {
          this.listaEmpleados.push(empleado);
        }
      });
    });
  }

   //#region 
   confirmarPedido(pedido : any)
   {
     pedido.estado = 'confirmado';
 
     FirestoreService.actualizarFs('pedido', pedido, this.firestore).then(()=>{
       this.authService.mostrarToastExito('Pedido confirmado!');
       this.listaPedidosPendientes = [];
 
       this.listaEmpleados.forEach(e => {
         this.push.sendPush("Nuevo Pedido", `Ha ingresado un nuevo pedido para la mesa ${pedido.mesa}`, e);
       });
     });
   }
 
   //#endregion
 

}
