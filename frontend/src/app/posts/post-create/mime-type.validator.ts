import { AbstractControl } from "@angular/forms";
import { Observer, Observable, of } from "rxjs";

// we can't just trust the name extension, we read the file and verify its type by the pattern
export const mimeTypeValidator = (control: AbstractControl): Promise<{[key: string]: any}> | Observable<{[key: string]: any}> => {
  if (typeof(control.value) === 'string') return of(null);  // unchanged image string url on updating

  const file = control.value as File;
  const fileReader = new FileReader();
  const fileObs = Observable.create((observer: Observer<{[key: string]: any}>) => {
    fileReader.addEventListener("loadend", () => {  // when done loading file
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = "";
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);  // to hex string
      }

      let isValid = false;
      switch (header) {  // check for valid file patterns
        case "89504e47":
          isValid = true;
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }

      if (isValid) {
        observer.next(null);  // valid, don't emit error
      } else {
        observer.next({ invalidMimeType: true })
      }
      observer.complete();  // indicate we're done
    });
    fileReader.readAsArrayBuffer(file);  // read file
  });
  return fileObs;
};