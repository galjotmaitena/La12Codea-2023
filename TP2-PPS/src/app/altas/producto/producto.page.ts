import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Firestore } from '@angular/fire/firestore';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QrService } from 'src/app/services/qr.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {
  json:any;//contenido qr
  fotoCapturadas:any[] = [];
  fotosSubidas:any[] = [];
  urlQr:any;
  fotosRestantes = 3;
  nombreQr = '';
  nombrePr = '';

  constructor(private auth: AuthService, private qr: QrService, private firestore: Firestore, private angularFirestorage: AngularFireStorage) { }

  ngOnInit() 
  {
    this.json = {probando: true};
    this.auth.login('algo@algo.com','123456');
  }

  guardar()
  {
    this.urlQr = this.qr.generarCodigoQR(JSON.stringify(this.json));

    if(this.urlQr)
    {
      let obj = {nombre: "prueba", descripcion: "necesito que ande", tiempo: 100, precio: 100};
      this.subirTodo(obj, this.urlQr);
    }
  }

  subirTodo(obj:any, url:string)
  {
    try
    {
      const fecha = new Date().getTime();
      this.nombreQr = `productos/${obj.nombre.replace(" ", "_")}/qr_${fecha}`;/////////////CAMBIAR LOS OBJ. POR THIS.
      this.nombrePr = `productos/${obj.nombre.replace(" ", "_")}/fotos/1`;/////////////CAMBIAR LOS OBJ. POR THIS.

      this.subirQr(url)?.then(()=>
      {
        const promesa = this.angularFirestorage.ref(this.nombreQr).getDownloadURL().toPromise();
        promesa.then((urlQr)=>
        {
          this.subirFotos(this.fotoCapturadas[0])?.
          then(()=>
          {
            const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
            promesa.then((url: any)=>
            {
              this.fotosSubidas.push(url);
              this.nombrePr = `productos/${obj.nombre.replace(" ", "_")}/fotos/2`
              this.subirFotos(this.fotoCapturadas[1])?.then(()=>
              {
                const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
                promesa.then((url: any)=>
                {
                  this.fotosSubidas.push(url);
                  this.nombrePr = `productos/${obj.nombre.replace(" ", "_")}/fotos/3`
                  this.subirFotos(this.fotoCapturadas[2])?.then(()=>
                  {
                    const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
                    promesa.then((url: any)=>
                    {
                      this.fotosSubidas.push(url);
                      FirestoreService.guardarFs('productos', {...obj, fotos: this.fotosSubidas, qr: urlQr}, this.firestore);
                      this.auth.mostrarToastExito("¡Alta realizada con éxito!");
                    });
                  });
                });
              });
            });
          });
        })
      });
    }
    catch
    {
      //this.auth.mostrarToastError("Error al subir la foto...");
    }
  }

  async sacarFotos()
  {
    try
    {
      if(this.fotosRestantes > 0)
      {
        let fotoCapturada = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 100,
          webUseInput: true,
        });
  
        this.fotoCapturadas.push(fotoCapturada.dataUrl);
        this.fotosRestantes--;
        console.log(this.fotoCapturadas);
        this.auth.mostrarToastExito("¡Foto cargada con éxito!")
      }
      else
      {
        this.auth.mostrarToastError('¡Ya tomó las tres fotos!');
      }
    }
    catch(error)
    {
      console.error('error: ' + error);
    }
  }

  subirQr(url:string)
  {
    try
    {
      const storage = getStorage();
      const storageRefQr = ref(storage, this.nombreQr);
      return uploadString(storageRefQr as any, url as any, 'data_url');
    }
    catch(error)
    {
      console.log("error" + error)
      return;
    }
  }

  subirFotos(url:any)
  {
    try
    {
      const storage = getStorage();
      const storageRef = ref(storage, this.nombrePr);
      return uploadString(storageRef as any, url as any, 'data_url');
    }
    catch(error)
    {
      console.log("error" + error);
      return;
    }
  }
}
