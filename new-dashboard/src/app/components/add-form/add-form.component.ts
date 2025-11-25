import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatDatepickerModule],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss'
})
export class AddFormComponent {
  formGroup: FormGroup = new FormGroup({});


  constructor(){
    this.formGroup.addControl('text', new FormControl('', [Validators.required]));
    this.formGroup.addControl('range', new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    }));
  }
}
