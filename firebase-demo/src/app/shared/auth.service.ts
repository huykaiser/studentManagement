import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fireauth : AngularFireAuth, private router : Router) { }

  //login method
  login(email: string, password :  string) {
    this.fireauth.signInWithEmailAndPassword(email, password).then((res) => {
      localStorage.setItem('token','true');
      
      if(res.user?.emailVerified==true){
        this.router.navigate(['dashboard']);
      }else{
        this.router.navigate(['verify-email']);
      }
    }, err => {
      alert(err.message);
      this.router.navigate(['/login']);
    });
  }

  //sign in with google
  googleSignIn(){
    return this.fireauth.signInWithPopup(new GoogleAuthProvider).then((res) => {
      this.router.navigate(['dashboard']);
      localStorage.setItem('token',JSON.stringify(res.user?.uid))
    }, err => {
      alert(err.message)
    });
  }

  //register method
  register(email: string,password: string) {
    this.fireauth.createUserWithEmailAndPassword(email,password).then((res) => {
      alert('Registration successful');
      this.router.navigate(['/login']);
      this.sendEmailForVarification(res.user);
    }, err => {
      alert(err.message);
      this.router.navigate(['/register']);
    });
  }

  //sign out
  logout(){
    this.fireauth.signOut().then(() => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
    });
  }

  //forgot password
  forgotPassword(email: string){
    this.fireauth.sendPasswordResetEmail(email).then(() => {
      this.router.navigate(['/verify-email']);
    }, err => {
      alert("something went wrong");
    });
  }

  //email verification
  sendEmailForVarification(user:any) {
    user.sendEmailForVarification().then((res:any) => {
      this.router.navigate(['/verify-email']);
    }, (err:any) => {
      alert('Soemthing went wrong. Not able to send email to your email.');
    })
  }

  

}
