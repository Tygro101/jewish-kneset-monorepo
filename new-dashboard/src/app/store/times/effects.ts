import { Injectable } from "@angular/core";
import { createEffect, ofType, Actions } from "@ngrx/effects";
import { exhaustMap, map, catchError, EMPTY } from "rxjs";
import { getTimesAction, SetTimes, setTimesAction } from "./actions";
import { WebWorkerManager } from "@shared/core/services/workers/webWorkerManager.service";
import { CitiesEnum, TypedMap } from "@shared/core/services/workers/handlers/models/shared-models";
import { TimeResponse } from "@shared/models/times";

@Injectable()
export class TimesEffects {

  loadTimes$ = createEffect(() => this.actions$.pipe(
    ofType(getTimesAction),
    exhaustMap(() => this.workerManager.calculateTimes<TypedMap<TimeResponse>>({ date: new Date(), location: CitiesEnum.NETIVOT_NEVA_SHARON })
      .pipe(
        map(times => (setTimesAction({times}))),
        catchError(() => EMPTY)
      ))
    )
  );

  constructor(
    private actions$: Actions,
     private workerManager: WebWorkerManager ) {}
}