import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { FileMetaData } from 'src/app/model/file-meta-data';
import { DataService } from 'src/app/shared/data.service';
import { FileService } from 'src/app/shared/file.service';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent implements OnInit {
  selectedFiles !: FileList;
  currentFileUpload !: FileMetaData;
  percentage: number = 0;
  listOfFiles: FileMetaData[] = [];

  constructor(
    private fileService: FileService,
    private fireStorage: AngularFireStorage,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.getAllFiles();
  }

  selectFile(event: any) {
    this.selectedFiles = event.target.files;
  }

  uploadFile() {
    this.currentFileUpload = new FileMetaData(this.selectedFiles[0]);
    const path = 'Uploads/' + this.currentFileUpload.file.name;
    const storageRef = this.fireStorage.ref(path);
    const uploadTask = storageRef.put(this.selectedFiles[0]);

    uploadTask.snapshotChanges().pipe(finalize( () => {
      storageRef.getDownloadURL().subscribe(downloadLink => {
        this.currentFileUpload.id = '',
        this.currentFileUpload.url = downloadLink,
        this.currentFileUpload.size = this.currentFileUpload.file.size,
        this.currentFileUpload.name = this.currentFileUpload.file.name,

        this.fileService.saveMetaDataOfFile(this.currentFileUpload);
      })
      this.ngOnInit();
    })
    ).subscribe( (res: any) => {
      this.percentage = (res.bytesTransfered * 100 / res.totalBytes);
    }, err => {
      console.error('Error occurred');
    });
  }

  getAllFiles() {
    this.fileService.getAllFiles().subscribe( (res: any) => {
      this.listOfFiles = res.map((e: any) => {
        const data = e.payload.doc.data();
        data.id = e.payload.doc.id;
        return data;
      })
    }, err => {
      console.log('Error occurred while fetching file meta data');
    })
  }

  deleteFile(file: FileMetaData) {
    if(window.confirm('Are you sure you want to delete ' + file.name + '?')){
      this.fileService.deleteFile(file);
      this.ngOnInit();
    }   
  }

}
