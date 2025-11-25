import { filter, Observable } from "rxjs";

export const isExist = <T>(source: Observable<T>): Observable<T> =>{
    return source.pipe(filter(res=> !!res));
}