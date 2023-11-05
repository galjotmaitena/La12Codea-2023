import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { from } from 'rxjs';

@Component({
  selector: 'app-home-clientes',
  templateUrl: './home-clientes.page.html',
  styleUrls: ['./home-clientes.page.scss'],
})
export class HomeClientesPage implements OnInit {

  abierta = false;
  escaneado : any = '';
  ingreso = true;           ////////////////////////////////////////poner en false
  tieneMesa = false;          
  user = this.authService.get_user();                 ///////////////////////////////////funcionaaaaaa
  mensaje : string = '';

  observable : any;
  observablePedidos : any;

  listaProductos : any[] = [];

  constructor(private authService : AuthService, private firestore : Firestore, private firestoreService : FirestoreService) { }

  ngOnInit() 
  {
    this.observable=FirestoreService.traerFs('clientes', this.firestore).subscribe((data)=>{
      console.log(data);
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
        BarcodeScanner.showBackground();
        document.querySelector('body')?.classList.add('scanner-active');

        this.asignarEscan();

        this.abierta = false;
      }
    }
    catch(error)
    {
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
    // let ingresoJSON = JSON.parse(this.escaneado);                               SRIVEEEEEEEEEEEEE
    // this.ingreso = ingresoJSON.ingresarAlLocal;

    if(this.ingreso)
    {
      let usuario;

      console.log(this.user);
      // console.log(this.authService.get_user()?.email);




      ///////////podria llevar el buscarFs al ngOnInit, y que aca solo ponga al cliente en espera, y evalue ese estado constantemente

      FirestoreService.buscarFs('clientes', this.user?.email, this.firestore).then((data : any)=>{

        usuario = data;
        usuario.espera = true;

        // FirestoreService.guardarFs('listaEspera', usuario, this.firestore).then(()=>{
        //   this.mensaje = 'Esta en la lista de espera';
        // });

        if(usuario.espera)
        {
          this.mensaje = 'Esta en la lista de espera';
        }
        else
        {
          this.mensaje = 'Ya se le asigno la mesa';
        }

        console.log(usuario);
      }).catch(()=>{
        console.log('No se encontro');
      });
    }
  }

  verificarMesaAsignada(usuario : any)
  {
    let mesaJSON = JSON.parse(this.escaneado);
    let numeroMesa = mesaJSON.numero;

    if(numeroMesa === usuario.mesa)
    {
      console.log('es tu mesaaa');
      this.tieneMesa = true;              ////////////////////////////////////////////////////funcionalidad 6
    }
    else
    {
      console.log(`Esta no es su mesa, su mesa es la numero ${numeroMesa}`);
    }
  }
}
