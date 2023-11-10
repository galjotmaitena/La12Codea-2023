import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { PushService } from '../../services/push.service';
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
  mesas : any[] = [];

  observable : any;
  observablePedidos : any;

  //////////////////////////////////

  abierta = false;
  escaneado : any = '';

  ingreso = false;           ////////////////////////////////////////poner en true para probar
  enMesa = true; /////////////////////////////////////////////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6
  yaPidio = false; 

  user = this.authService.get_user();                 ///////////////////////////////////funcionaaaaaa
  mensaje : string = '';

  pedido : any[] = [];
  importe = 0;
  totalTiempo = 0;

  estadoPedido = '';//////////////////////////////////////////////////

  cliente : any;


  muestro = '';
  selectedTab = '';

  abrirChat = false;

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

    if(!this.ingreso) /////////////////////////////////////
      {
        let ingresoJSON = JSON.parse(this.escaneado);                             
            this.ingreso = ingresoJSON.ingresarAlLocal;
            this.cliente.espera = true;
      
            FirestoreService.actualizarFs('clientes', this.cliente, this.firestore).then(()=>{
              if(this.cliente.espera)
              {
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
        if(this.cliente.mesa !== '')
        {
          if(this.verificarMesaAsignada())
          {
            this.enMesa = true;              ////////////////////////////////////////////////////funcionalidad 6
            let mesa : any;

            this.mesas.forEach(m => {
              if(m.numero === this.cliente.mesa)
              {
                mesa = m;
              }
            });

            if(this.yaPidio)
            {
              this.estadoPedido = mesa.estadoPedido;
            }
            else
            {
              this.authService.mostrarToastError('Debe realizar el pedido');
            }
          }
          else
          {
            this.authService.mostrarToastError(`Esta no es su mesa, su mesa es la número ${this.cliente.mesa}`);
          }
        }
        else
        {
          this.authService.mostrarToastError('Tiene que escanear el QR respectivo, para ingresar a la lista de espera');
        }
      }
  }

  verificarMesaAsignada() : boolean
  {
    let retorno = false;
    let mesaJSON = JSON.parse(this.escaneado);
    let numeroMesa = mesaJSON.numero;

    if(numeroMesa === this.cliente.mesa)
    {
      retorno = true;
    }

    return retorno;
  }

  elegirProducto(accion: boolean, p: any)
  {
    if(accion)
    {
      this.pedido.push(p);
      this.authService.mostrarToastExito(p.nombre + " ha agregado a su pedido.");
      this.importe += p.precio;
    }
    else
    {
      let index = this.pedido.indexOf(p);
      let esta = index !== -1 ? true : false;

      if(!esta)
      {
        this.authService.mostrarToastError(p.nombre + " no se encuentra en su pedido.");
      }
      else
      {
        this.pedido.splice(index, 1);
        this.importe -= p.precio;
        this.authService.mostrarToastExito(p.nombre + " ha sido eliminado de su pedido.");
      }
    }

/*     if(this.pedido.length === 1)
    {
      this.totalTiempo = this.pedido[0].tiempo;
    }
    else
    {
      let tiempo = 0;

      this.pedido.forEach((pr)=>{
        if(pr.tiempo > tiempo)
        {
          tiempo = pr.tiempo;
        }
      });

      this.totalTiempo = tiempo;
    } */
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
