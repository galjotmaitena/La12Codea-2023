import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-home-cocina',
  templateUrl: './home-cocina.page.html',
  styleUrls: ['./home-cocina.page.scss'],
})
export class HomeCocinaPage implements OnInit {

  productosCocina : any[] = [];
  listaPedidos : any[] = [];
  listaMozos : any[] = [];
  observablePedidos : any;
  observableEmpleados : any;

  abierta = false;

  constructor(private firestore : Firestore, private authService : AuthService, private push: PushService) { }

  ngOnInit() 
  {
    this.observablePedidos = FirestoreService.traerFs('pedidos', this.firestore).subscribe((data)=>{
      this.productosCocina = [];
      this.listaPedidos = [];
      data.forEach(pedido => {
        if(pedido.estado === 'confirmado' && !pedido.cocina)
        {
          let esComida = false;

          pedido.productos.forEach((producto : any) => {
            if(producto.tipo !== 'bebida')
            {
              esComida = true;
            }
          });

          if(esComida)
          {
            this.listaPedidos.push(pedido);
          }
          else
          {
            pedido.cocina = true;

            FirestoreService.actualizarFs('pedidos', pedido, this.firestore);
          }
        }
      });
    });

    // this.listaPedidos.push({'mesa': 1, 'productos': [{'tipo' : 'bebida', 'nombre':'gin tonic'}, {'tipo' : 'bebida', 'nombre':'gancia'}, {'tipo' : 'comida', 'nombre':'fideos'}]});
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
    pedido.cocina = true;
    console.log(pedido);
 
    FirestoreService.actualizarFs('pedidos', pedido, this.firestore).then(()=>{
      this.authService.mostrarToastExito('Pedido confirmado!');
      this.listaPedidos = [];
 
      this.listaMozos.forEach(m => {
        this.push.sendPush("Actualización pedido cocina", `El pedido para la mesa ${pedido.mesa} ya esta terminado`, m);
      });
    });
  }

  cerrar()
  {
    this.productosCocina = [];
    this.abierta = false;
  }

  abrir(productos : any)
  {
    productos.forEach((producto : any) => {
      if(producto.tipo === 'comida' || producto.tipo === 'postre')
      {
        let esta = false;
        let index = 0;

        for(let i = 0; i < this.productosCocina.length; i++)
        {
          if(producto.nombre == this.productosCocina[i].nombre && producto.descripcion == this.productosCocina[i].descripcion)
          {
            esta = true;
            index = i;
            break;
          }
        }

        if(!esta)
        {
          let obj = {...producto, cantidad : 1};
          this.productosCocina.push(obj);
        }
        else
        {
          this.productosCocina[index].cantidad++;
        }
        
      }
    });

    this.abierta = true;
  }
}