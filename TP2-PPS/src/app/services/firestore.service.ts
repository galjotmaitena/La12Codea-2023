import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

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
}
