import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-home-bar',
  templateUrl: './home-bar.page.html',
  styleUrls: ['./home-bar.page.scss'],
})
export class HomeBarPage implements OnInit {

  productosBar : any[] = [];
  listaPedidos : any[] = [];
  listaMozos : any[] = [];
  observablePedidos : any;
  observableEmpleados : any;
  pedido : any = '';

  abierta = false;

  constructor(private firestore : Firestore, private authService : AuthService, private actionSheetCtrl: ActionSheetController, private push: PushService) { }

  ngOnInit() 
  {
    this.observablePedidos = FirestoreService.traerFs('pedidos', this.firestore).subscribe((data)=>{
      this.productosBar = [];
      this.listaPedidos = [];
      data.forEach(pedido => {
        if(pedido.estado === 'confirmado' && !pedido.bar)
        {
          let esBebida = false;

          pedido.productos.forEach((producto : any) => {
            if(producto.tipo === 'bebida')
            {
              esBebida = true;
            }
          });

          if(esBebida)
          {
            this.listaPedidos.push(pedido);
          }
          else
          {
            pedido.bebida = true;

            FirestoreService.actualizarFs('pedidos', pedido, this.firestore);
          }
        }
      });
    });

    // this.listaPedidos.push({'mesa': 1, 'productos': [{'tipo' : 'bebida', 'nombre':'gin tonic'}, {'tipo' : 'bebida', 'nombre':'gancia'}, {'tipo' : 'comida', 'nombre':'gancia'}]});
    // this.listaPedidos.push({'mesa': 2, 'productos': [{'tipo' : 'bebida', 'nombre':'gin tonic'}]});


    this.observableEmpleados = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      this.listaMozos = [];
      data.forEach(empleado => {
        if(empleado.tipoEmpleado === 'mozo')
        {
          this.listaMozos.push(empleado);
        }
      });
    });
  }

  terminarPedido(pedido : any)
  {
    pedido.bar = true;
 
    FirestoreService.actualizarFs('pedidos', pedido, this.firestore).then(()=>{
      this.authService.mostrarToastExito('Pedido confirmado!');
 
      this.listaMozos.forEach(m => {
        this.push.sendPush("Actualización pedido bar", `El pedido para la mesa ${pedido.mesa} ya esta terminado`, m);
      });
    });
  }

  cerrar()
  {
    this.productosBar = [];
    this.abierta = false;
  }

  abrir(productos : any)
  {
    productos.forEach((producto : any) => {
      if(producto.tipo === 'bebida')
      {
        let esta = false;
        let index = 0;

        for(let i = 0; i < this.productosBar.length; i++)
        {
          if(producto.nombre == this.productosBar[i].nombre && producto.descripcion == this.productosBar[i].descripcion)
          {
            esta = true;
            index = i;
            break;
          }
        }

        if(!esta)
        {
          let obj = {...producto, cantidad : 1};
          this.productosBar.push(obj);
        }
        else
        {
          this.productosBar[index].cantidad++;
        }
        
      }
    });

    this.abierta = true;
  }
}
