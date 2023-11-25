import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { PushService } from '../../services/push.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PagoService } from 'src/app/services/pago.service';

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

  pedidos : any[] = [];

  
  observable : any;
  observableProductos : any;
  observablePedidos : any;

  //////////////////////////////////

  abierta = false;
  escaneado : any = '';

  ingreso = true;           ////////////////////////////////////////poner en true para probar
  enMesa = true; /////////////////////////////////////////////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6
  yaPidio = false; /////////////////////////////////////////////////////////////////////////^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  user = this.authService.get_user();                 ///////////////////////////////////funcionaaaaaa
  mensaje : string = '';

  pedido : any[] = [];
  //pedidoFinal : any;
  importe = 0;
  totalTiempo = 0;

  estadoPedido = '';//////////////////////////////////////////////////

  cliente : any;


  muestro = '';
  selectedTab = 'tab1';

  encuestas : any[] = [];
  obsEncuestas : any;

  bebidas : any[] = [];
  comidas : any[] = [];
  postres : any[] = [];

  modalAbierto = false;
  recibido = false;

  miPedido : any;
  mostrarSpinner = false;

  constructor(private authService : AuthService, private firestore : Firestore, private push: PushService, private router: Router, private pagoService: PagoService) { }

  ngOnInit() 
  {

    this.observable = FirestoreService.traerFs('empleados', this.firestore).subscribe((data)=>{
      this.metres = [];
      data.forEach((e)=>{
        if(e.tipoEmpleado == "metre")
        {
          this.metres.push(e);
        }
      })
    });

    this.observable = FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      
      this.clientes = data;

      switch(this.user?.email){
        case null:
          data.forEach(c => {
            if(c.uid === this.user?.uid)
            {
              this.cliente = c;
            }
          });
          break;
        default:
          data.forEach(c => {
            if(c.email === this.user?.email)
            {
              this.cliente = c;
            }
          });
          break;
      }

      console.log("***************");
      console.log(this.cliente);
      console.log("***************");
    });

    this.observableProductos = FirestoreService.traerFs('productos', this.firestore).subscribe((data)=>{
      data.forEach(p => {
        switch(p.tipo)
        {
          case 'bebida':
            this.bebidas.push(p);
            break;
          case 'comida':
            this.comidas.push(p);
            break;
          case 'postre':
            this.postres.push(p);
            break;
        }
      });

      this.listaProductos = data;
    });

    this.observablePedidos = FirestoreService.traerFs('pedidos', this.firestore).subscribe((data)=>{
      this.pedidos = data;
    });

    this.obsEncuestas = FirestoreService.traerFs('encuestaClientes', this.firestore).subscribe((data)=>{
      this.encuestas = data;
    });

    // this.encuestas.push({cliente:'mai', experiencia:'adasdadadsadad'});
    //   this.encuestas.push({cliente:'mai', experiencia:'adasdadadsadad'});
    //   this.encuestas.push({cliente:'mai', experiencia:'adasdadadsadad'});
    //   this.encuestas.push({cliente:'mai', experiencia:'adasdadadsadad'});
    //   this.encuestas.push({cliente:'mai', experiencia:'adasdadadsadad'});
  }

  ngOnDestroy() : void 
  {
    this.stopScan();
    this.observable.unsubscribe();
    this.salir();
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
      //alert('permisos');
      //alert(error);
      ret = false;
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

      this.modalAbierto = false;
      this.abierta = true;
      await BarcodeScanner.hideBackground();
      document.querySelector('body')?.classList.add('scanner-active');
      const result = await BarcodeScanner.startScan();
      
      if(result?.hasContent)
      {
        this.escaneado = result.content;
        //alert(this.escaneado);

        BarcodeScanner.showBackground();
        document.querySelector('body')?.classList.add('scanner-active');

        let parse = JSON.parse(this.escaneado);
        this.asignarEscan(parse.propina == undefined);

        this.abierta = false;
      }
    }
    catch(error)
    {
      this.stopScan();
    }
  }

  async stopScan()
  {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
  }

  asignarEscan(accion: boolean)
  {
    if(accion)
    {
      if(!this.ingreso && this.cliente.mesa == '') /////////////////////////////////////
      {
        let ingresoJSON = JSON.parse(this.escaneado)
        if(ingresoJSON.ingresarAlLocal == undefined)
        {
          alert('Debe escanear el qr del ingreso al local.');
        }
        else
        {
          this.mostrarSpinner = true;
          this.ingreso = ingresoJSON.ingresarAlLocal;
          this.cliente.espera = true;
        
          FirestoreService.actualizarFs('clientes', this.cliente, this.firestore).then(()=>{
            this.mostrarSpinner = false;
            if(this.cliente.espera)
            {
              this.metres.forEach((m) => {
                this.push.sendPush("Clientes - Informacion", "Ha ingresado un nuevo cliente en la lista de espera", m)
              });
            }
            else
            {
              this.authService.mostrarToast(`Su mesa es la ${this.cliente.mesa}`, 'danger', 'bottom', 2000);//poner toast
            }
          });
        }
      }
      else
      {
        if(this.cliente.mesa !== '')//////////////////////////
        {
          if(this.verificarMesaAsignada())
          {
            this.enMesa = true;              ////////////////////////////////////////////////////funcionalidad 6
  
            if(this.yaPidio)
            {
              let pedido:any;
  
              this.pedidos.forEach(p => {
                if(this.cliente.mesa === p.mesa)
                {
                  pedido = p;
                  this.miPedido = p;
                }
              });
              
              if(pedido)
              {
                this.estadoPedido = pedido.estado;
  
                if(this.estadoPedido === 'entregado')
                {
                  this.modalAbierto = true;
                }
                else
                {
/*                   if(this.estadoPedido === 'recibido'/*  && this.modalAbierto )
                  {
                    let propinaJSON = JSON.parse(this.escaneado);                             
                    this.cliente.propina = propinaJSON.propina;
                    this.modalAbierto = true;
                    //this.cliente.propina = 15;
    
                    FirestoreService.actualizarFs('clientes', this.cliente, this.firestore).then(()=>{
                      this.authService.mostrarToastExito('Propina asignada');
                    });
                  } */
                }
              }
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
    else
    {
      if(this.estadoPedido === 'recibido')
      {
        this.mostrarSpinner = true;
        let propinaJSON = JSON.parse(this.escaneado);                             
        this.cliente.propina = propinaJSON.propina;
        this.modalAbierto = true;
        //this.cliente.propina = 15;

        FirestoreService.actualizarFs('clientes', this.cliente, this.firestore).then(()=>{
          this.mostrarSpinner = false;
          this.authService.mostrarToastExito('Propina asignada');
        });
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
      this.authService.mostrarToast(`${p.nombre} ha agregado a su pedido.`, 'success', 'top',2000);
      this.importe += p.precio;
    }
    else
    {
      let index = this.pedido.indexOf(p);
      let esta = index !== -1 ? true : false;

      if(!esta)
      {
        this.authService.mostrarToast(`${p.nombre} no se encuentra en su pedido.`, 'danger', 'top',2000);
      }
      else
      {
        this.pedido.splice(index, 1);
        this.importe -= p.precio;
        this.authService.mostrarToast(`${p.nombre} ha sido eliminado de su pedido..`, 'danger', 'top',2000);

      }
    }

    let tiempo = 0;

    this.pedido.forEach((pr : any)=>{
      if(pr.tiempo > tiempo)
      {
        tiempo = pr.tiempo;
      }
    });

    this.totalTiempo = tiempo;
  }

  enviarPedido()
  {
    this.mostrarSpinner = true;
    if(this.pedido.length > 0)
    {
      let obj = {mesa: this.cliente.mesa, productos: this.pedido, estado: 'pendiente', cocina: false, bar: false, precio: this.importe};
      this.estadoPedido = 'pendiente';
      FirestoreService.guardarFs('pedidos', obj, this.firestore);
      this.mostrarSpinner = false;
      this.authService.mostrarToastExito('Pedido cargado correctamente');
      this.yaPidio = true;
    }
    else
    {
      setTimeout(()=>{
        this.mostrarSpinner = false;
        this.authService.mostrarToastError('Aun no hay productos cargados.');
      }, 2000);
    }
  }



  pagar()
  {
    let pedido:any;

    this.pedidos.forEach((p)=>{
      if(this.cliente.mesa === p.mesa)
      {
        pedido = p;
      }
    });

    if(pedido)
    {
      const returnUrl = window.location.href;
      const item = {
        id: pedido.id,
        title: '1989s',
        quantity: 1,
        unit_price: this.importe + this.calcularTotal(this.cliente.propina) - this.calcularTotal(this.cliente.descuento),
      };
  
      const producto = {
        items: [item],
      };
  
      this.pagoService.obtenerURLPago(producto, returnUrl).subscribe(
      (respuesta) => {
        console.log('URL de pago:', respuesta);
        window.location.href = respuesta.init_point;
        pedido.estado = "pagado";
        FirestoreService.actualizarFs('pedidos', pedido, this.firestore);
      },
      (error) => {
        console.error('Error al obtener la URL de pago:', error);
      });
    }

    this.modalAbierto = false;
    this.estadoPedido = pedido.estado;
  }

  confirmar()
  {
    let pedido:any;

    this.pedidos.forEach(p => {
      if(this.cliente.mesa === p.mesa)
      {
        pedido = p;
      }
    });

    this.mostrarSpinner = true;
    pedido.estado = 'recibido';
    this.estadoPedido = pedido.estado;
    FirestoreService.actualizarFs('pedidos', pedido, this.firestore).then(()=>{
      this.mostrarSpinner = false;
      this.modalAbierto = false;
    });
  }

  calcularTotal(descuento : number) : number
  {
    let total = 0;

    total = (this.miPedido.precio * descuento) / 100;

    return total;
  }

  salir()
  {
    this.mostrarSpinner = true;
    this.authService.logout()?.then(()=>{
      this.push.cierreSesion(this.cliente, 'clientes');
      if(this.cliente.perfil === 'anonimo' )
      {
        FirestoreService.eliminarFs('clientes', this.cliente, this.firestore).toPromise().then(()=>{
          this.mostrarSpinner = false;
          this.router.navigateByUrl('login');
        });
      }
      else
      {
        setTimeout(()=>{
          this.router.navigateByUrl('login');
          this.mostrarSpinner = false
        }, 2000);
      }
    })
    .catch((err)=>{
      this.mostrarSpinner = false;
      this.authService.mostrarToastError('Error...')
    });
  }

  irA(path: string)
  {
    this.mostrarSpinner = true;
    setTimeout(()=>{
      this.router.navigateByUrl(path);
      this.mostrarSpinner = false;
    }, 2500)
  }
}

