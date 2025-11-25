import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TimesComponent } from '@shared-angular/lib/components/times/times.component';
import { ClockComponent } from '@shared-angular/lib/components/clock/clock.component';
import { autoUnsubscribe } from '@shared-angular/lib/core/decorators/index';
import { isExist } from '@shared-angular/lib/core/pipes/index';
import { IRootState } from '../../store/models';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { getTimesSelector } from '../../store/times/selectors';
import { TimeResponse } from '@shared/models/times';
import { TypedMap } from '@shared/core/services/workers/handlers/models/shared-models';
import { AddFormComponent } from '../add-form/add-form.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ClockComponent, TimesComponent, AddFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @autoUnsubscribe
  subscriptions: Subscription;
  times: TypedMap<TimeResponse>;

  constructor(private store: Store<IRootState>){
    
  }
  ngOnInit(): void {
    this.subscriptions.add(this.store.pipe(isExist, select(getTimesSelector)).subscribe(res=>{
      this.times = res;
    }))
  }
}
