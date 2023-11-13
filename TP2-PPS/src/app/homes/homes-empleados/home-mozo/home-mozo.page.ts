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
    listaPedidosEnPreparacion : any[] = [];
    listaPedidosPagados: any[] = [];
    listaEmpleados : any[] = [];
    observablePedidos : any;
    observableEmpleados : any;
    pedido : any = '';

  constructor(private firestore : Firestore, private authService : AuthService, private actionSheetCtrl: ActionSheetController, private push: PushService) { }

  ngOnInit() 
  {
    this.observablePedidos = FirestoreService.traerFs('pedidos', this.firestore).subscribe((data)=>{
      this.listaPedidosPendientes = [];
      this.listaPedidosListos = [];
      this.listaPedidosEnPreparacion = [];
      this.listaPedidosPagados = [];
      data.forEach(pedido => {
        if(pedido.estado === 'pendiente')
        {
          this.listaPedidosPendientes.push(pedido);
        }
        else
        {
          if(pedido.estado === 'confirmado' && pedido.cocina && pedido.bar)
          {
            pedido.estado = 'listo';
            FirestoreService.actualizarFs('pedidos', pedido, this.firestore);
            
          }
          else
          {
            if(pedido.estado === 'listo')
            {
              this.listaPedidosListos.push(pedido);
            }
            else
            {
              if(pedido.estado === 'pagado')
              {
                this.listaPedidosPagados.push(pedido);
              }
              else
              {
                this.listaPedidosEnPreparacion.push(pedido);
              }
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
 
     FirestoreService.actualizarFs('pedidos', pedido, this.firestore).then(()=>{
       this.authService.mostrarToastExito('Pedido confirmado!');
       this.listaPedidosPendientes = [];
 
       this.listaEmpleados.forEach(e => {
         this.push.sendPush("Nuevo Pedido", `Ha ingresado un nuevo pedido para la mesa ${pedido.mesa}`, e);
       });
     });
   }

   entregarPedido(pedido : any)
   {
     pedido.estado = 'enviado';
 
     FirestoreService.actualizarFs('pedidos', pedido, this.firestore).then(()=>{
       this.authService.mostrarToastExito('Pedido entregado!');
       this.listaPedidosListos = [];
     });
   }
   
  async confirmarPago(pedido: any)
  {
    let mesa:any;
    let cliente:any;

    alert(JSON.stringify(pedido));

    FirestoreService.traerFs('mesas', this.firestore).subscribe((mesas)=>{
      mesas.forEach((m)=>{
        if(m.numero === pedido.mesa)
        {
          mesa = m;
        }
      })
    })

    FirestoreService.traerFs('clientes', this.firestore).subscribe((clientes)=>{
      clientes.forEach((c)=>{
        if(c.mesa === pedido.mesa)
        {
          cliente = c;
        }
      })
    })

    setTimeout(()=>{
      if(mesa && cliente)
      {
        mesa.ocupada = false;
        FirestoreService.actualizarFs('mesas', mesa, this.firestore);
  
        cliente.mesa = '';
        FirestoreService.actualizarFs('clientes', cliente, this.firestore);

        pedido.estado = 'pag_confirmado';
        FirestoreService.actualizarFs('pedidos', pedido, this.firestore);

        this.authService.mostrarToastExito('PAGO CONFIRMADO');
      }
      else
      {
        this.authService.mostrarToastError('ERROR AL CONFIRMAR PAGO');
      }
    }, 4000)
  }
 
   //#endregion
 

}
