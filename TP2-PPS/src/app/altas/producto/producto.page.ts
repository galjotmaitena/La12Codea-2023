import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Firestore } from '@angular/fire/firestore';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QrService } from 'src/app/services/qr.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {
  json:any;

  constructor(private qr: QrService, private firestore: Firestore, private angularFirestorage: AngularFireStorage) { }

  ngOnInit() 
  {
    this.json = {};
  }

  guardarQr()
  {
    let url = this.qr.generarCodigoQR(JSON.stringify(this.json));

    if(url)
    {
      let obj = {nombre: "", descripcion: "", tiempo: 0, precio: 0, fotos: []};
      this.subirQr(obj, url);
    }
  }

  subirQr(obj:any, url:string)
  {
    try
    {
      const fecha = new Date().getTime();
      const storage = getStorage();
      const nombre = `productos/qr/${obj.nombre.replace(" ", "_")} ${fecha}`;/////////////CAMBIAR LOS OBJ. POR THIS.
      const storageRef = ref(storage, nombre);

      uploadString(storageRef as any, url as any, 'data_url').then(()=>{/////////////CAMBIAR LOS OBJ. POR THIS.
        const urlPromise = this.angularFirestorage.ref(nombre).getDownloadURL().toPromise();
        urlPromise.then((url2: any) => 
        {
          let obj_ = {...obj, qr: url2};
          FirestoreService.guardarFs('productos', obj_, this.firestore)
        });
      });
    }
    catch
    {
      //this.auth.mostrarToastError("Error al subir la foto...");
    }
  }
}
