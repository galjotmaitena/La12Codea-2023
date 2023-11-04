import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Firestore } from '@angular/fire/firestore';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { FirestoreService } from 'src/app/services/firestore.service';
import { QrService } from 'src/app/services/qr.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {
  form: FormGroup;
  fotoCapturadas:any[] = [];
  fotosSubidas:any[] = [];
  urlQr:any;
  fotosRestantes = 3;
  nombreQr = '';
  nombrePr = '';

  nombre = '';
  descripcion = '';
  tiempo = '';
  precio = '';

  constructor(private push: PushService, private auth: AuthService, private qr: QrService, private firestore: Firestore, private angularFirestorage: AngularFireStorage, private formBuilder: FormBuilder) 
  {
    this.form = this.formBuilder.group(
      {
        nombre: ['', [Validators.required, this.letrasValidator()]],
        descripcion: ['', [Validators.required, this.letrasValidator()]],
        tiempo: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        precio: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      }
    );
  }

  ngOnInit() 
  { }

  subirTodo()
  {
    let obj = {nombre: this.nombre, descripcion: this.descripcion, tiempo: this.tiempo, precio: this.precio};
    this.urlQr = this.qr.generarCodigoQR(JSON.stringify(obj));
    let url = this.urlQr;

    try
    {
      const fecha = new Date().getTime();
      this.nombreQr = `productos/${obj.nombre.replace(" ", "_")}/qr_${fecha}`;
      this.nombrePr = `productos/${obj.nombre.replace(" ", "_")}/fotos/1`;

      this.subirQr(url)?.then(()=>
      {
        const promesa = this.angularFirestorage.ref(this.nombreQr).getDownloadURL().toPromise();
        promesa.then((urlQr)=>
        {
          this.subirFotos(this.fotoCapturadas[0])?.
          then(()=>
          {
            const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
            promesa.then((url1: any)=>
            {
              this.fotosSubidas.push(url1);
              this.nombrePr = `productos/${obj.nombre.replace(" ", "_")}/fotos/2`
              this.subirFotos(this.fotoCapturadas[1])?.then(()=>
              {
                const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
                promesa.then((url2: any)=>
                {
                  this.fotosSubidas.push(url2);
                  this.nombrePr = `productos/${obj.nombre.replace(" ", "_")}/fotos/3`
                  this.subirFotos(this.fotoCapturadas[2])?.then(()=>
                  {
                    const promesa = this.angularFirestorage.ref(this.nombrePr).getDownloadURL().toPromise();
                    promesa.then((url3: any)=>
                    {
                      this.fotosSubidas.push(url3);
                      FirestoreService.guardarFs('productos', {...obj, fotos: this.fotosSubidas, qr: urlQr}, this.firestore);
                      this.auth.mostrarToastExito("¡Alta realizada con éxito!");
                      this.push.sendPush('ok', '¡Alta realizada con éxito!');
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
      this.auth.mostrarToastError("Error al subir la foto...");
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
        this.auth.mostrarToastExito(`¡Foto cargada con éxito! Falta/n ${this.fotosRestantes}`)
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

  noWhitespaceValidator(): ValidatorFn 
  {
    return (control: AbstractControl): { [key: string]: any } | null => 
    {
      if (control.value && control.value.trim() === '') 
      {
        return { 'whitespace': true };
      }
      return null;
    };
  }

  letrasValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value) {
        const trimmedValue = value.trim();
        if (!/^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/.test(trimmedValue)) {
          return { 'invalido': true };
        }
      }
      return null;
    };
  }
}
