import { Component, Input } from '@angular/core';
import { TypedMap } from '@shared/core/services/workers/handlers/models/shared-models';
import { TimeResponse } from '@shared/models/times';
import { getSplicedTimes } from './helpers/methods';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './times.component.html',
  styleUrl: './times.component.scss'
})
export class TimesComponent {
  splicedKeys: { firstSet?: Array<string>; secondSet?: Array<string>; } = {};
  _times: TypedMap<TimeResponse>;


  @Input() set times(value: TypedMap<TimeResponse>){
    if(!value) return;
    this._times = value;
    this.setTimes(value);
  }

  setTimes(value: TypedMap<TimeResponse>) {
    const sortedKeys = Object.keys(value).sort((a, b)=> new Date(value[a].date).getTime()- new Date(value[b].date).getTime());
    this.splicedKeys = getSplicedTimes(sortedKeys);
    console.log(sortedKeys);
  }

}
