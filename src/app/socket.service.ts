import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable, observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = 'https://chatapi.edwisor.com';

  private socket;

  constructor(public http:HttpClient) {
    //creating connection
    //Handshake 
    this.socket = io(this.url);
   }

   //Events to be listened
   
   public verifyUser = () => {
     return Observable.create((observer) => {
       this.socket.on('verifyUser', (data) => {
         observer.next(data);
       })//end socket
     })//end observable
   }//end verifyUser

   public onlineUserList = () => {
     return Observable.create((observer) => {
       this.socket.on('online-user-list', (userList) => {
         observer.next(userList);
       })
     })
   }

   public chatByUserId = (userId) => {
    return Observable.create((observer) => {   
      this.socket.on(userId, (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end chatByUserId

  public markChatAsSeen = (userDetails) => {
    this.socket.emit('mark-chat-as-seen', userDetails);
  } // end markChatAsSeen

   public SendChatMessage = (chatMsgObject) => {
    this.socket.emit('chat-msg', chatMsgObject);
  } // end getChatMessage

   public disconnectSocket = () => {
     return Observable.create((observer) => {
       this.socket.on('disconnect', () => {
         observer.next();
       })
     })
   }

   public getChat(senderId, receiverId, skip): Observable<any> {
    return this.http.get(`${this.url}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
      .do(data => console.log('Data Received'))
      .catch(this.handleError);
  } 

   //Events to be Emitted
   public setUser = (authToken) => {
     this.socket.emit("set-user", authToken)
   }

   public exitSocket = () =>{
    this.socket.disconnect();
  }// end exit socket


   private handleError(err: HttpErrorResponse) {
     let errorMessage = '';
     if (err.error instanceof Error) {
       errorMessage = `An error occured: ${err.error.message}`;
     } else {
       errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
     }
     console.error(errorMessage);
     return Observable.throw(errorMessage);
   }
}
