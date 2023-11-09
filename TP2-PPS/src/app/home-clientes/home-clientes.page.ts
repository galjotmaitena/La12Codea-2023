import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { PushService } from '../services/push.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-clientes',
  templateUrl: './home-clientes.page.html',
  styleUrls: ['./home-clientes.page.scss'],
})
export class HomeClientesPage implements OnInit {

  //listas que traigo de firebase
  clientes:any[] = [];
  listaProductos : any[] = [];
  metres: any[] = [];

  observable : any;
  observablePedidos : any;

  //////////////////////////////////

  abierta = false;
  escaneado : any = '';

  ingreso = false;           ////////////////////////////////////////poner en true para probar
  enMesa = false; /////////////////////////////////////////////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6
  yaPidio = false; 

  user = this.authService.get_user();                 ///////////////////////////////////funcionaaaaaa
  mensaje : string = '';

  pedido : any[] = [];
  totalPrecio = 0;
  totalTiempo = 0;

  estadoPedido = '';//////////////////////////////////////////////////

  cliente : any;


  muestro = '';
  selectedTab = '';

  constructor(private authService : AuthService, private firestore : Firestore, private push: PushService, private router: Router) { }

  ngOnInit() 
  {
    this.observable = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      data.forEach((e)=>{
        if(e.tipoEmpleado == "metre")
        {
          this.metres.push(e);
        }
      })
    });

    this.observable = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      console.log(data);
      this.clientes = data;

      data.forEach(c => {
        if(c.email === this.user?.email)
        {
          this.cliente = c;
        }
      });
    });

    this.observablePedidos = FirestoreService.traerFs('productos', this.firestore).subscribe((data)=>{
      this.listaProductos = data;
    });
  }

  ngOnDestroy(): void 
  {
    this.stopScan();
    this.observable.unsubscribe();
  }

  async checkPermission()
  {
    let ret = false;
    try
    {
      const status = await BarcodeScanner.checkPermission({force: true});
      if(status.granted)
      {
        ret = true;
      }
    }
    catch(error)
    { 
      alert('permisos');

     alert(error);
    }

    return ret;
  }

  async startScan()
  {
    try
    {
      const permission = await this.checkPermission();

      if(!permission)
      {
        return;
      }

      this.abierta = true;
      await BarcodeScanner.hideBackground();
      document.querySelector('body')?.classList.add('scanner-active');
      const result = await BarcodeScanner.startScan();
      
      if(result?.hasContent)
      {

        this.escaneado = result.content;

        alert(this.escaneado);

        BarcodeScanner.showBackground();
        document.querySelector('body')?.classList.add('scanner-active');

        this.asignarEscan();

        this.abierta = false;
      }
    }
    catch(error)
    {
      alert('startscan');
      alert(this.escaneado);
      alert(error);
      this.stopScan();
    }
  }

  async stopScan()
  {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
  }

  asignarEscan()
  {
    if(!this.ingreso && this.cliente.mesa === '')
        {let ingresoJSON = JSON.parse(this.escaneado);                             
      this.ingreso = ingresoJSON.ingresarAlLocal;
      this.cliente.espera = true;
    
      alert(this.cliente);
      alert(this.user?.email);
    
      FirestoreService.actualizarFs('clientes', this.cliente, this.firestore).then(()=>{
        if(this.cliente.espera)
        {
          //alert('Usted esta en lista de espera');                       //////////////////////metre
          this.metres.forEach((m) => {
            this.push.sendPush("Clientes - Informacion", "Ha ingresado un nuevo cliente en la lista de espera", m)
          });
        }
        else
        {
          alert(`Su mesa es la ${this.cliente.mesa}`);
        }
      });
    }
    else
    {
      if(!this.enMesa && this.cliente.espera)
      {
        this.verificarMesaAsignada();
      }
      else
      {
        if(!this.yaPidio && this.cliente.mesa !== '')
        {
          this.yaPidio = true;
            /////////////////////////se pondria el estadoPedido del cliente en 'en preparacion'
        }
        else
        {
          if(this.yaPidio)
          {
            //////////////////////////funcionalidad 8
          }
          else
          {
            if(!this.cliente.espera)
            {
              alert('primero debe estar en la lista de espera');////////////////////////////////////////////////
            }
          }
        }
      }
    }
  }

  verificarMesaAsignada()
  {
    let mesaJSON = JSON.parse(this.escaneado);
    let numeroMesa = mesaJSON.numero;

    if(numeroMesa === this.cliente.mesa)
    {
      console.log('es tu mesaaa');
      this.enMesa = true;              ////////////////////////////////////////////////////funcionalidad 6
    }
    else
    {
      console.log(`Esta no es su mesa, su mesa es la numero ${numeroMesa}`);
    }
  }

  tomarPedido(producto : any)
  {
    this.pedido.push(producto);
    this.totalPrecio += producto.precio;
    this.totalTiempo += producto.tiempo;
  }








  
  salir()
  {
    let usuario:any;

    this.clientes.forEach((u:any) => {
      if(this.user?.email === u.email)
      {
        usuario = u;
      }
    });

    this.authService.logout()?.then(()=>{
      this.push.cierreSesion(usuario, 'clientes');
      this.router.navigateByUrl('login');
    })
    .catch((err)=>{
      alert(JSON.stringify(err));
    });
  }
}