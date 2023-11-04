import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private dataSubject = new BehaviorSubject<any[]>([]);
  data$ = this.dataSubject.asObservable();

  static guardarFs(col: string, params:any, firestore: Firestore)
  {   
    let coleccion = collection(firestore, col);
    addDoc(coleccion, params);
    return params;
  }

  static traerFs(col: string, firestore: Firestore): Observable<any[]>
  {
    const colRef = collection(firestore, col);
    return collectionData(colRef, {idField: 'id'}) as Observable<any[]>;
  }



   static async actualizarFs(col: string, obj: any, firestore: Firestore) 
  {
      const docRef = doc(firestore, col, obj.id);
  
      try 
      {
        await updateDoc(docRef, obj);
        return 'Registro actualizado correctamente.';
      } 
      catch (error) 
      {
        console.error('Error al actualizar el registro en Firestore:', error);
        throw error;
      }
  } 

  static buscarFs(col : string, email : any, firestore : Firestore)
  {
    return new Promise((resolve, reject) => {
      let promesa = FirestoreService.traerFs(col, firestore).toPromise();
      
      
      promesa.then((data : any) => {
        let usuario = null;
  
        data.forEach((obj : any) => {
          if (obj.email === email) {
            usuario = obj;
          }
        });
  
        resolve(usuario);
      });
    });
  }

  

}

